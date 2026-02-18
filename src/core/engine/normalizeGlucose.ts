import { GlucoseReading } from '../types/glucose.types'

interface RawGlucoseEntry {
  value: number
  timestamp: any
  source?: string
}

export function normalizeGlucoseData(rawData: RawGlucoseEntry[]): GlucoseReading[] {
  return rawData
    .map(entry => {
      let isoTimestamp: string

      if (entry.timestamp?.toDate) {
        isoTimestamp = entry.timestamp.toDate().toISOString()
      } else if (typeof entry.timestamp === 'string') {
        isoTimestamp = new Date(entry.timestamp).toISOString()
      } else {
        return null
      }

      return {
        value: Number(entry.value),
        timestamp: isoTimestamp,
        source: entry.source || 'manual'
      }
    })
    .filter(Boolean) as GlucoseReading[]
}
