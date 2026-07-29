/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            50: '#eaf6fb',
            100: '#cdeaf5',
            200: '#9ad4eb',
            300: '#62b9db',
            400: '#3aa0c9',
            500: '#1f84b0',
            600: '#146c94',
            700: '#125877',
            800: '#124862',
            900: '#0f3a4f',
            950: '#082433',
          },
          red: {
            50: '#fdeeee',
            100: '#fbd4d3',
            200: '#f5a5a3',
            300: '#ec7370',
            400: '#e14b47',
            500: '#d32f2b',
            600: '#b8221f',
            700: '#951c1a',
            800: '#791a19',
            900: '#631918',
            950: '#360a09',
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
