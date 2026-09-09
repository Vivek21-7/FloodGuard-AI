/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        flood: {
          low: '#10b981',      // emerald-500
          moderate: '#f59e0b', // amber-500
          high: '#f97316',     // orange-500
          critical: '#ef4444', // red-500
        },
        slate: {
          850: '#151e2e',
          950: '#070b14',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
