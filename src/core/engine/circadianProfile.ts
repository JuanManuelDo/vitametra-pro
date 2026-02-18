import type { GlucoseReading } from '../types/glucose.types.ts'

export interface HourlyProfile {
  hour: number
  averageGlucose: number
  readingsCount: number
  confidence: 'low' | 'medium' | 'high'
}

export function generateCircadianProfile(
  readings: GlucoseReading[],
  minimumReadingsPerHour = 3
): HourlyProfile[] {
  if (!readings?.length) return []

  const hourlyMap: Record<number, number[]> = {}

  for (const reading of readings) {
    if (!reading.timestamp || reading.value == null) continue

    const hour = new Date(reading.timestamp).getHours()

    if (!hourlyMap[hour]) {
      hourlyMap[hour] = []
    }

    hourlyMap[hour].push(reading.value)
  }

  const profile: HourlyProfile[] = Object.entries(hourlyMap)
    .filter(([, values]) => values.length >= 1) // no eliminamos horas aún
    .map(([hourStr, values]) => {
      const hour = Number(hourStr)

      const average =
        values.reduce((sum, val) => sum + val, 0) / values.length

      let confidence: 'low' | 'medium' | 'high' = 'low'

      if (values.length >= minimumReadingsPerHour * 2) {
        confidence = 'high'
      } else if (values.length >= minimumReadingsPerHour) {
        confidence = 'medium'
      }

      return {
        hour,
        averageGlucose: Number(average.toFixed(2)),
        readingsCount: values.length,
        confidence
      }
    })

  return profile.sort((a, b) => a.hour - b.hour)
}
