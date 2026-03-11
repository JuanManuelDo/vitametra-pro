export function calculateMetabolicScore(
  tir: number,
  variability: number,
  hba1c: number
) {
  let score = 100

  score -= (100 - tir) * 0.3
  score -= variability * 0.1
  score -= (hba1c - 6) * 10

  return Math.max(0, Math.min(100, Math.round(score)))
}
