export interface BioAdvice {
  message: string;
  type: 'warning' | 'success' | 'info';
  action: string;
  // Factores para el motor matemático del GlucosePredictor
  delayFactor: number; 
  heightFactor: number;
}

export const bioAdvisor = {
  /**
   * Analiza la composición química de la ingesta para modular la curva
   * y generar el consejo bio-inteligente.
   */
  getAdvice: (foods: any[]): BioAdvice => {
    // 1. Extraer Macros
    const totalCarbs = foods.reduce((acc, f) => acc + (f.carbs || 0), 0);
    const totalProtein = foods.reduce((acc, f) => acc + (f.protein || 0), 0);
    const totalFat = foods.reduce((acc, f) => acc + (f.fat || 0), 0);
    const totalFiber = foods.reduce((acc, f) => acc + (f.fiber || 0), 0);

    // 2. Configuración Base
    let advice: BioAdvice = {
      message: "Respuesta metabólica estable. Tu combinación de alimentos mantiene el balance.",
      type: 'success',
      action: "Mantén este ritmo metabólico.",
      delayFactor: 1.0,
      heightFactor: 1.0
    };

    // --- LÓGICA DE MODULACIÓN BIO-QUÍMICA ---

    // A. Efecto Amortiguador (Proteína + Fibra)
    if (totalProtein > 20 || totalFiber > 8) {
      advice.heightFactor = 0.85; // Aplana el pico un 15%
      advice.message = "Sinergia detectada: La proteína y fibra están amortiguando el impacto glucémico.";
      advice.action = "Excelente arquitectura de plato para estabilidad.";
    }

    // B. Efecto de Retraso (Grasas Saludables)
    if (totalFat > 15) {
      advice.delayFactor = 1.35; // Retrasa el pico un 35%
      advice.message = "Las grasas detectadas ralentizarán la absorción, evitando un pico agudo.";
      advice.action = "El pico será tardío pero más controlado.";
      advice.type = 'info';
    }

    // C. Alerta de Carga Crítica (Carbs Aislados)
    if (totalCarbs > 50 && totalFat < 10 && totalProtein < 10) {
      advice.heightFactor = 1.2; // Aumenta la intensidad del pico un 20%
      advice.delayFactor = 0.8;  // El pico ocurre más rápido
      advice.message = "Carga glucémica aislada (sin frenos). Riesgo de pico de insulina y estrés oxidativo.";
      advice.type = 'warning';
      advice.action = "Beber 500ml de agua y realizar caminata vigorosa de 15 min.";
    }

    return advice;
  }
};