import type { FoodRiskProfile } from './foodPatternAnalyzer.ts'

export interface PersonalizedRiskSummary {
  highRiskFoods: string[]
  moderateRiskFoods: string[]
  safestFoods: string[]
}

export function buildPersonalizedRiskSummary(
  profiles: FoodRiskProfile[]
): PersonalizedRiskSummary {

  return {
    highRiskFoods:
      profiles.filter(p => p.riskLevel === 'high')
        .map(p => p.foodName),

    moderateRiskFoods:
      profiles.filter(p => p.riskLevel === 'moderate')
        .map(p => p.foodName),

    safestFoods:
      profiles.filter(p => p.riskLevel === 'low')
        .map(p => p.foodName)
  }
}
