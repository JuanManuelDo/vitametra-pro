import type { MLModel, MLModelInput, MLModelOutput } from './modelInterface.ts'

export class LocalLinearModel implements MLModel {

  predict(input: MLModelInput): MLModelOutput {

    const base =
      input.carbs * 2.1 +
      input.fat * 0.4 -
      input.protein * 0.6

    const adjusted = base * input.contextMultiplier

    return {
      predictedDelta: Number(adjusted.toFixed(2)),
      confidence: 0.65
    }
  }
}
