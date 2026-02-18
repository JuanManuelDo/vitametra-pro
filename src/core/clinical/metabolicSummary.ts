import type { TIRResult } from '../engine/tirCalculator.ts'
import type { VariabilityResult } from '../engine/variabilityCalculator.ts'
import { interpretVariability } from './variabilityInterpretation.ts'

export interface MetabolicSummary {
  controlLevel: 'excellent' | 'good' | 'moderate' | 'poor'
  riskLevel: 'low' | 'moderate' | 'high'
  summary: string
}

export function generateMetabolicSummary(
  tir: TIRResult,
  variability: VariabilityResult
): MetabolicSummary {

  const variabilityAssessment = interpretVariability(variability)

  // Evaluate control by TIR
  let controlLevel: MetabolicSummary['controlLevel']

  if (tir.inRangePercent >= 70) controlLevel = 'excellent'
  else if (tir.inRangePercent >= 60) controlLevel = 'good'
  else if (tir.inRangePercent >= 40) controlLevel = 'moderate'
  else controlLevel = 'poor'

  // Risk from variability
  let riskLevel: MetabolicSummary['riskLevel']

  if (variabilityAssessment.status === 'stable') riskLevel = 'low'
  else if (variabilityAssessment.status === 'moderate') riskLevel = 'moderate'
  else riskLevel = 'high'

  return {
    controlLevel,
    riskLevel,
    summary: `Metabolic control is ${controlLevel} with ${riskLevel} variability risk.`
  }
}
