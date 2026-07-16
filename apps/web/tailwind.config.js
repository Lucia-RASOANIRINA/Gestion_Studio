/** @type {import('tailwindcss').Config} */

// Chaque couleur pointe vers une variable CSS (canaux RVB) définie dans styles.scss.
// Cela permet un thème clair/sombre en changeant une classe sur <html>, tout en
// gardant les modificateurs d'opacité Tailwind (ex. text-gs-light/60).
function withOpacity(variable) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "gs-black": withOpacity("--gs-black"),
        "gs-dark-gray": withOpacity("--gs-dark-gray"),
        "gs-blue": withOpacity("--gs-blue"),
        "gs-violet": withOpacity("--gs-violet"),
        "gs-green": withOpacity("--gs-green"),
        "gs-orange": withOpacity("--gs-orange"),
        "gs-light": withOpacity("--gs-light"),
        "gs-navy": withOpacity("--gs-navy"),
        "gs-dark-violet": withOpacity("--gs-dark-violet"),
        "gs-border": withOpacity("--gs-border"),
        "gs-hover": withOpacity("--gs-hover"),
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
