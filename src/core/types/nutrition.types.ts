export interface Macronutrients {
  carbs: number
  protein: number
  fat: number
  fiber?: number
}

export interface MealEntry {
  id: string
  timestamp: string
  foods: string[]
  macros: Macronutrients
  estimatedGlycemicIndex?: number
}
