import type { PersonalizedRiskSummary } from './personalizedRiskEngine.ts'

export interface AdaptiveRecommendation {
  priority: 'high' | 'medium'
  message: string
}

export function generateAdaptiveRecommendations(
  summary: PersonalizedRiskSummary
): AdaptiveRecommendation[] {

  const recommendations: AdaptiveRecommendation[] = []

  if (summary.highRiskFoods.length > 0) {
    recommendations.push({
      priority: 'high',
      message: `These foods consistently trigger high spikes: ${summary.highRiskFoods.join(', ')}. Consider portion reduction or substitution.`
    })
  }

  if (summary.moderateRiskFoods.length > 0) {
    recommendations.push({
      priority: 'medium',
      message: `Moderate impact foods detected: ${summary.moderateRiskFoods.join(', ')}. Monitor post-meal glucose closely.`
    })
  }

  if (summary.safestFoods.length > 0) {
    recommendations.push({
      priority: 'medium',
      message: `Low impact foods for you: ${summary.safestFoods.slice(0,3).join(', ')}. These are metabolically safer options.`
    })
  }

  return recommendations
}
