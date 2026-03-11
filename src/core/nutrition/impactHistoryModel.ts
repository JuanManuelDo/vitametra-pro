import type { Meal } from './mealModel.ts'
import type { MealImpactResult } from './impactEngine.ts'

export interface MealImpactRecord {
  recordId: string
  userId: string
  meal: Meal
  impact: MealImpactResult
  preGlucose: number
  postGlucose: number
  delta: number
  mealTime: string
  createdAt: string
}

export interface ImpactHistory {
  userId: string
  records: MealImpactRecord[]
}

