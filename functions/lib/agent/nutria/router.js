"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeNutriaIntent = routeNutriaIntent;
const sender_1 = require("../../interfaces/whatsapp/sender");
const admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
async function routeNutriaIntent(senderPhone, message, wabaNumberId) {
    const db = admin.firestore();
    let patientId = null;
    const snapshot = await db.collection("patients").where("whatsapp_number", "==", senderPhone).limit(1).get();
    if (!snapshot.empty) {
        patientId = snapshot.docs[0].id;
    }
    if (patientId) {
        await logInteraction(patientId, senderPhone, message);
    }
    let responseText = "Hola, soy Nutria. Aún estoy aprendiendo, pero puedo procesar tus comandos básicos.";
    if (message.type === "text" && message.text) {
        const textLower = message.text.toLowerCase();
        if (textLower.includes("carbohidrato") || textLower.includes("comí")) {
            responseText = "Entendido, quieres registrar una comida. Por favor, ¿podrías ser más específico con las cantidades, o enviarme una foto?";
        }
        else if (textLower.includes("glucosa") || textLower.includes("azúcar") || textLower.includes("mg/dl")) {
            responseText = "Entendido, registrando tu nivel de glucosa. ¿A qué hora fue la medición?";
        }
        else {
            responseText = `He recibido tu mensaje textual: "${message.text}". ¿En qué más puedo ayudarte? (Envía foto de comida, audio, o registro de glucemia)`;
        }
    }
    else if (message.type === "image") {
        responseText = "Recibí tu imagen. Nutria analizará los carbohidratos en breve.";
    }
    else if (message.type === "audio") {
        responseText = "Recibí tu nota de voz. Procesando...";
    }
    await (0, sender_1.sendWhatsAppMessage)(senderPhone, wabaNumberId, responseText);
}
async function logInteraction(patientId, phone, message) {
    const db = admin.firestore();
    const sessionRef = db.collection("patients").doc(patientId).collection("nutria_sessions").doc("latest");
    await sessionRef.set({
        lastInteraction: admin.firestore.FieldValue.serverTimestamp(),
        status: "active",
    }, { merge: true });
    await sessionRef.collection("messages").add({
        type: message.type,
        text: message.text || null,
        mediaId: message.mediaId || null,
        timestamp: message.timestamp,
        direction: "inbound",
        created_at: admin.firestore.FieldValue.serverTimestamp()
    });
}
//# sourceMappingURL=router.js.map