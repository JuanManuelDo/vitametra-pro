import { calculateTIR } from './core/engine/tirCalculator.ts'
import { calculateVariability } from './core/engine/variabilityCalculator.ts'
import { interpretVariability } from './core/clinical/variabilityInterpretation.ts'
import { generateMetabolicSummary } from './core/clinical/metabolicSummary.ts'
import { estimateHbA1c } from './core/clinical/hba1cEstimator.ts'
import { generateClinicalReport } from './core/clinical/clinicalReport.ts'
import { calculateMetabolicScore } from './core/scoring/metabolicScore.ts'
import { generateRecommendations } from './core/recommendations/recommendationEngine.ts'

const sampleData = [
  { value: 65, timestamp: '2026-02-15T08:00:00Z' },
  { value: 110, timestamp: '2026-02-15T09:00:00Z' },
  { value: 200, timestamp: '2026-02-15T10:00:00Z' },
  { value: 250, timestamp: '2026-02-15T11:00:00Z' },
  { value: 75, timestamp: '2026-02-15T12:00:00Z' }
]

// 1️⃣ TIR
const tirResult = calculateTIR(sampleData)
console.log('TIR:', tirResult)

// 2️⃣ Variabilidad
const variability = calculateVariability(sampleData)
console.log('Variability:', variability)

// 3️⃣ Interpretación clínica variabilidad
const variabilityAssessment = interpretVariability(variability)
console.log('Variability Assessment:', variabilityAssessment)

// 4️⃣ Resumen metabólico consolidado
const metabolicSummary = generateMetabolicSummary(tirResult, variability)
console.log('Metabolic Summary:', metabolicSummary)

// 5️⃣ Estimación HbA1c
const hba1c = estimateHbA1c(variability.mean)
console.log('Estimated HbA1c:', hba1c)

// 6️⃣ Clinical Report consolidado
const clinicalReport = generateClinicalReport(
  tirResult,
  variability,
  hba1c
)
console.log('Clinical Report:', clinicalReport)

// 7️⃣ Metabolic Score (B2C ready 🚀)
const metabolicScore = calculateMetabolicScore(
  tirResult,
  variability,
  hba1c
)


// 8️⃣ Recomendaciones B2C
const recommendations = generateRecommendations(
  tirResult,
  variability,
  hba1c,
  metabolicScore
)

console.log('Recommendations:', recommendations)

