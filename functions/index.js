const { onCall, HttpsError, onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { MercadoPagoConfig, Payment } = require("mercadopago");

if (admin.apps.length === 0) {
    admin.initializeApp();
}

// Configuración con tu Access Token de producción (necesario para validar pagos de sandbox también)
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
            // URL ACTUALIZADA SEGÚN TU ÚLTIMO DEPLOY EXITOSO
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
    // Mercado Pago envía el ID de formas distintas según el evento
    const paymentId = req.query.id || (req.body.data && req.body.data.id);
    const type = req.query.topic || req.body.type;

    console.log(`WEBHOOK RECIBIDO: Tipo=${type}, ID=${paymentId}`);

    try {
        if (type === "payment" || type === "payment.created") {
            const payment = new Payment(client);
            const data = await payment.get({ id: paymentId });

            if (data.status === "approved") {
                const uid = data.external_reference;
                const planId = data.metadata.plan_type;
                
                console.log(`ACTIVACIÓN WEBHOOK: Usuario ${uid} a plan ${planId}`);
                await activateProFeatures(uid, planId, paymentId);
            }
        }
        // Siempre responder 200 para que MP deje de enviar la notificación
        res.status(200).send("OK");
    } catch (error) {
        console.error("WEBHOOK ERROR:", error);
        res.status(200).send("OK_ERROR"); 
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