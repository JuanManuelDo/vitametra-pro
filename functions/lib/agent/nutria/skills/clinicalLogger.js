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
exports.handleClinicalLogger = handleClinicalLogger;
const admin = __importStar(require("firebase-admin"));
async function handleClinicalLogger(patientId, text) {
    if (!patientId) {
        return "Para registrar mediciones clínicas de manera segura, necesito que vincules tu número de WhatsApp en la app VitaMetra.";
    }
    const db = admin.firestore();
    const isGlucose = text.toLowerCase().includes("glucosa") || text.toLowerCase().includes("azúcar") || text.toLowerCase().includes("mg/dl");
    const isInsulin = text.toLowerCase().includes("insulina") || text.toLowerCase().includes("unidades") || text.toLowerCase().includes("ui");
    const numbersMatch = text.match(/\d+/);
    const detectedValue = numbersMatch ? parseInt(numbersMatch[0], 10) : null;
    if (!detectedValue) {
        return "No logré detectar un número en tu mensaje. Por favor, dime algo como: 'Mi glucosa es 110 mg/dl' o 'Me inyecté 4 unidades de insulina'.";
    }
    try {
        if (isGlucose) {
            await db.collection("patients").doc(patientId).collection("glucose_logs").add({
                value: detectedValue,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                source: "whatsapp_nutria"
            });
            if (detectedValue < 70) {
                return `🚨 Nutria Alerta: Tu glucosa está en *${detectedValue} mg/dl*, lo cual es hipoglucemia. Por favor, consume 15g de carbohidratos rápidos y vuelve a medir en 15 minutos.`;
            }
            else if (detectedValue > 180) {
                return `⚠️ Tu glucosa está en *${detectedValue} mg/dl* (alta). Te he registrado el valor. Considera tomar agua y revisar si requieres un bolo de corrección.`;
            }
            else {
                return `✅ Excelente, he registrado tu glucosa en *${detectedValue} mg/dl*. Está dentro del rango objetivo.`;
            }
        }
        else if (isInsulin) {
            await db.collection("patients").doc(patientId).collection("insulin_logs").add({
                units: detectedValue,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                source: "whatsapp_nutria"
            });
            return `He registrado *${detectedValue} unidades* de insulina en tu diario.`;
        }
        else {
            return `Registré el valor ${detectedValue}, pero no estoy seguro si es glucosa o insulina. ¿Me lo aclaras?`;
        }
    }
    catch (error) {
        console.error("Error guardando registro clínico:", error);
        return "Lo siento, tuve un error técnico intentando guardar tu medición en la base de datos de VitaMetra.";
    }
}
//# sourceMappingURL=clinicalLogger.js.map