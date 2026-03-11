import type { ImpactHistory } from './impactHistoryModel.ts'

export interface PredictionResult {
  predictedDelta: number
  confidence: 'low' | 'medium' | 'high'
}

export function predictNextDelta(
  history: ImpactHistory,
  carbs: number,
  fat: number,
  protein: number
): PredictionResult {

  if (history.records.length < 5) {
    return { predictedDelta: carbs * 2, confidence: 'low' }
  }

  // Regresión simplificada
  const avgDelta =
    history.records.reduce((s, r) => s + r.delta, 0) /
    history.records.length

  const predicted =
    (carbs * 2.2) +
    (fat * 0.3) -
    (protein * 0.5)

  const adjusted =
    (predicted * 0.6) + (avgDelta * 0.4)

  let confidence: 'low' | 'medium' | 'high' = 'medium'
  if (history.records.length > 20) confidence = 'high'

  return {
    predictedDelta: Number(adjusted.toFixed(2)),
    confidence
  }
}
