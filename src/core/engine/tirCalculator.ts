import type { GlucoseReading } from '../types/glucose.types'

export interface TIRResult {
  inRangePercent: number
  lowPercent: number
  veryLowPercent: number
  highPercent: number
  veryHighPercent: number
  totalReadings: number
}

interface TIRConfig {
  lowThreshold?: number
  highThreshold?: number
  veryLowThreshold?: number
  veryHighThreshold?: number
}

export function calculateTIR(
  readings: GlucoseReading[],
  config: TIRConfig = {}
): TIRResult {

  if (!readings?.length) {
    return {
      inRangePercent: 0,
      lowPercent: 0,
      veryLowPercent: 0,
      highPercent: 0,
      veryHighPercent: 0,
      totalReadings: 0
    }
  }

  const {
    lowThreshold = 70,
    highThreshold = 180,
    veryLowThreshold = 54,
    veryHighThreshold = 250
  } = config

  let inRange = 0
  let low = 0
  let veryLow = 0
  let high = 0
  let veryHigh = 0

  // 🛡 Filtrar valores inválidos
  const validReadings = readings.filter(
    r =>
      typeof r.value === 'number' &&
      !isNaN(r.value) &&
      r.value > 0
  )

  if (!validReadings.length) {
    return {
      inRangePercent: 0,
      lowPercent: 0,
      veryLowPercent: 0,
      highPercent: 0,
      veryHighPercent: 0,
      totalReadings: 0
    }
  }

  for (const reading of validReadings) {
    const value = reading.value

    if (value < veryLowThreshold) {
      veryLow++
    } else if (value < lowThreshold) {
      low++
    } else if (value > veryHighThreshold) {
      veryHigh++
    } else if (value > highThreshold) {
      high++
    } else {
      inRange++
    }
  }

  const total = validReadings.length

  const percentage = (count: number) =>
    Number(((count / total) * 100).toFixed(2))

  const result: TIRResult = {
    inRangePercent: percentage(inRange),
    lowPercent: percentage(low),
    veryLowPercent: percentage(veryLow),
    highPercent: percentage(high),
    veryHighPercent: percentage(veryHigh),
    totalReadings: total
  }

  return result
}
