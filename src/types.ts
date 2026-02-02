export type UserRole = 'ADMIN_INSTITUCIONAL' | 'USER' | 'FOUNDER';
export type DiabetesType = 'Type 1' | 'Type 2' | 'LADA' | 'Gestational';
export type InsulinTherapy = 'Pen/Syringe' | 'Insulin Pump';
export type CarbUnit = 'grams' | 'exchanges';
export type UserGender = 'MASCULINO' | 'FEMENINO' | 'NEUTRO';
export type MealType = 'desayuno' | 'almuerzo' | 'cena' | 'snack-manana' | 'snack-tarde' | 'snack-noche' | 'snack-deportivo';

export interface GlucoseRanges {
  targetMin: number;
  targetMax: number;
  veryHigh: number;
  veryLow: number;
}

// NUEVO: Segmento de Ratio por Horario para precisión médica
export interface InsulinRatioSegment {
  startTime: string; // Formato "HH:mm"
  ratio: number;     // Gramos de carbos por 1 unidad de insulina
}

export interface ClinicalConfiguration {
  diabetesType: DiabetesType;
  insulinToCarbRatio: number; // Ratio base por defecto
  insulinSensitivityFactor: number;
  targetGlucose: number;
  glucoseRanges: GlucoseRanges;
  // NUEVO: Horarios dinámicos
  insulinRatioSchedule?: InsulinRatioSegment[]; 
}

export interface FoodItem {
  food: string;
  totalCarbs: number;
  category: 'base' | 'complemento' | 'fibra_proteina';
  fiber: number;
  protein: number;
  fat: number;
  calories: number;
}

export interface AnalysisResult {
  items: FoodItem[];
  totalCarbs: number;
  totalFiber: number;
  netCarbs: number;
  glycemicIndex: 'alto' | 'medio' | 'bajo';
  glycemicLoad: number;
  glucoseRiseEstimate: number;
  optimizationTip: string;
  metabolicExplanation: string;
}

/**
 * VITAMETRA 2026 - NÚCLEO DE APRENDIZAJE IA
 * Guardamos el contexto completo para entrenar el modelo con cada comida.
 */
export interface HistoryEntry {
  id: string;
  userId: string;
  date: string; 
  createdAt: any; 
  mealType: MealType;
  userInput: string; // Lo que el usuario escribió o dictó
  foodName?: string;
  imageUrl?: string; // Foto del plato analizado
  items: FoodItem[];
  totalCarbs: number;
  
  // --- Datos de Tratamiento al momento del registro ---
  bloodGlucoseValue?: number; // Glucemia PRE-comida
  recommendedInsulinUnits?: number; // Lo que sugirió la IA
  finalInsulinUnits?: number; // Lo que el usuario se inyectó realmente
  ratioUsed?: number; // El ratio (I:C) activo en ese horario

  // --- Feedback para aprendizaje de IA (Calibración) ---
  glucosePost2h?: number; // Glucemia 2 horas después (Ingresada en calibración)
  glucoseImpact?: number; // Diferencia (Post - Pre)
  wasCorrectionNeeded?: boolean;
  aiAccuracyScore?: number; // 0 a 100 (Cálculo interno de precisión)
  isCalibrated: boolean; // Si ya pasó por el proceso de calibración
}

// NUEVO: Estructura para Reportes Clínicos (Lo que recibe el médico)
export interface PatientClinicalSummary {
  patientName: string;
  dateRange: { from: string; to: string };
  diabetesType: string;
  eHbA1c: number; // Hemoglobina Glicosilada Estimada por IA
  timeInRange: number; // % de tiempo entre 70-180 mg/dL
  meanGlucose: number;
  standardDeviation: number; // Variabilidad glucémica
  hypoEvents: number; // Eventos detectados por debajo del rango
  hyperEvents: number; // Eventos detectados por encima del rango
  aiInsights: string[]; // Sugerencias generadas para el doctor
  totalCarbsConsumed: number;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  subscription_tier: 'BASE' | 'PRO';
  ia_credits: number;
  clinicalConfig?: ClinicalConfiguration;
  // NUEVO: Soporte para ratios horarios en el perfil
  insulinRatioSchedule?: InsulinRatioSegment[];
  createdAt: string;
  premium_until?: string;
  // Sensibilidad metabólica dinámica calculada por la IA tras calibraciones
  metabolic_sensitivity_index?: number; 
}