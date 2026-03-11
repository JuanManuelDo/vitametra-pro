import { onRequest } from "firebase-functions/v2/https";
import { parseWhatsAppMessage } from "./parser";
import { routeNutriaIntent } from "../../agent/nutria/router";

// El token de verificación debe configurarse en los secrets de Firebase o .env
// Por ahora usaremos un valor por defecto para desarrollo
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "nutria_secure_token_2024";

export const whatsappWebhook = onRequest({
  region: "us-central1",
  cors: true,
}, async (req, res) => {
  // 1. Verificación del Webhook (GET)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
      return;
    } else {
      res.sendStatus(403);
      return;
    }
  }

  // 2. Recepción de Mensajes (POST)
  if (req.method === "POST") {
    try {
      const body = req.body;

      // Verificamos si es un evento de WhatsApp API
      if (body.object === "whatsapp_business_account") {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            const value = change.value;
            
            // Si hay mensajes nuevos
            if (value && value.messages && value.messages.length > 0) {
              const message = value.messages[0];
              const senderPhone = message.from; // Número del paciente
              const wabaNumberId = value.metadata.phone_number_id;

              // Parsear el mensaje bruto a un formato estructurado
              const parsedMessage = await parseWhatsAppMessage(message);

              if (parsedMessage) {
                // Enviar la estructura al enrutador (cerebro) de Nutria
                // Usamos await para no cerrar la función antes de procesar,
                // aunque para sistemas de alta carga podría convenir Pub/Sub.
                await routeNutriaIntent(senderPhone, parsedMessage, wabaNumberId);
              }
            }
          }
        }
      }
      
      // WhatsApp requiere un 200 OK rápido para no reintentar
      res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error("Error procesando webhook de WhatsApp:", error);
      res.status(500).send("INTERNAL_SERVER_ERROR");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
});
