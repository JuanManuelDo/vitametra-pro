import type { TIRResult } from '../engine/tirCalculator'
import type { VariabilityResult } from '../engine/variabilityCalculator'
import type { HbA1cResult } from '../clinical/hba1cEstimator'

export interface MetabolicScoreResult {
  score: number
  category: 'excellent' | 'good' | 'moderate' | 'high_risk'
  breakdown: {
    tirScore: number
    variabilityScore: number
    hba1cScore: number
  }
}

export function calculateMetabolicScore(
  tir: TIRResult,
  variability: VariabilityResult,
  hba1c: HbA1cResult
): MetabolicScoreResult {

  // 🛡 Protección básica
  const tirPercent = Math.max(0, Math.min(100, tir?.inRangePercent ?? 0))
  const CV = Math.max(0, variability?.coefficientOfVariation ?? 0)
  const A1c = Math.max(0, hba1c?.estimatedHbA1c ?? 0)

  // 1️⃣ TIR Score (0–100 directo)
  const tirScore = tirPercent

  // 2️⃣ Variability Score
  let variabilityScore: number

  if (CV <= 36) {
    variabilityScore = 100
  } else if (CV >= 60) {
    variabilityScore = 0
  } else {
    variabilityScore =
      100 - ((CV - 36) / (60 - 36)) * 100
  }

  variabilityScore = Math.max(0, Math.min(100, variabilityScore))

  // 3️⃣ HbA1c Score
  let hba1cScore: number

  if (A1c <= 6.5) {
    hba1cScore = 100
  } else if (A1c >= 9) {
    hba1cScore = 0
  } else {
    hba1cScore =
      100 - ((A1c - 6.5) / (9 - 6.5)) * 100
  }

  hba1cScore = Math.max(0, Math.min(100, hba1cScore))

  // 🎯 Weighted Final Score
  const finalScore = Math.round(
    tirScore * 0.5 +
    variabilityScore * 0.3 +
    hba1cScore * 0.2
  )

  let category: MetabolicScoreResult['category']

  if (finalScore >= 80) category = 'excellent'
  else if (finalScore >= 65) category = 'good'
  else if (finalScore >= 50) category = 'moderate'
  else category = 'high_risk'

  return {
    score: finalScore,
    category,
    breakdown: {
      tirScore: Math.round(tirScore),
      variabilityScore: Math.round(variabilityScore),
      hba1cScore: Math.round(hba1cScore)
    }
  }
}
