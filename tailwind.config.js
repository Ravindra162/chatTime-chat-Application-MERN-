/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    
    extend: {backgroundImage: {
      'hero': "url('./src/pages.chatBG.jpg')"}},
  },
  plugins: [require("daisyui")],
}