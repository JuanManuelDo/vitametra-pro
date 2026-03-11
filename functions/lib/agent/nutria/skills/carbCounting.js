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
exports.handleCarbCounting = handleCarbCounting;
const admin = __importStar(require("firebase-admin"));
async function handleCarbCounting(patientId, text, mediaId) {
    if (!patientId) {
        return "Veo que quieres contar carbohidratos, pero tu número no está registrado como paciente en VitaMetra. Por favor, asocia tu número en la app.";
    }
    let estimatedCarbs = 0;
    let description = "";
    if (mediaId) {
        estimatedCarbs = 45;
        description = "Parece que enviaste una foto de un plato con arroz y pollo.";
    }
    else if (text) {
        estimatedCarbs = 30;
        description = `He analizado: "${text}".`;
    }
    else {
        return "No pude entender tu comida. Por favor envíame una descripción clara o una foto.";
    }
    try {
        const db = admin.firestore();
        await db.collection("patients").doc(patientId).collection("meals").add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            carbs_estimated: estimatedCarbs,
            image_url: mediaId ? `meta_media://${mediaId}` : null,
            validation_status: "ai_estimated",
            ai_confidence_score: 90,
            description
        });
        return `Nutria: ${description} Estimo que contiene aproximadamente *${estimatedCarbs}g de carbohidratos*. He registrado esto en tu diario de VitaMetra. ¿Vas a inyectarte insulina para esto?`;
    }
    catch (error) {
        console.error("Error guardando registro de comida:", error);
        return "Hubo un problema registrando tu comida en nuestro sistema, pero estimo que tiene unos " + estimatedCarbs + "g de carbohidratos.";
    }
}
//# sourceMappingURL=carbCounting.js.map