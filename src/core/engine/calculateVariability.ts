export interface VariabilityResult {
  mean: number
  standardDeviation: number
  coefficientOfVariation: number
}

export function calculateVariability(
  glucoseValues: number[]
): VariabilityResult {

  if (!glucoseValues || !glucoseValues.length) {
    return {
      mean: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0
    }
  }

  const mean =
    glucoseValues.reduce((sum, val) => sum + val, 0) /
    glucoseValues.length

  const variance =
    glucoseValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    glucoseValues.length

  const standardDeviation = Math.sqrt(variance)

  const coefficientOfVariation =
    mean === 0 ? 0 : (standardDeviation / mean) * 100

  return {
    mean: Number(mean.toFixed(2)),
    standardDeviation: Number(standardDeviation.toFixed(2)),
    coefficientOfVariation: Number(coefficientOfVariation.toFixed(2))
  }
}
