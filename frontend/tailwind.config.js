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
        narvik: {
          DEFAULT: '#EAE7DD',
          50: '#FAF9F5',
          100: '#F5F3EC',
          200: '#EAE7DD',
          300: '#D7D2C0',
          400: '#C2BBA2',
          500: '#AFA686',
        },
        sorrell: {
          DEFAULT: '#99775C',
          50: '#F8F6F4',
          100: '#EEE7E1',
          200: '#DECFC3',
          300: '#CDB7A5',
          400: '#BC9F87',
          500: '#99775C',
          600: '#84644B',
          700: '#6B503B',
          800: '#523D2C',
          900: '#3A2A1E',
        },
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
