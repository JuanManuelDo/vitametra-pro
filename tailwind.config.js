/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0F172A',
          secondary: '#3B82F6',
          accent: '#10B981',
          bg: '#F8FAFC',
        }
      }
    },
  },
  plugins: [],
}
