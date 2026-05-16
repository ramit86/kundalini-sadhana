/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ["'Cormorant Garamond'", 'serif'],
        raleway: ["'Raleway'", 'sans-serif'],
      },
      colors: {
        deep: '#0F0D0A',
        gold: '#C8A96E',
        'gold-light': '#E8DDD0',
        'gold-dim': '#7A6540',
      },
    },
  },
  plugins: [],
};
