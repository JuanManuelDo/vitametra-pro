import type { TIRResult } from '../engine/tirCalculator'
import type { VariabilityResult } from '../engine/variabilityCalculator'
import type { HbA1cResult } from '../clinical/hba1cEstimator'
import type { MetabolicScoreResult } from '../scoring/metabolicScore'

export interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  message: string
}

export interface RecommendationResult {
  summary: string
  recommendations: Recommendation[]
}

export function generateRecommendations(
  tir: TIRResult,
  variability: VariabilityResult,
  hba1c: HbA1cResult,
  score: MetabolicScoreResult
): RecommendationResult {

  const recommendations: Recommendation[] = []

  const tirPercent = tir?.inRangePercent ?? 0
  const CV = variability?.coefficientOfVariation ?? 0
  const A1c = hba1c?.estimatedHbA1c ?? 0
  const finalScore = score?.score ?? 0

  // 🔴 1️⃣ TIR bajo
  if (tirPercent < 50) {
    recommendations.push({
      priority: 'high',
      message:
        'Your time in range is low. Consider reviewing meal composition and insulin timing.'
    })
  }

  // 🔴 2️⃣ Alta variabilidad
  if (CV >= 36) {
    recommendations.push({
      priority: 'high',
      message:
        'High glucose variability detected. Try reducing rapid carbohydrate spikes and monitor post-meal glucose.'
    })
  }

  // 🟠 3️⃣ HbA1c elevada
  if (A1c >= 6.5) {
    recommendations.push({
      priority: 'medium',
      message:
        'Estimated HbA1c suggests suboptimal long-term control. Maintain consistent monitoring and discuss adjustments with your healthcare provider.'
    })
  }

  // 🟢 4️⃣ Score general
  if (finalScore >= 80) {
    recommendations.push({
      priority: 'low',
      message:
        'Excellent metabolic control. Continue your current management strategy.'
    })
  } else if (finalScore < 50) {
    recommendations.push({
      priority: 'high',
      message:
        'Overall metabolic score indicates elevated risk. Focus on stabilizing daily glucose fluctuations.'
    })
  }

  return {
    summary: `Metabolic Score: ${finalScore}/100 (${score.category})`,
    recommendations
  }
}

