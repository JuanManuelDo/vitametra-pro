export interface GlucoseReading {
  value: number
  timestamp: string // ISO format
  source?: 'glucometer' | 'cgm' | 'manual'
}

export interface GlucoseDataset {
  readings: GlucoseReading[]
}
