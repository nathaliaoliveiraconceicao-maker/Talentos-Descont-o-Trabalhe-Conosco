/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Paleta oficial VagaHub (ver vagahub_apresentacao.pdf): azul
          // vibrante como cor de ação primária, azul-marinho para chrome
          // escuro/institucional, lilás para acentos de interface SaaS e
          // coral para avisos/destaques. Verde e amarelo (abaixo) seguem
          // existindo só para semântica de status (aprovado/nota), nunca
          // como cor de marca — conforme diretriz do PDF.
          blue: {
            50: '#e4eafb',
            100: '#c9d4f6',
            200: '#aebff2',
            300: '#92a9ee',
            400: '#7794ea',
            500: '#5c7ee5',
            600: '#4169e1',
            700: '#3353b1',
            800: '#253c81',
            900: '#182652',
            950: '#0a1022',
          },
          navy: {
            50: '#dee0e7',
            100: '#bdc1ce',
            200: '#9ca2b6',
            300: '#7a829d',
            400: '#596385',
            500: '#38446c',
            600: '#172554',
            700: '#121d42',
            800: '#0d1530',
            900: '#080d1e',
            950: '#03060d',
          },
          lilac: {
            50: '#ece8ff',
            100: '#dad0fe',
            200: '#c7b9fe',
            300: '#b4a2fd',
            400: '#a18bfd',
            500: '#8f73fc',
            600: '#7c5cfc',
            700: '#6248c6',
            800: '#473591',
            900: '#2d215b',
            950: '#130e26',
          },
          red: {
            50: '#ffeaea',
            100: '#ffd5d5',
            200: '#ffc0c0',
            300: '#ffaaaa',
            400: '#ff9595',
            500: '#ff8080',
            600: '#ff6b6b',
            700: '#c95454',
            800: '#933e3e',
            900: '#5c2727',
            950: '#261010',
          },
          green: {
            50: '#eefbf1',
            100: '#d6f5dd',
            200: '#aeeabc',
            300: '#79d896',
            400: '#45bd6e',
            500: '#22a052',
            600: '#158041',
            700: '#126636',
            800: '#12512e',
            900: '#0f4327',
            950: '#062515',
          },
          yellow: {
            50: '#fffceb',
            100: '#fff6c7',
            200: '#ffea8a',
            300: '#ffd94d',
            400: '#ffc824',
            500: '#f9ab0b',
            600: '#dd8206',
            700: '#b75c09',
            800: '#94480e',
            900: '#7a3c0f',
            950: '#461d04',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px 0 rgb(15 58 79 / 0.06), 0 1px 2px 0 rgb(15 58 79 / 0.04)',
        'card-hover': '0 8px 24px 0 rgb(15 58 79 / 0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
