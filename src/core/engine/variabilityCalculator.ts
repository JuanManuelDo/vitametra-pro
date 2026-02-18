import type { GlucoseReading } from '../types/glucose.types.ts'

export interface VariabilityResult {
  mean: number
  standardDeviation: number
  coefficientOfVariation: number
}

export function calculateVariability(
  readings: GlucoseReading[]
): VariabilityResult {
  if (!readings?.length) {
    return {
      mean: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0
    }
  }

  const values = readings.map(r => r.value)

  const mean =
    values.reduce((sum, val) => sum + val, 0) / values.length

  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length

  const standardDeviation = Math.sqrt(variance)

  const coefficientOfVariation =
    mean === 0 ? 0 : (standardDeviation / mean) * 100

  return {
    mean: Number(mean.toFixed(2)),
    standardDeviation: Number(standardDeviation.toFixed(2)),
    coefficientOfVariation: Number(coefficientOfVariation.toFixed(2))
  }
}
