import type { ImpactHistory } from './impactHistoryModel.ts'

export interface FoodRiskProfile {
  foodName: string
  averageDelta: number
  occurrences: number
  riskLevel: 'low' | 'moderate' | 'high'
}

export function analyzeFoodPatterns(
  history: ImpactHistory
): FoodRiskProfile[] {

  const foodMap: Record<string, number[]> = {}

  history.records.forEach(record => {
    record.meal.items.forEach(item => {
      if (!foodMap[item.name]) {
        foodMap[item.name] = []
      }
      foodMap[item.name].push(record.delta)
    })
  })

  const results: FoodRiskProfile[] = Object.entries(foodMap).map(
    ([foodName, deltas]) => {

      const avg =
        deltas.reduce((s, d) => s + d, 0) / deltas.length

      let risk: 'low' | 'moderate' | 'high' = 'low'
      if (avg > 50) risk = 'high'
      else if (avg > 30) risk = 'moderate'

      return {
        foodName,
        averageDelta: Number(avg.toFixed(2)),
        occurrences: deltas.length,
        riskLevel: risk
      }
    }
  )

  return results.sort((a, b) => b.averageDelta - a.averageDelta)
}
