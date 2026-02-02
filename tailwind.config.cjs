/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0F172A',   // Azul oscuro sofisticado
          secondary: '#3B82F6', // Azul brillante para acciones
          accent: '#10B981',    // Verde para éxitos/salud
          bg: '#F8FAFC',        // Fondo gris ultra claro
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}