import type { Meal } from './mealModel.ts'
import type { MealImpactResult } from './impactEngine.ts'

export interface MealImpactRecord {
  mealId: string
  meal: Meal
  impact: MealImpactResult
  createdAt: string
}

export interface ImpactHistory {
  userId: string
  records: MealImpactRecord[]
}
