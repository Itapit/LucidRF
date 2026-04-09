const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
  theme: {
    extend: {
      colors: {
        lrf: {
          bg: '#f4f4f0',
          dark: '#1a1a1a',
          border: '#e0e0dc',
          sidebar: '#fafaf8',
        },
      },
      keyframes: {
        slideInLeft: {
          '0%': { transform: 'translateX(-15%)', opacity: '0.5' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in': 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-delayed': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('team-hover', '.team:hover &');
    }),
  ],
};
