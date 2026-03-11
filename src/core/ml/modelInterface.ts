export interface MLModelInput {
  carbs: number
  fat: number
  protein: number
  contextMultiplier: number
}

export interface MLModelOutput {
  predictedDelta: number
  confidence: number
}

export interface MLModel {
  predict(input: MLModelInput): MLModelOutput
}
