const path = require("path");

module.exports = {
  content: [path.join(__dirname, "src/**/*.{ts,tsx}")],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      colors: {
        brand: {
          DEFAULT: "#0b6b3a",
          light: "#e8f6ee",
          dark: "#084d2a",
          50: "#effaf3",
          100: "#d8f2e2",
          200: "#b3e4c8",
          300: "#7fcfa5",
          400: "#45b07c",
          500: "#1f925e",
          600: "#12784b",
          700: "#0b6b3a",
          800: "#084d2a",
          900: "#063a20",
          950: "#032414",
        },
        or: { 50: "#fff9e6", 100: "#fff0bf", 300: "#ffd65c", 400: "#fbc531", 500: "#f2b100", 600: "#d19500", 700: "#a87400" },
      },
      boxShadow: {
        doux: "0 1px 2px rgba(15,23,42,.04), 0 4px 16px -4px rgba(15,23,42,.08)",
        releve: "0 2px 4px rgba(15,23,42,.04), 0 16px 40px -12px rgba(6,58,32,.25)",
      },
    },
  },
  plugins: [],
};
