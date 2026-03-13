"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecureSignedUrl = exports.saveClinicalData = exports.processMedicalDeviceFile = exports.processNutriaInput = exports.whatsappWebhook = void 0;
exports.analyzePatientData = analyzePatientData;
const variabilityCalculator_1 = require("./core/engine/variabilityCalculator");
const hba1cEstimator_1 = require("./core/clinical/hba1cEstimator");
const metabolicScore_1 = require("./core/scoring/metabolicScore");
const buildClinicalResponse_1 = require("./core/clinical/buildClinicalResponse");
const mealImpactCalculator_1 = require("./core/mealImpact/mealImpactCalculator");
async function analyzePatientData(readings, meal) {
    try {
        if (!readings || readings.length === 0) {
            throw new Error("No glucose readings provided");
        }
        const glucoseValues = readings.map(r => r.value);
        const meanGlucose = (0, variabilityCalculator_1.calculateVariability)(glucoseValues);
        const hba1c = (0, hba1cEstimator_1.estimateHbA1c)(meanGlucose);
        const metabolicScore = (0, metabolicScore_1.calculateMetabolicScore)(70, meanGlucose, hba1c);
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
var processMedicalDeviceFile_1 = require("./api/processMedicalDeviceFile");
Object.defineProperty(exports, "processMedicalDeviceFile", { enumerable: true, get: function () { return processMedicalDeviceFile_1.processMedicalDeviceFile; } });
var saveClinicalData_1 = require("./api/saveClinicalData");
Object.defineProperty(exports, "saveClinicalData", { enumerable: true, get: function () { return saveClinicalData_1.saveClinicalData; } });
var generateSecureSignedUrl_1 = require("./api/generateSecureSignedUrl");
Object.defineProperty(exports, "generateSecureSignedUrl", { enumerable: true, get: function () { return generateSecureSignedUrl_1.generateSecureSignedUrl; } });
//# sourceMappingURL=index.js.map