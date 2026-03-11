export interface VitametraIndexInput {
  tirPercent: number
  variabilityCV: number
  estimatedHbA1c: number
  averageDelta: number
  spikeFrequency: number
}

export interface VitametraIndexResult {
  index: number
  category: 'optimal' | 'stable' | 'unstable' | 'high-risk'
}

export function calculateVitametraIndex(
  input: VitametraIndexInput
): VitametraIndexResult {

  const tirScore = input.tirPercent

  const variabilityScore =
    input.variabilityCV < 36
      ? 100
      : 100 - (input.variabilityCV - 36) * 2

  const hba1cScore =
    input.estimatedHbA1c <= 7
      ? 100
      : 100 - (input.estimatedHbA1c - 7) * 20

  const deltaPenalty = input.averageDelta * 0.3
  const spikePenalty = input.spikeFrequency * 5

  const raw =
    (tirScore * 0.35) +
    (variabilityScore * 0.2) +
    (hba1cScore * 0.25) +
    (100 - deltaPenalty) * 0.1 +
    (100 - spikePenalty) * 0.1

  const finalIndex = Math.max(0, Math.min(100, raw))

  let category: VitametraIndexResult['category'] = 'optimal'

  if (finalIndex < 40) category = 'high-risk'
  else if (finalIndex < 60) category = 'unstable'
  else if (finalIndex < 80) category = 'stable'

  return {
    index: Number(finalIndex.toFixed(1)),
    category
  }
}
