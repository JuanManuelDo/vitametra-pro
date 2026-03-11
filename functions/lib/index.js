"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNutriaInput = exports.whatsappWebhook = void 0;
exports.analyzePatientData = analyzePatientData;
const calculateVariability_1 = require("./core/engine/calculateVariability");
const estimateHbA1c_1 = require("./core/clinical/estimateHbA1c");
const calculateMetabolicScore_1 = require("./core/scoring/calculateMetabolicScore");
const buildClinicalResponse_1 = require("./core/clinical/buildClinicalResponse");
const mealImpactCalculator_1 = require("./core/mealImpact/mealImpactCalculator");
async function analyzePatientData(readings, meal) {
    try {
        if (!readings || readings.length === 0) {
            throw new Error("No glucose readings provided");
        }
        const meanGlucose = (0, calculateVariability_1.calculateVariability)(readings);
        const hba1c = (0, estimateHbA1c_1.estimateHbA1c)(meanGlucose);
        const metabolicScore = (0, calculateMetabolicScore_1.calculateMetabolicScore)(meanGlucose);
        let mealImpact = null;
        if (meal) {
            mealImpact = (0, mealImpactCalculator_1.calculateMealImpact)(meal);
        }
        return (0, buildClinicalResponse_1.buildClinicalResponse)({
            meanGlucose,
            hba1c,
            metabolicScore,
            mealImpact,
        });
    }
    catch (error) {
        console.error("Error analyzing patient data:", error);
        throw new Error("Clinical analysis failed");
    }
}
var webhook_1 = require("./interfaces/whatsapp/webhook");
Object.defineProperty(exports, "whatsappWebhook", { enumerable: true, get: function () { return webhook_1.whatsappWebhook; } });
var processNutriaInput_1 = require("./api/processNutriaInput");
Object.defineProperty(exports, "processNutriaInput", { enumerable: true, get: function () { return processNutriaInput_1.processNutriaInput; } });
//# sourceMappingURL=index.js.map