
import { UserData } from '../types';

/**
 * Determina el saludo adecuado basado en el nombre o el género registrado.
 * Implementa la lógica de UX: Bienvenido vs Bienvenida vs Hola.
 */
export const getGenderedWelcome = (name: string, gender?: string): string => {
    if (!name) return "¡Hola!";

    // 1. Prioridad: Género explícito en DB
    if (gender === 'FEMENINO') return "Bienvenida";
    if (gender === 'MASCULINO') return "Bienvenido";

    // 2. Análisis heurístico del nombre (Terminación)
    const lowerName = name.toLowerCase().trim();
    
    // Nombres que terminan en 'a' suelen ser femeninos
    if (lowerName.endsWith('a')) return "Bienvenida";
    
    // Nombres que terminan en 'o' suelen ser masculinos
    if (lowerName.endsWith('o')) return "Bienvenido";

    // 3. Caso de incertidumbre: Fórmula neutral
    return "Hola";
};

/**
 * Retorna la frase completa de bienvenida personalizada.
 */
export const getFullWelcomeMessage = (user: UserData | null): string => {
    if (!user) return "¡Qué bueno tenerte aquí!";
    
    const greeting = getGenderedWelcome(user.firstName, user.gender);
    
    if (greeting === "Hola") {
        return `Hola, ${user.firstName}, qué gusto verte de nuevo`;
    }
    
    return `${greeting}, ${user.firstName}`;
};
