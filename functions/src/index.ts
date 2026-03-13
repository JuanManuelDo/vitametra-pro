import { calculateVariability } from "./core/engine/variabilityCalculator";
import { estimateHbA1c } from "./core/clinical/hba1cEstimator";
import { calculateMetabolicScore } from "./core/scoring/metabolicScore";
import { buildClinicalResponse } from "./core/clinical/buildClinicalResponse";
import { calculateMealImpact } from "./core/mealImpact/mealImpactCalculator";

export interface GlucoseReading {
  value: number;
  timestamp: string;
}

export interface MealData {
  carbs: number;
  protein: number;
  fat: number;
  fiber?: number;
}

export async function analyzePatientData(
  readings: GlucoseReading[],
  meal?: MealData
) {
  try {
    if (!readings || readings.length === 0) {
      throw new Error("No glucose readings provided");
    }

    // 1️⃣ Variabilidad glucémica (mean glucose)
    const glucoseValues = readings.map(r => r.value);
    const meanGlucose = calculateVariability(glucoseValues);

    // 2️⃣ Estimación HbA1c
    const hba1c = estimateHbA1c(meanGlucose);

    // 3️⃣ Score metabólico
    const metabolicScore = calculateMetabolicScore(70, meanGlucose, hba1c);

    // 4️⃣ Impacto por comida (si viene data)
    let mealImpact = null;

    if (meal) {
      mealImpact = calculateMealImpact(meal);
    }

    // 5️⃣ Respuesta clínica estructurada
    return buildClinicalResponse({
      meanGlucose,
      hba1c,
      metabolicScore,
      mealImpact,
    });

  } catch (error: any) {
    console.error("Error analyzing patient data:", error);
    throw new Error("Clinical analysis failed");
  }
}

// Exportar el Webhook de WhatsApp
export { whatsappWebhook } from "./interfaces/whatsapp/webhook";

// Exportar la nueva función multimodal Nutria 2.0
export { processNutriaInput } from "./api/processNutriaInput";

// Exportar procesamiento de archivos de dispositivos
export { processMedicalDeviceFile } from "./api/processMedicalDeviceFile";

// Exportar Funciones de Seguridad e Integridad HIPAA
export { saveClinicalData } from "./api/saveClinicalData";
export { generateSecureSignedUrl } from "./api/generateSecureSignedUrl";
