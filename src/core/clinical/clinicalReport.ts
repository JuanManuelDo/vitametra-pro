import type { TIRResult } from '../engine/tirCalculator.ts'
import type { VariabilityResult } from '../engine/variabilityCalculator.ts'
import type { HbA1cResult } from './hba1cEstimator.ts'
import { interpretVariability } from './variabilityInterpretation.ts'

export interface ClinicalReport {
  overallRisk: 'low' | 'moderate' | 'high'
  headline: string
  details: string
}

export function generateClinicalReport(
  tir: TIRResult,
  variability: VariabilityResult,
  hba1c: HbA1cResult
): ClinicalReport {

  const variabilityAssessment = interpretVariability(variability)

  let overallRisk: ClinicalReport['overallRisk']

  if (
    tir.inRangePercent >= 70 &&
    variabilityAssessment.status === 'stable' &&
    hba1c.estimatedHbA1c < 6.5
  ) {
    overallRisk = 'low'
  }
  else if (
    tir.inRangePercent >= 50 &&
    variabilityAssessment.status !== 'high'
  ) {
    overallRisk = 'moderate'
  }
  else {
    overallRisk = 'high'
  }

  return {
    overallRisk,
    headline: `Overall metabolic risk: ${overallRisk.toUpperCase()}`,
    details: `
TIR: ${tir.inRangePercent}% in range.
Variability (CV): ${variability.coefficientOfVariation}%.
Estimated HbA1c: ${hba1c.estimatedHbA1c}%.
    `.trim()
  }
}
