// src/services/contextOrchestrator.ts

export const buildMetabolicPrompt = (userHistory: any[], foodDatabase: any) => {
  return `
    ESTRATEGIA: LONG-CONTEXT METABOLIC LEARNING
    
    1. DICCIONARIO NUTRICIONAL (FOODDATA CENTRAL REFERENCE):
    ${JSON.stringify(foodDatabase)}

    2. HISTORIAL FHIR DEL PACIENTE (MANY-SHOT EXAMPLES):
    A continuación presento los últimos eventos de glucosa y comidas. 
    Analiza la relación entre carbohidratos consumidos y picos de glucosa observados:
    ${userHistory.map(h => `Evento: ${h.food}, Glucosa Post: ${h.glucosePeak}mg/dL, Tiempo: ${h.timestamp}`).join('\n')}

    3. TAREA:
    Analiza la imagen adjunta. Busca referencias de escala (cubiertos/manos). 
    Cruza los ingredientes detectados con el Diccionario (Punto 1) y calibra 
    el Índice Glucémico basándote en la respuesta biológica histórica del usuario (Punto 2).
    
    Si el usuario muestra picos > 40mg/dL con ingredientes presentes en la foto, 
    ajusta la predicción de impacto a ALTO RIESGO independientemente del IG teórico.
  `;
};