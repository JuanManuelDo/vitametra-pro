import type { ImpactHistory } from './impactHistoryModel.ts'

export interface ImpactAnalyticsResult {
  averageDelta: number
  highestImpactMeal: string | null
  highImpactCount: number
}

export function analyzeImpactHistory(
  history: ImpactHistory
): ImpactAnalyticsResult {

  if (history.records.length === 0) {
    return {
      averageDelta: 0,
      highestImpactMeal: null,
      highImpactCount: 0
    }
  }

  const deltas = history.records.map(r => r.impact.delta)

  const averageDelta =
    deltas.reduce((sum, d) => sum + d, 0) / deltas.length

  const highest = history.records.reduce((max, current) =>
    current.impact.delta > max.impact.delta ? current : max
  )

  const highImpactCount =
    history.records.filter(r => r.impact.impactLevel === 'high').length

  return {
    averageDelta: Number(averageDelta.toFixed(2)),
    highestImpactMeal: highest.meal.items[0]?.name || null,
    highImpactCount
  }
}
