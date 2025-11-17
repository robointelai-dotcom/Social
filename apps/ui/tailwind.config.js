/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    '../../libs/shared/src/**/*.{js,jsx,ts,tsx}',   // <-- important for @shared/*
  ],
  theme: { extend: {} },
  plugins: [],
}
