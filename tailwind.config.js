/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'solar-yellow': '#FFD700',
        'solar-green': '#2D5016',
        'solar-blue': '#A8B8D8',
        primary: '#2D5016',
        secondary: '#F5F5F5',
      }
    },
  },
  plugins: [],
}
