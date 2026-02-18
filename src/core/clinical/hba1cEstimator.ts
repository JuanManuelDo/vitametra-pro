export interface HbA1cResult {
  estimatedHbA1c: number
  category: 'normal' | 'prediabetes' | 'diabetes' | 'poor_control'
}

export function estimateHbA1c(meanGlucose: number): HbA1cResult {
  const estimated = (meanGlucose + 46.7) / 28.7

  const rounded = Number(estimated.toFixed(2))

  let category: HbA1cResult['category']

  if (rounded < 5.7) category = 'normal'
  else if (rounded < 6.5) category = 'prediabetes'
  else if (rounded < 8) category = 'diabetes'
  else category = 'poor_control'

  return {
    estimatedHbA1c: rounded,
    category
  }
}
