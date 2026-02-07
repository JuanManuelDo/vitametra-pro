export interface GlucosePoint {
  time: string;
  value: number;
  isProjection?: boolean;
}

export const glucosePredictor = {
  /**
   * Predice el impacto de los carbohidratos en la glucosa con curva fisiológica
   * @param currentLevel Nivel actual de glucosa (mg/dL)
   * @param carbs Gramos de carbohidratos ingeridos
   */
  predictImpact: (currentLevel: number, carbs: number): GlucosePoint[] => {
    const points: GlucosePoint[] = [];
    const now = new Date();
    
    // Sensibilidad: 1g de carb ≈ 3.2 mg/dL de subida
    const peakRise = carbs * 3.2; 
    
    // Generamos 12 puntos (3 horas de proyección, cada 15 min)
    for (let i = 0; i <= 12; i++) {
      const futureTime = new Date(now.getTime() + i * 15 * 60000);
      const timeStr = futureTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      // --- ALGORITMO BIO-SINTÉTICO VITAMETRA ---
      // i=0 (0 min), i=4 (60 min), i=12 (180 min)
      const x = i; 
      const peakTime = 4.5; // El pico real suele ocurrir entre 60-75 min
      
      let impactMultiplier: number;

      if (x <= peakTime) {
        // Fase de Absorción: Crecimiento sigmoideo (suave al inicio, rápido después)
        impactMultiplier = Math.pow(x / peakTime, 2);
      } else {
        // Fase de Resolución: Decaimiento exponencial (acción de la insulina)
        // El factor 1.1 simula que la insulina intenta llevarte al nivel base e incluso un poco menos
        const decayFactor = (x - peakTime) / (12 - peakTime);
        impactMultiplier = Math.max(-0.1, 1 - (1.1 * decayFactor));
      }

      const projectedValue = currentLevel + (peakRise * impactMultiplier);

      points.push({
        time: timeStr,
        value: Math.round(projectedValue),
        isProjection: true
      });
    }

    return points;
  },

  /**
   * Analiza la severidad del impacto para el Bio-Veredicto
   */
  getSeverity: (points: GlucosePoint[]) => {
    const max = Math.max(...points.map(p => p.value));
    if (max > 180) return { label: 'ALTO', color: '#FF3B30' };
    if (max > 140) return { label: 'MEDIO', color: '#FF9500' };
    return { label: 'ESTABLE', color: '#34C759' };
  }
};