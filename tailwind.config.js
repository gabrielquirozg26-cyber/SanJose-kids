/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'san-jose-blue': '#1e3a8a', // Azul profundo del logo
        'san-jose-yellow': '#facc15', // Amarillo brillante del logo
      },
    },
  },
  plugins: [],
}