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
  timestamp?: string; // Añadido para consistencia con apiService
  createdAt: any;
  mealType: MealType;
  foodName?: string;     // Añadido: para identificar la comida en el recordatorio
  userInput: string;
  totalCarbs: number;
  bloodGlucoseValue?: number;
  finalInsulinUnits?: number;
  isCalibrated: boolean;
  mood?: string;
  physicalActivityLevel?: 'bajo' | 'medio' | 'alto';
  type?: 'MEAL' | 'GLUCOSE' | 'EXERCISE'; // Añadido para filtros de IA
  
  // --- NÚCLEO DE APRENDIZAJE (CIERRE DE BUCLE) ---
  postPrandialGlucose?: number; // Glucosa 2h después
  successScore?: number;        // Puntaje de éxito del bolo (0-1)
  closureNotes?: string;        // Veredicto final de la IA
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
}

export interface Hba1cEntry {
  id: string;
  date: string;
  value: number;
}