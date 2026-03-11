"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleExamReading = handleExamReading;
async function handleExamReading(patientId, mediaId) {
    if (!patientId) {
        return "Para interpretar exámenes médicos, por favor vincula tu número en la app VitaMetra por seguridad.";
    }
    return "He recibido tu documento. Nutria está analizando los resultados de tus exámenes. Te enviaré un resumen con el impacto clínico en breve.";
}
//# sourceMappingURL=examReading.js.map