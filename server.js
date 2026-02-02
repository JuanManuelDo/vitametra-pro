
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!admin.apps.length) {
  admin.initializeApp({ projectId: "gen-lang-client-0587114750" });
}
const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 8080;

const whitelist = ['https://vitametra.com', 'https://vitametras.web.app', 'https://vitametras.firebaseapp.com'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || whitelist.indexOf(origin) !== -1 || origin.includes('localhost')) {
            callback(null, true);
        } else {
            callback(new Error('Restricted by VitaMetra Security Policy.'));
        }
    }
}));

app.use(express.json());

/**
 * PROCESAMIENTO STRIPE (Optimizado para CLP)
 */
app.post('/api/processGooglePayStripe', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        const { paymentToken, amount, currency, userId } = req.body;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: '2025-01-27' as any });

        // Stripe maneja centavos para USD, pero para CLP el monto es directo (Zero-decimal currency)
        const isZeroDecimal = ['clp', 'jpy', 'krw'].includes(currency.toLowerCase());
        const stripeAmount = isZeroDecimal ? Math.round(amount) : Math.round(amount * 100);

        const charge = await stripe.charges.create({
            amount: stripeAmount,
            currency: currency || 'clp',
            source: paymentToken,
            description: `VitaMetra PRO - ${userId}`,
            metadata: { userId }
        });

        if (charge.status === 'succeeded') {
            await db.collection("users").doc(userId).update({
                subscription_tier: 'PRO',
                is_premium: true,
                premium_until: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return res.json({ success: true, transactionId: charge.id });
        }
        throw new Error("Charge failed");
    } catch (error) {
        console.error("Stripe Charge Error:", error.message);
        return res.status(500).json({ success: false, error: "Fallo en el servidor de pagos." });
    }
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: "API Endpoint not found" });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Fintech Core Server: http://localhost:${PORT}`);
});
