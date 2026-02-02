
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import Stripe from "stripe";

// Inicialización de Firebase
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const app = express();

// --- CONFIGURACIÓN DE SEGURIDAD & CORS ---
const whitelist = ['https://vitametra.com', 'https://vitametras.web.app', 'https://vitametras.firebaseapp.com'];
const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (!origin || whitelist.indexOf(origin) !== -1 || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Dominio no autorizado por VitaMetra Security.'));
    }
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions) as any);
app.use(express.json());

// Middleware para forzar JSON y evitar error "Unexpected token <"
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

/**
 * ENDPOINT: Procesar Pago Google Pay vía Stripe
 * Este endpoint recibe el token de Google Pay y ejecuta el cargo.
 */
app.post('/processGooglePayStripe', async (req, res) => {
    // Captura global de errores para evitar respuestas HTML
    try {
        const { paymentToken, amount, currency, userId } = req.body;

        // 1. Validaciones Básicas
        if (!paymentToken || !userId || !amount) {
            return res.status(400).json({ 
                success: false, 
                error: "Datos de transacción insuficientes (Token/UID faltante)." 
            });
        }

        // 2. Inicializar Stripe (Uso de Secrets Manager recomendado)
        // El API Key debe configurarse en Firebase: firebase functions:secrets:set STRIPE_SECRET_KEY
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
            apiVersion: '2025-01-27' as any,
        });

        console.log(`[FINTECH LOG] Iniciando cargo Stripe para UID: ${userId}`);

        // 3. Crear el Cargo en Stripe
        const charge = await stripe.charges.create({
            amount: Math.round(amount * 100), // Stripe usa centavos
            currency: currency || 'usd',
            source: paymentToken,
            description: `VitaMetra PRO - Suscripción de ${userId}`,
            metadata: { userId }
        });

        if (charge.status === 'succeeded') {
            // 4. Actualización Atómica en Firestore
            const userRef = db.collection("users").doc(userId);
            const batch = db.batch();

            batch.update(userRef, {
                subscription_tier: 'PRO',
                is_premium: true,
                premium_until: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
                last_payment_id: charge.id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Registro en auditoría
            const auditRef = db.collection("logs_pagos").doc();
            batch.set(auditRef, {
                userId,
                stripeId: charge.id,
                amount,
                status: 'SUCCESS',
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            await batch.commit();

            return res.status(200).json({ 
                success: true, 
                message: "Suscripción activada con éxito.",
                transactionId: charge.id
            });
        } else {
            throw new Error(`Stripe retornó estatus: ${charge.status}`);
        }

    } catch (error: any) {
        console.error("[CRITICAL PAYMENT ERROR]:", error.message);
        
        // Manejo de errores específicos de Stripe para el frontend
        const errorMessage = error.type === 'StripeCardError' 
            ? "Tu tarjeta fue rechazada. Por favor verifica los datos." 
            : "Error interno en la pasarela de pagos.";

        return res.status(500).json({ 
            success: false, 
            error: errorMessage,
            code: error.code || 'PAYMENT_ENGINE_FAIL'
        });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Cloud Gateway VitaMetra activo en puerto ${PORT}`);
});
