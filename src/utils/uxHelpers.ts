import { UserData } from '../types';

/**
 * Determina el saludo adecuado basado en el nombre o el género registrado.
 * Versión Protegida: Maneja valores null/undefined para evitar errores de renderizado.
 */
export const getGenderedWelcome = (name?: string | null, gender?: string): string => {
    // DEFENSA: Si no hay nombre, abortamos el análisis y devolvemos saludo neutral
    if (!name) return "Hola";

    // 1. Prioridad: Género explícito en DB (Normalizado a mayúsculas para evitar fallos de coincidencia)
    const upperGender = gender?.toUpperCase();
    if (upperGender === 'FEMENINO') return "Bienvenida";
    if (upperGender === 'MASCULINO') return "Bienvenido";

    // 2. Análisis heurístico del nombre (Terminación)
    const lowerName = name.toLowerCase().trim();
    
    // Nombres que terminan en 'a' suelen ser femeninos
    if (lowerName.endsWith('a')) return "Bienvenida";
    
    // Nombres que terminan en 'o' suelen ser masculinos
    if (lowerName.endsWith('o')) return "Bienvenido";

    // 3. Caso de incertidumbre o nombre no binario/neutro
    return "Hola";
};

/**
 * Retorna la frase completa de bienvenida personalizada.
 * Versión Protegida: Usa Optional Chaining y valores por defecto.
 */
export const getFullWelcomeMessage = (user: UserData | null): string => {
    // DEFENSA: Si el objeto user es null, devolvemos frase genérica
    if (!user || !user.firstName) {
        return "¡Qué bueno tenerte aquí!";
    }
    
    // Llamamos a la función de género con seguridad
    const greeting = getGenderedWelcome(user.firstName, user.gender);
    
    if (greeting === "Hola") {
        return `Hola, ${user.firstName}, qué gusto verte de nuevo`;
    }
    
    return `${greeting}, ${user.firstName}`;
};