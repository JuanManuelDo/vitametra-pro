export interface Macronutrients {
  carbohydrates: number        // gramos totales
  sugars: number               // gramos
  fiber: number                // gramos
  protein: number              // gramos
  fat: number                  // gramos
  saturatedFat?: number        // opcional
}

export interface GlycemicMetrics {
  glycemicIndex?: number       // estimado (0-100)
  glycemicLoad?: number        // calculado
  estimatedGlucoseImpact?: number // estimación futura personalizada
}

export interface MealItem {
  name: string
  quantity: number
  unit: string                 // g, ml, unit, etc.
  macros: Macronutrients
}

export interface Meal {
  id: string
  timestamp: string
  items: MealItem[]
  totalMacros: Macronutrients
  glycemicMetrics?: GlycemicMetrics
  notes?: string
}
