/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin-slow 30s linear infinite',
      },
      keyframes: {
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        },
      },
    },
    fontFamily: {
      // 'lexend-deca': ['"Lexend Deca"', 'serif'],
      sans: ['"Outfit"', 'serif'],
    },
  },
  plugins: [require('tailwindcss-motion')],
};
