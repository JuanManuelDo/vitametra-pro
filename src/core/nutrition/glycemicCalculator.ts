import type { Meal } from './mealModel.ts'

export function calculateGlycemicLoad(meal: Meal): number | null {
  if (!meal.glycemicMetrics?.glycemicIndex) return null

  const netCarbs =
    meal.totalMacros.carbohydrates - meal.totalMacros.fiber

  const gl =
    (meal.glycemicMetrics.glycemicIndex * netCarbs) / 100

  return Number(gl.toFixed(2))
}
