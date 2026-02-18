import type { TIRResult } from '../engine/tirCalculator.ts'

export interface TIRClinicalAssessment {
  status: 'excellent' | 'good' | 'needs_improvement' | 'high_risk'
  message: string
  recommendation: string
}

export function interpretTIR(result: TIRResult): TIRClinicalAssessment {
  const { inRangePercent, veryLowPercent, veryHighPercent } = result

  if (veryLowPercent > 5) {
    return {
      status: 'high_risk',
      message: 'Frequent severe hypoglycemia detected.',
      recommendation: 'Immediate medical review recommended.'
    }
  }

  if (inRangePercent >= 70) {
    return {
      status: 'excellent',
      message: 'Glucose control is within recommended targets.',
      recommendation: 'Maintain current management strategy.'
    }
  }

  if (inRangePercent >= 60) {
    return {
      status: 'good',
      message: 'Glucose control is acceptable but could improve.',
      recommendation: 'Review post-meal glucose spikes.'
    }
  }

  return {
    status: 'needs_improvement',
    message: 'Time in range below recommended levels.',
    recommendation: 'Consider reviewing insulin dosing and meal patterns.'
  }
}
