"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const parser_1 = require("./parser");
const router_1 = require("../../agent/nutria/router");
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "nutria_secure_token_2024";
exports.whatsappWebhook = (0, https_1.onRequest)({
    region: "us-central1",
    cors: true,
}, async (req, res) => {
    if (req.method === "GET") {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
            return;
        }
        else {
            res.sendStatus(403);
            return;
        }
    }
    if (req.method === "POST") {
        try {
            const body = req.body;
            if (body.object === "whatsapp_business_account") {
                for (const entry of body.entry) {
                    for (const change of entry.changes) {
                        const value = change.value;
                        if (value && value.messages && value.messages.length > 0) {
                            const message = value.messages[0];
                            const senderPhone = message.from;
                            const wabaNumberId = value.metadata.phone_number_id;
                            const parsedMessage = await (0, parser_1.parseWhatsAppMessage)(message);
                            if (parsedMessage) {
                                await (0, router_1.routeNutriaIntent)(senderPhone, parsedMessage, wabaNumberId);
                            }
                        }
                    }
                }
            }
            res.status(200).send("EVENT_RECEIVED");
        }
        catch (error) {
            console.error("Error procesando webhook de WhatsApp:", error);
            res.status(500).send("INTERNAL_SERVER_ERROR");
        }
    }
    else {
        res.status(405).send("Method Not Allowed");
    }
});
//# sourceMappingURL=webhook.js.map