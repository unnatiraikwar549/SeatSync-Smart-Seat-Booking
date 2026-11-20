/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Manrope"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['"Lora"', 'Georgia', 'serif'],
        heading: ['"Lora"', 'Georgia', 'serif'],
        manrope: ['"Manrope"', 'sans-serif'],
        lora: ['"Lora"', 'Georgia', 'serif'],
      },
      colors: {
        navy: {
          950: '#070c1d',
          900: '#0a1128',
          850: '#0d1633',
          800: '#111e47',
          700: '#1e293b',
        },
        electric: {
          glow: '#00f0ff',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        }
      }
    },
  },
  plugins: [],
}
