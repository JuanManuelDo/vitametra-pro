import type { VariabilityResult } from '../engine/variabilityCalculator.ts'

export interface VariabilityAssessment {
  status: 'stable' | 'moderate' | 'high'
  message: string
  recommendation: string
}

export function interpretVariability(
  result: VariabilityResult
): VariabilityAssessment {
  const { coefficientOfVariation } = result

  if (coefficientOfVariation < 36) {
    return {
      status: 'stable',
      message: 'Glucose variability is within recommended limits.',
      recommendation: 'Maintain current management strategy.'
    }
  }

  if (coefficientOfVariation < 50) {
    return {
      status: 'moderate',
      message: 'Moderate glucose variability detected.',
      recommendation: 'Review meal timing and insulin adjustments.'
    }
  }

  return {
    status: 'high',
    message: 'High glucose variability detected.',
      recommendation: 'Increased risk of hypoglycemia and instability. Consider clinical review.'
  }
}
