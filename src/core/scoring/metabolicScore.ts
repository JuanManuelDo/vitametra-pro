import type { TIRResult } from '../engine/tirCalculator.ts'
import type { VariabilityResult } from '../engine/variabilityCalculator.ts'
import type { HbA1cResult } from '../clinical/hba1cEstimator.ts'

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

  // 1️⃣ TIR Score
  const tirScore = Math.min(tir.inRangePercent, 100)

  // 2️⃣ Variability Score
  let variabilityScore: number

  const CV = variability.coefficientOfVariation

  if (CV <= 36) variabilityScore = 100
  else if (CV >= 60) variabilityScore = 0
  else {
    variabilityScore =
      100 - ((CV - 36) / (60 - 36)) * 100
  }

  // 3️⃣ HbA1c Score
  let hba1cScore: number

  const A1c = hba1c.estimatedHbA1c

  if (A1c <= 6.5) hba1cScore = 100
  else if (A1c >= 9) hba1cScore = 0
  else {
    hba1cScore =
      100 - ((A1c - 6.5) / (9 - 6.5)) * 100
  }

  // 🎯 Final Score
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
