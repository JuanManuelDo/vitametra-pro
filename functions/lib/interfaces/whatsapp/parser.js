"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWhatsAppMessage = parseWhatsAppMessage;
async function parseWhatsAppMessage(message) {
    const id = message.id;
    const type = message.type;
    const timestamp = message.timestamp;
    const parsedMsg = {
        id,
        type: "unknown",
        timestamp
    };
    if (type === "text" && message.text) {
        parsedMsg.type = "text";
        parsedMsg.text = message.text.body;
    }
    else if (type === "image" && message.image) {
        parsedMsg.type = "image";
        parsedMsg.mediaId = message.image.id;
        parsedMsg.mimeType = message.image.mime_type;
        if (message.image.caption) {
            parsedMsg.text = message.image.caption;
        }
    }
    else if (type === "audio" && message.audio) {
        parsedMsg.type = "audio";
        parsedMsg.mediaId = message.audio.id;
        parsedMsg.mimeType = message.audio.mime_type;
    }
    else {
        console.warn(`Tipo de mensaje de WhatsApp no soportado por ahora: ${type}`);
        return null;
    }
    return parsedMsg;
}
//# sourceMappingURL=parser.js.map