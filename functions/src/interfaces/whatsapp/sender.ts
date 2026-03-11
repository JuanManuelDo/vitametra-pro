import axios from "axios";

const WA_API_VERSION = "v18.0";
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Interfaz segura para enviar mensajes de vuelta a WhatsApp
 */
export async function sendWhatsAppMessage(
  toPhone: string, 
  wabaNumberId: string, 
  text: string
) {
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
    const response = await axios.post(url, payload, {
      headers: {
        "Authorization": `Bearer ${WA_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error: any) {
    console.error("Error enviando mensaje de WhatsApp:", error.response?.data || error.message);
    throw new Error("Failed to send WhatsApp message");
  }
}
