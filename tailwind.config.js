/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            50: '#eef4ff',
            100: '#d9e4ff',
            500: '#2563eb',
            600: '#1d4ed8',
            700: '#1e40af',
            900: '#172554',
          },
          green: {
            100: '#d1fae5',
            500: '#10b981',
            600: '#059669',
          },
          orange: {
            100: '#ffedd5',
            500: '#f97316',
            600: '#ea580c',
          },
          red: {
            500: '#ef4444',
          },
        },
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
