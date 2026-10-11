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
        cyber: {
          dark: '#1c1917', // stone-900 base
          card: '#292524', // stone-800
          border: '#44403c', // stone-700
          accent: '#f59e0b', // amber-500
          glow: '#fbbf24'    // amber-400
        }
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      },
      animation: {
        scan: 'scan 3s linear infinite'
      }
    },
  },
  plugins: [],
}
