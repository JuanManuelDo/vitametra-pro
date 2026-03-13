export type UserRole = 'ADMIN_INSTITUCIONAL' | 'USER' | 'FOUNDER';
export type DiabetesType = 'Type 1' | 'Type 2' | 'LADA' | 'Gestational';
export type MealType = 'desayuno' | 'almuerzo' | 'cena' | 'snack';

export interface InsulinRatioSegment {
  startTime: string;
  ratio: number;
}

export interface ClinicalConfig {
  diabetesType?: DiabetesType;
  insulinSensitivityFactor: number;
  targetGlucose: number;
  weight?: number;
  lastHba1c?: number;
}

export interface LongTermMemory {
  patterns: {
    highGlucoseTriggers: string[];
    effectiveCorrections: string[];
    notableEvents: string[];
  };
  preferences: {
    dietaryRestrictions: string[];
    favoriteSafeFoods: string[];
  };
  aiNotes: string;
}

export interface FoodItem {
  food: string;
  totalCarbs: number;
  category: string;
}

export interface AnalysisResult {
  items: FoodItem[];
  totalCarbs: number;
  glycemicIndex: string;
  glycemicLoad: number;
  optimizationTip: string;
  aiContextualNote?: string;
}

export interface HistoryEntry {
  id: string;
  userId: string;
  date: string;
  monthId?: string; // Nuevo: Para indexación en subcolecciones mensuales
  timestamp?: string; // Añadido para consistencia con apiService
  createdAt: any;
  mealType: MealType;
  foodName?: string;     // Añadido: para identificar la comida en el recordatorio
  userInput: string;
  totalCarbs: number;
  bloodGlucoseValue?: number;
  value?: number; // legacy alias for blood glucose
  finalInsulinUnits?: number;
  isCalibrated: boolean;
  mood?: string;
  physicalActivityLevel?: 'bajo' | 'medio' | 'alto';
  type?: 'MEAL' | 'GLUCOSE' | 'EXERCISE' | 'INSULIN' | 'CGM_SYNC' | 'AUDIO_NOTE'; // Unified Event Type
  
  // --- NÚCLEO DE APRENDIZAJE (CIERRE DE BUCLE) ---
  postPrandialGlucose?: number; // Glucosa 2h después
  successScore?: number;        // Puntaje de éxito del bolo (0-1)
  closureNotes?: string;        // Veredicto final de la IA

  // --- UNIFICACIÓN DE DATOS REPRODUCIBLES (CGM + BOMBA DE INSULINA + IA DE VISIÓN/VOZ) ---
  linkedMealId?: string;        // ID de la comida asociada (para buscar el cruce Comida X -> Glucemia Y 2h después)
  trendArrow?: 'DOUBLE_UP' | 'SINGLE_UP' | 'FORTY_FIVE_UP' | 'FLAT' | 'FORTY_FIVE_DOWN' | 'SINGLE_DOWN' | 'DOUBLE_DOWN';
  deviceSource?: 'MANUAL' | 'FREESTYLE_LIBRE' | 'DEXCOM' | 'MEDTRONIC' | 'ACCU_CHEK' | 'APPLE_HEALTH' | 'NUTRIA_VOZ' | 'NUTRIA_VISION';
  basalInsulin?: number;        // Tasa basal en U/h (si aplica al bloque)
  bolusInsulin?: number;        // Bolo prandial o corrector en U
  imageUrl?: string;            // Added for MultimodalTimeline
}

// Interfaz para la extracción de IA desde Audio/Documentos
export interface ExtractedBioSignal {
  type: 'MEAL' | 'GLUCOSE' | 'EXERCISE' | 'INSULIN';
  value: number; // Cantidad (Carbos, mg/dL, U, Minutos)
  timestampExtracted: string; // Convertido a ISO
  description: string;
  trendArrow?: string;
  mealType?: MealType;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rut?: string;
  diabetesType?: DiabetesType;
  name?: string; // Alias por si se usa en algunos componentes
  role: UserRole;
  subscription_tier: 'BASE' | 'PRO';
  ia_credits: number;
  daily_ia_usage: number;
  createdAt: string;
  defaultBasalDose?: number;
  streak: number; 
  photoURL?: string;
  insulinRatioSchedule?: InsulinRatioSegment[];
  clinicalConfig?: ClinicalConfig; 
  aiMemory?: string; 
  memory?: LongTermMemory; 
  activityLevel?: string;
  targetWeight?: number;
  targetHba1c?: number;
  glucoseUnitPreference?: 'mg/dL' | 'mmol/L';
  fcmToken?: string;
}

export interface MedicalSummary {
  clinicalMetrics: {
    timeInRange: number; // % entre 70-180
    gmi: number;         // Glucose Management Indicator
    variationCoefficient: number; // CV %
    averageGlucose: number;
  };
  insights: {
    principalFinding: string;
    causalityCorrelation: string;
    suggestedAdjustment: string;
  };
  patterns: {
    foodSpikes: { food: string; spikeFrequency: number; avgPostPrandial: number }[];
  };
  period: {
    start: string;
    end: string;
  };
}

export interface Hba1cEntry {
  id: string;
  date: string;
  value: number;
}