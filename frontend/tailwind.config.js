/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#080C14',
        surface: '#0D1421',
        elevated: '#121B2E',
        hover: '#1A2540',
        'border-subtle': '#1E2D45',
        quantum: '#00C4E8',
        secure: '#22C55E',
        danger: '#EF4444',
        risk: '#F59E0B',
      }
    },
  },
  plugins: [],
}
