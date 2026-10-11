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
        abstract: {
          dark: '#090d1a',
          darker: '#050811',
          surface: '#0e1529',
          elevated: '#131d38',
          card: 'rgba(16, 24, 46, 0.72)',
          border: 'rgba(255, 255, 255, 0.08)',
          iris: '#6366f1',
          violet: '#8b5cf6',
          fuchsia: '#d946ef',
          coral: '#f43f5e',
          amber: '#f59e0b',
          teal: '#14b8a6',
          cyan: '#06b6d4',
          sky: '#38bdf8'
        },
        cyber: {
          dark: '#090d1a',
          card: '#10182e',
          border: '#1e293b',
          accent: '#6366f1',
          glow: '#818cf8'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        'aurora-drift': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.08)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' }
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      },
      animation: {
        scan: 'scan 3s linear infinite',
        'aurora-drift': 'aurora-drift 12s ease-in-out infinite',
        'float-gentle': 'float-gentle 4s ease-in-out infinite'
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 20px 48px -12px rgba(2, 6, 23, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        'abstract-iris': '0 0 35px -5px rgba(99, 102, 241, 0.35)',
        'abstract-cyan': '0 0 35px -5px rgba(6, 182, 212, 0.35)',
        'abstract-coral': '0 0 35px -5px rgba(244, 63, 94, 0.35)'
      }
    },
  },
  plugins: [],
}
