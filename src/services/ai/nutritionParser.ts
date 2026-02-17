export interface ParsedFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Diccionario de referencia para el Bio-Parser
const NUTRITION_DATABASE: Record<string, ParsedFood> = {
  "huevo": { name: "Huevo (Unidad)", calories: 70, protein: 6, carbs: 0.5, fat: 5 },
  "huevos": { name: "Huevos", calories: 140, protein: 12, carbs: 1, fat: 10 },
  "pan": { name: "Pan Integral", calories: 80, protein: 3, carbs: 15, fat: 1 },
  "tostada": { name: "Tostada", calories: 60, protein: 2, carbs: 12, fat: 1 },
  "cafe": { name: "Café Negro", calories: 2, protein: 0, carbs: 0, fat: 0 },
  "café": { name: "Café Negro", calories: 2, protein: 0, carbs: 0, fat: 0 },
  "leche": { name: "Leche (Vaso)", calories: 120, protein: 8, carbs: 12, fat: 5 },
  "manzana": { name: "Manzana", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  "pollo": { name: "Pechuga de Pollo", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  "arroz": { name: "Arroz Blanco", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  "palta": { name: "Palta/Aguacate", calories: 160, protein: 2, carbs: 9, fat: 15 },
  "aguacate": { name: "Palta/Aguacate", calories: 160, protein: 2, carbs: 9, fat: 15 }
};

export const nutritionParser = {
  parseText: async (text: string): Promise<ParsedFood[]> => {
    console.log("🧬 Bio-Core Parsing:", text);
    
    return new Promise((resolve) => {
      // Simulamos latencia de "pensamiento" de la IA
      setTimeout(() => {
        const words = text.toLowerCase().split(/\s+/);
        const foundFoods: ParsedFood[] = [];

        // Buscamos coincidencias en nuestro diccionario
        words.forEach(word => {
          // Limpiamos la palabra de comas o puntos
          const cleanWord = word.replace(/[.,]/g, "");
          if (NUTRITION_DATABASE[cleanWord]) {
            foundFoods.push(NUTRITION_DATABASE[cleanWord]);
          }
        });

        // Si no detecta nada, devolvemos un objeto genérico para no romper la UI
        if (foundFoods.length === 0) {
          foundFoods.push({
            name: "Comida no identificada",
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          });
        }

        resolve(foundFoods);
      }, 1200);
    });
  }
};