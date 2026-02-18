export interface InsulinProfile {
  basalType?: string
  bolusType?: string
  insulinToCarbRatio?: number
  correctionFactor?: number
}

export interface MedicationProfile {
  name: string
  dose?: string
}

export interface UserClinicalProfile {
  diabetesType: 'T1' | 'T2' | 'LADA' | 'GDM' | 'Other'
  weight?: number
  height?: number
  insulin?: InsulinProfile
  medications?: MedicationProfile[]
}
