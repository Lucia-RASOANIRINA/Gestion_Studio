/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "gs-black": "#0F0F12",
        "gs-dark-gray": "#1A1A21",
        "gs-blue": "#00D4FF",
        "gs-violet": "#8B5CF6",
        "gs-green": "#00FF9F",
        "gs-orange": "#FF6B35",
        "gs-light": "#E0E0E5",
        "gs-navy": "#1E2A44",
        "gs-dark-violet": "#4C1D95",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
