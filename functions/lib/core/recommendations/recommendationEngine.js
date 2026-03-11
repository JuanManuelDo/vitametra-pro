"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRecommendations = generateRecommendations;
function generateRecommendations(score) {
    if (score >= 85)
        return "Excelente control metabólico.";
    if (score >= 70)
        return "Buen control, con oportunidades de mejora.";
    if (score >= 50)
        return "Control moderado. Revisar alimentación y variabilidad.";
    return "Riesgo alto. Se recomienda evaluación médica.";
}
//# sourceMappingURL=recommendationEngine.js.map