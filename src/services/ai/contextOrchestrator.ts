// src/services/contextOrchestrator.ts

/**
 * Orquestador de Contexto MetraCore v1
 * Este módulo prepara la "memoria" para que la IA entienda la biología del usuario.
 */
export const buildMetabolicPrompt = (userHistory: any[], foodDatabase: any) => {
  
  // Filtrar datos sensibles para privacidad por diseño (Prompt 4)
  const anonymousHistory = userHistory.map(h => ({
    tipo: h.type,
    valor: h.value,
    fecha: h.timestamp?.toDate ? h.timestamp.toDate().toISOString() : 'Reciente',
    nota: h.metadata?.note || ''
  }));

  return `
    SISTEMA DE ANÁLISIS GLICÉMICO PERSONALIZADO (MODO MVP - HISTÓRICO)
    
    OBJETIVO: Analizar la imagen de comida y predecir el impacto basándose en la respuesta biológica individual.

    1. DATOS DE REFERENCIA NUTRICIONAL:
    ${JSON.stringify(foodDatabase)}

    2. HISTORIAL METABÓLICO RECIENTE (LOG DE EVENTOS):
    Analiza estos datos previos para encontrar patrones (ej: si el usuario sube mucho con pastas):
    ${JSON.stringify(anonymousHistory)}

    3. TAREA DE ANÁLISIS:
    - Identifica los alimentos en la imagen.
    - Calcula carbohidratos (CH), Proteínas y Grasas.
    - REGLA DE ORO: Si el historial muestra que el usuario tiene picos > 180mg/dL con alimentos similares, marca el riesgo como "CRÍTICO".
    
    4. FORMATO DE RESPUESTA (JSON):
    {
      "alimentos_detectados": [],
      "carbohidratos_estimados": 0,
      "indice_glicemico_teorico": "Bajo/Medio/Alto",
      "impacto_personalizado_esperado": "Basado en su historial, este alimento suele elevar su glucosa en X mg/dL",
      "sugerencia_contextual": "Ej: Considera que hace 2 horas hiciste ejercicio, tu sensibilidad podría ser mayor."
    }

    ADVERTENCIA LEGAL: No entregues dosis de insulina. Solo realiza análisis histórico y educativo.
  `;
};