export type UserRole = 'ADMIN_INSTITUCIONAL' | 'USER' | 'FOUNDER';
export type DiabetesType = 'Type 1' | 'Type 2' | 'LADA' | 'Gestational';
export type MealType = 'desayuno' | 'almuerzo' | 'cena' | 'snack';

export interface InsulinRatioSegment {
  startTime: string; // Ej: "08:00"
  ratio: number;    // Relación Insulina:Carbohidratos
}

// --- CONFIGURACIÓN CLÍNICA ---
export interface ClinicalConfig {
  diabetesType?: DiabetesType;
  insulinSensitivityFactor: number; // ISF: Cuánto baja la glucosa 1 unidad de insulina
  targetGlucose: number;           // Glucosa objetivo (ej: 100 mg/dL)
  weight?: number;
  lastHba1c?: number;
}

// --- MEMORIA A LARGO PLAZO (NUEVO) ---
// Esta interfaz almacena el "aprendizaje" complejo que la IA hace sobre el usuario
export interface LongTermMemory {
  patterns: {
    highGlucoseTriggers: string[]; // Ej: ["Arroz blanco", "Estrés laboral"]
    effectiveCorrections: string[]; // Ej: ["Caminata 20min", "Té verde"]
    notableEvents: string[];       // Hitos: "Cambio de bomba de insulina en 2025"
  };
  preferences: {
    dietaryRestrictions: string[]; // Ej: ["Vegano", "Sin Gluten"]
    favoriteSafeFoods: string[];   // Alimentos con bajo impacto glucémico probado
  };
  aiNotes: string; // Espacio donde el Agente IA escribe sus deducciones
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
  aiContextualNote?: string; // Nota generada por la memoria
}

export interface HistoryEntry {
  id: string;
  userId: string;
  date: string;
  createdAt: any;
  mealType: MealType;
  userInput: string;
  totalCarbs: number;
  bloodGlucoseValue?: number;
  finalInsulinUnits?: number;
  isCalibrated: boolean;
  // Metadata de contexto
  mood?: string;
  physicalActivityLevel?: 'bajo' | 'medio' | 'alto';
}

// --- USERDATA ACTUALIZADO PARA DESPLIEGUE ---
export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  subscription_tier: 'BASE' | 'PRO';
  ia_credits: number;
  daily_ia_usage: number;
  createdAt: string;
  defaultBasalDose?: number;
  streak: number; 
  photoURL?: string; // Para el avatar de perfil
  
  // Extensiones para la calibración médica y memoria
  insulinRatioSchedule?: InsulinRatioSegment[];
  clinicalConfig?: ClinicalConfig; 
  
  // NUEVO: aiMemory como string plano para edición rápida en perfil
  aiMemory?: string; 
  
  // memory para la estructura de datos compleja (objetos)
  memory?: LongTermMemory; 

  // Ajustes adicionales de usuario
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