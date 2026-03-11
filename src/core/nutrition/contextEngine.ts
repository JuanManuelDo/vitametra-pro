export interface ContextData {
  hourOfDay: number
  exerciseLast2h: boolean
  stressLevel: 1 | 2 | 3 | 4 | 5
  sleepQuality: 1 | 2 | 3 | 4 | 5
}

export interface ContextAdjustedImpact {
  originalDelta: number
  adjustedDelta: number
  contextMultiplier: number
}

export function adjustImpactByContext(
  delta: number,
  context: ContextData
): ContextAdjustedImpact {

  let multiplier = 1

  // Horario (mañana suele ser más resistente en T2)
  if (context.hourOfDay >= 6 && context.hourOfDay <= 10) {
    multiplier += 0.1
  }

  // Ejercicio reciente reduce impacto
  if (context.exerciseLast2h) {
    multiplier -= 0.2
  }

  // Estrés aumenta impacto
  multiplier += (context.stressLevel - 3) * 0.05

  // Mal sueño aumenta resistencia
  multiplier += (3 - context.sleepQuality) * 0.05

  const adjusted = delta * multiplier

  return {
    originalDelta: delta,
    adjustedDelta: Number(adjusted.toFixed(2)),
    contextMultiplier: Number(multiplier.toFixed(2))
  }
}
