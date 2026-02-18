"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_1.getFirestore)();
const app = (0, express_1.default)();
const whitelist = [
    'https://vitametra.com',
    'https://vitametras.web.app',
    'https://vitametras.firebaseapp.com',
    'https://vitametra-pro.web.app',
    'http://localhost:5173'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || whitelist.indexOf(origin) !== -1 || origin.includes('localhost')) {
            callback(null, true);
        }
        else {
            callback(new Error('CORS Policy: Error de seguridad VitaMetra.'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
app.post('/processPayment', async (req, res) => {
    try {
        const { token, issuer_id, payment_method_id, installments, planId, amount, userId, email } = req.body;
        if (!token || !userId || !amount) {
            return res.status(400).json({ success: false, error: "Datos incompletos." });
        }
        const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
        console.log(`[PAYMENT START] UID: ${userId} | Plan: ${planId} | Amount: ${amount}`);
        const mpResponse = await axios_1.default.post("https://api.mercadopago.com/v1/payments", {
            token,
            issuer_id,
            payment_method_id,
            transaction_amount: Number(amount),
            installments: Number(installments),
            description: `Vitametra Plan: ${planId}`,
            payer: { email: email || 'usuario@vitametra.com' },
            metadata: { user_id: userId, plan_id: planId }
        }, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "X-Idempotency-Key": (0, uuid_1.v4)()
            }
        });
        const paymentData = mpResponse.data;
        if (paymentData.status === 'approved') {
            const userRef = db.collection("users").doc(userId);
            const batch = db.batch();
            let days = 30;
            if (planId === 'quarterly')
                days = 90;
            if (planId === 'annual')
                days = 365;
            batch.update(userRef, {
                subscription_tier: 'PRO',
                is_premium: true,
                premium_until: firestore_1.Timestamp.fromDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000)),
                last_payment_id: paymentData.id,
                plan_active: planId,
                updatedAt: firestore_1.FieldValue.serverTimestamp()
            });
            const auditRef = db.collection("logs_pagos").doc(paymentData.id.toString());
            batch.set(auditRef, {
                userId,
                paymentId: paymentData.id,
                amount: amount,
                status: 'approved',
                planId: planId,
                timestamp: firestore_1.FieldValue.serverTimestamp()
            });
            await batch.commit();
            console.log(`[PAYMENT SUCCESS] UID: ${userId} ahora es PRO.`);
            return res.status(200).json({ success: true, status: 'approved', transactionId: paymentData.id });
        }
        else {
            console.log(`[PAYMENT REJECTED] Status: ${paymentData.status} | Detail: ${paymentData.status_detail}`);
            return res.status(200).json({
                success: false,
                status: paymentData.status,
                error: "El pago fue rechazado por la entidad bancaria."
            });
        }
    }
    catch (error) {
        console.error("[ERROR MP FATAL]:", error.response?.data || error.message);
        return res.status(500).json({ success: false, error: "Error en el motor de pagos. Intente más tarde." });
    }
});
exports.api = (0, https_1.onRequest)({
    secrets: ["MP_ACCESS_TOKEN"],
    cors: true
}, app);
//# sourceMappingURL=index.js.map