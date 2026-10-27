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
        cream: {
          DEFAULT: '#F6EBE8',
          50: '#FCF8F7',
          100: '#F6EBE8',
          200: '#EEDAD5',
          300: '#E4C7C0',
        },
        navy: {
          DEFAULT: '#191636',
          50: '#F1F0F7',
          100: '#E2E0EE',
          200: '#C5C1DD',
          300: '#A49DC8',
          400: '#7B72AF',
          500: '#544A94',
          600: '#3D3478',
          700: '#2A2458',
          800: '#191636',
          900: '#110F25',
          950: '#0A0917',
        },
        indigo: {
          DEFAULT: '#302B69',
          50: '#F5F4FB',
          100: '#ECEAF7',
          200: '#D9D5EF',
          300: '#BDB6E3',
          400: '#8E82CF',
          500: '#5F52BA',
          600: '#302B69',
          700: '#262254',
          800: '#1D1A40',
          900: '#14122D',
        },
        lavender: {
          DEFAULT: '#F6F6FC',
          50: '#FAFAFD',
          100: '#F6F6FC',
          200: '#ECECF8',
          300: '#DDDDF2',
          400: '#C7C7E8',
        },
        // Mapped aliases so legacy references seamlessly use the exact new palette
        narvik: {
          DEFAULT: '#E8E2E5',
          50: '#F6EBE8',
          100: '#F6EBE8',
          200: '#E8E2E5',
          300: '#DBD3D8',
          400: '#CDC3C9',
          500: '#BEB2B9',
        },
        sorrell: {
          DEFAULT: '#302B69',
          50: '#F6F6FC',
          100: '#ECEAF7',
          200: '#D9D5EF',
          300: '#BDB6E3',
          400: '#8E82CF',
          500: '#302B69',
          600: '#262254',
          700: '#1D1A40',
          800: '#191636',
          900: '#110F25',
        },
        cyber: {
          dark: '#191636',
          card: '#FFFFFF',
          border: '#E8E2E5',
          accent: '#302B69',
          glow: '#F6F6FC'
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
