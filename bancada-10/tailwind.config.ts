import type { Config } from 'tailwindcss'

/**
 * Paleta oficial da Bancada 10.
 * Vermelho é reservado para CTAs, preços promocionais e selos — nunca como cor de fundo extensa.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#141414',
          soft: '#1F1F1F',
          muted: '#3A3A3A',
        },
        bancada: {
          red: {
            DEFAULT: '#D71920',
            dark: '#B5141A',
            light: '#E84A50',
          },
          off: '#F4F0E8',
        },
      },
      fontFamily: {
        display: [
          '"Archivo Black"',
          'Arial Black',
          'Helvetica Neue',
          'Helvetica',
          'sans-serif',
        ],
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      letterSpacing: {
        tightest: '-0.04em',
        wide2: '0.08em',
        wide3: '0.16em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,20,20,0.06), 0 8px 24px -12px rgba(20,20,20,0.18)',
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ticker-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'ticker-in': 'ticker-in 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
