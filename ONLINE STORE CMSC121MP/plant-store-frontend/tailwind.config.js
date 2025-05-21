/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#31473A',
        secondary: '#CCD9CA',
        accent: '#FFF3E3',
        success: '#bbf7d0',
        light: '#F9F1E7',
      },
    },
  },
  plugins: [],
} 