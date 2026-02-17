import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https"; 
import express from "express";
import cors from "cors";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
const app = express();

const whitelist = [
  'https://vitametra.com', 
  'https://vitametras.web.app', 
  'https://vitametras.firebaseapp.com',
  'https://vitametra-pro.web.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin: any, callback: any) => {
    if (!origin || whitelist.indexOf(origin) !== -1 || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Error de seguridad VitaMetra.'));
    }
  },
  credentials: true
}) as any);

app.use(express.json());

app.post('/processPayment', async (req: any, res: any) => {
    try {
        const { token, issuer_id, payment_method_id, installments, planId, amount, userId, email } = req.body;

        if (!token || !userId || !amount) {
            return res.status(400).json({ success: false, error: "Datos incompletos." });
        }

        // Recuperamos el Secret configurado en Firebase
        const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

        console.log(`[PAYMENT START] UID: ${userId} | Plan: ${planId} | Amount: ${amount}`);

        const mpResponse = await axios.post(
            "https://api.mercadopago.com/v1/payments",
            {
                token,
                issuer_id,
                payment_method_id,
                transaction_amount: Number(amount),
                installments: Number(installments),
                description: `Vitametra Plan: ${planId}`,
                payer: { email: email || 'usuario@vitametra.com' },
                // Importante para reconciliación de datos
                metadata: { user_id: userId, plan_id: planId }
            },
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                    "X-Idempotency-Key": uuidv4()
                }
            }
        );

        const paymentData = mpResponse.data;

        if (paymentData.status === 'approved') {
            const userRef = db.collection("users").doc(userId);
            const batch = db.batch();

            // Cálculo de días según plan
            let days = 30;
            if (planId === 'quarterly') days = 90;
            if (planId === 'annual') days = 365;

            batch.update(userRef, {
                subscription_tier: 'PRO',
                is_premium: true,
                premium_until: Timestamp.fromDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000)),
                last_payment_id: paymentData.id,
                plan_active: planId,
                updatedAt: FieldValue.serverTimestamp()
            });

            // Log de auditoría
            const auditRef = db.collection("logs_pagos").doc(paymentData.id.toString());
            batch.set(auditRef, {
                userId,
                paymentId: paymentData.id,
                amount: amount,
                status: 'approved',
                planId: planId,
                timestamp: FieldValue.serverTimestamp()
            });

            await batch.commit();
            console.log(`[PAYMENT SUCCESS] UID: ${userId} ahora es PRO.`);
            return res.status(200).json({ success: true, status: 'approved', transactionId: paymentData.id });
        } else {
            console.log(`[PAYMENT REJECTED] Status: ${paymentData.status} | Detail: ${paymentData.status_detail}`);
            return res.status(200).json({ 
                success: false, 
                status: paymentData.status, 
                error: "El pago fue rechazado por la entidad bancaria." 
            });
        }

    } catch (error: any) {
        console.error("[ERROR MP FATAL]:", error.response?.data || error.message);
        return res.status(500).json({ success: false, error: "Error en el motor de pagos. Intente más tarde." });
    }
});

// Exportamos la API usando Secrets para mayor seguridad
export const api = onRequest({ 
    secrets: ["MP_ACCESS_TOKEN"],
    cors: true // Habilitamos CORS nativo de 2nd Gen también
}, app as any);