import { GlucoseReading } from '../types/glucose.types'

export function mergeGlucoseReadings(
  readings: GlucoseReading[],
  duplicateWindowMinutes = 5
): GlucoseReading[] {
  if (!readings?.length) return []

  const sorted = [...readings].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() -
      new Date(b.timestamp).getTime()
  )

  const result: GlucoseReading[] = []

  for (const current of sorted) {
    const currentTime = new Date(current.timestamp).getTime()

    const isDuplicate = result.find(existing => {
      const existingTime = new Date(existing.timestamp).getTime()
      const diffMinutes = Math.abs(currentTime - existingTime) / 60000
      return diffMinutes <= duplicateWindowMinutes
    })

    if (!isDuplicate) {
      result.push(current)
    }
  }

  return result
}
