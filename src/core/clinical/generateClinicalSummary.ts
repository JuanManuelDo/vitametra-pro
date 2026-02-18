import { GlucoseReading } from '../types/glucose.types'
import { MealEntry } from '../types/nutrition.types'
import { UserClinicalProfile } from '../types/userProfile.types'

import { calculateTIR } from '../engine/tirCalculator'
import { calculateVariability } from '../engine/variabilityCalculator'

interface ClinicalSummaryInput {
  glucose: GlucoseReading[]
  meals: MealEntry[]
  profile: UserClinicalProfile
}

export function generateClinicalSummary(data: ClinicalSummaryInput) {
  const glucoseValues = data.glucose.map(g => g.value)

  const tir = calculateTIR(glucoseValues)
  const variability = calculateVariability(glucoseValues)

  return {
    tir,
    variability,
    diabetesType: data.profile.diabetesType,
    totalReadings: glucoseValues.length
  }
}
