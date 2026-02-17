const { onCall, HttpsError, onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { MercadoPagoConfig, Payment } = require("mercadopago");

// Importamos la lógica de procesamiento (Asegúrate de haber creado importData.js)
const { processFile } = require("./importData");

if (admin.apps.length === 0) {
    admin.initializeApp();
}

// Configuración Mercado Pago
const client = new MercadoPagoConfig({ 
    accessToken: "APP_USR-5085620590656834-010519-75f9c2645782ba627abd3c72de22fe8a-3113708019" 
});

/**
 * 1. processPayment: Llamada desde el Frontend
 */
exports.processPayment = onCall({ 
    region: "us-central1",
    cors: [/vitametras\.com$/, /localhost:5173$/],
    maxInstances: 10
}, async (request) => {
    const uid = request.auth?.uid;
    const email = request.auth?.token?.email;

    if (!uid) throw new HttpsError('unauthenticated', 'Usuario no identificado.');

    const { token, issuer_id, payment_method_id, installments, planId } = request.data;
    const PLAN_PRICES = { 'monthly': 6990, 'quarterly': 18990, 'annual': 69900 };
    
    const payment = new Payment(client);

    try {
        const body = {
            token,
            issuer_id,
            payment_method_id,
            transaction_amount: PLAN_PRICES[planId] || 6990,
            installments: Number(installments),
            description: `Vitametra PRO - Plan ${planId}`,
            external_reference: uid,
            payer: { email: email },
            metadata: { 
                firebase_uid: uid, 
                plan_type: planId 
            },
            notification_url: "https://mercadopagowebhook-pe6bb56yhq-uc.a.run.app"
        };

        const response = await payment.create({ body });
        
        if (response.status === "approved") {
            await activateProFeatures(uid, planId, response.id);
        }

        return { status: response.status, id: response.id };
    } catch (error) {
        console.error("MP ERROR:", error);
        return { status: "rejected", message: error.message };
    }
});

/**
 * 2. mercadoPagoWebhook: Escucha notificaciones de MP
 */
exports.mercadoPagoWebhook = onRequest({
    region: "us-central1",
    cors: true 
}, async (req, res) => {
    const paymentId = req.query.id || (req.body.data && req.body.data.id);
    const type = req.query.topic || req.body.type;

    try {
        if (type === "payment" || type === "payment.created") {
            const payment = new Payment(client);
            const data = await payment.get({ id: paymentId });

            if (data.status === "approved") {
                const uid = data.external_reference;
                const planId = data.metadata.plan_type;
                await activateProFeatures(uid, planId, paymentId);
            }
        }
        res.status(200).send("OK");
    } catch (error) {
        console.error("WEBHOOK ERROR:", error);
        res.status(200).send("OK_ERROR"); 
    }
});

/**
 * 3. importMedicalReport: NUEVA FUNCIÓN PARA IMPORTAR PDF/CSV
 * Recibe el archivo en Base64 desde el frontend
 */
exports.importMedicalReport = onCall({
    region: "us-central1",
    maxInstances: 5,
    memory: "512MiB" // Aumentamos memoria para procesar PDFs
}, async (request) => {
    // 1. Verificación de Seguridad
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'Acceso denegado.');

    const { fileBase64, fileName, fileType } = request.data;
    
    if (!fileBase64) throw new HttpsError('invalid-argument', 'No se recibió el archivo.');

    try {
        // Convertir Base64 a Buffer (Node.js)
        const fileBuffer = Buffer.from(fileBase64, 'base64');
        
        // Ejecutar la lógica de parsing y deduplicación en importData.js
        const result = await processFile(uid, fileBuffer, fileType);

        return { 
            success: true, 
            message: "Reporte procesado exitosamente",
            processedEntries: result?.count || 0 
        };
    } catch (error) {
        console.error("IMPORT ERROR:", error);
        throw new HttpsError('internal', error.message || 'Error procesando el documento.');
    }
});

/**
 * Lógica de activación unificada en Firestore
 */
async function activateProFeatures(uid, planId, paymentId) {
    const expiry = new Date();
    if (planId === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
    else if (planId === 'quarterly') expiry.setMonth(expiry.getMonth() + 3);
    else expiry.setFullYear(expiry.getFullYear() + 1);

    const userRef = admin.firestore().collection("users").doc(uid);
    
    await userRef.update({
        subscription_tier: "PRO",
        ia_credits: 9999,
        premium_until: expiry.toISOString(),
        subscription: {
            status: "active",
            planId: planId,
            lastPaymentId: paymentId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
    });
}