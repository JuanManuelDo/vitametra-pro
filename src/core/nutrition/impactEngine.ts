import type { Meal } from './mealModel.ts'

export interface GlucoseReading {
  value: number
  timestamp: string
}

export interface MealImpactResult {
  baseline: number
  peak: number
  delta: number
  minutesToPeak: number
  impactLevel: 'low' | 'moderate' | 'high'
}

export function analyzeMealImpact(
  meal: Meal,
  glucoseReadings: GlucoseReading[]
): MealImpactResult | null {

  const mealTime = new Date(meal.timestamp).getTime()

  // 1️⃣ Baseline = última lectura antes de la comida
  const previousReadings = glucoseReadings
    .filter(r => new Date(r.timestamp).getTime() <= mealTime)
    .sort((a, b) =>
      new Date(b.timestamp).getTime() -
      new Date(a.timestamp).getTime()
    )

  if (previousReadings.length === 0) return null

  const baseline = previousReadings[0].value

  // 2️⃣ Ventana post comida (2 horas)
  const twoHoursLater = mealTime + 2 * 60 * 60 * 1000

  const postMealReadings = glucoseReadings.filter(r => {
    const time = new Date(r.timestamp).getTime()
    return time > mealTime && time <= twoHoursLater
  })

  if (postMealReadings.length === 0) return null

  // 3️⃣ Pico máximo
  const peakReading = postMealReadings.reduce((max, current) =>
    current.value > max.value ? current : max
  )

  const peak = peakReading.value
  const delta = peak - baseline

  const minutesToPeak =
    (new Date(peakReading.timestamp).getTime() - mealTime) / 60000

  // 4️⃣ Clasificación impacto
  let impactLevel: MealImpactResult['impactLevel']

  if (delta < 30) impactLevel = 'low'
  else if (delta < 60) impactLevel = 'moderate'
  else impactLevel = 'high'

  return {
    baseline,
    peak,
    delta,
    minutesToPeak: Math.round(minutesToPeak),
    impactLevel
  }
}
