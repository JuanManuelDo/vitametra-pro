"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppMessage = sendWhatsAppMessage;
const axios_1 = __importDefault(require("axios"));
const WA_API_VERSION = "v18.0";
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
async function sendWhatsAppMessage(toPhone, wabaNumberId, text) {
    if (!WA_TOKEN) {
        console.warn("No hay WHATSAPP_ACCESS_TOKEN configurado. Loggeando mensaje en consola:");
        console.log(`[WA_MESSAGE_OUT -> ${toPhone}]: ${text}`);
        return;
    }
    const url = `https://graph.facebook.com/${WA_API_VERSION}/${wabaNumberId}/messages`;
    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toPhone,
        type: "text",
        text: {
            preview_url: false,
            body: text
        }
    };
    try {
        const response = await axios_1.default.post(url, payload, {
            headers: {
                "Authorization": `Bearer ${WA_TOKEN}`,
                "Content-Type": "application/json"
            }
        });
        return response.data;
    }
    catch (error) {
        console.error("Error enviando mensaje de WhatsApp:", error.response?.data || error.message);
        throw new Error("Failed to send WhatsApp message");
    }
}
//# sourceMappingURL=sender.js.map