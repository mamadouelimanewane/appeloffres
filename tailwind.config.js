const path = require("path");

module.exports = {
  content: [path.join(__dirname, "src/**/*.{ts,tsx}")],
  theme: { extend: { colors: { brand: { DEFAULT: "#0b6b3a", dark: "#084d2a", light: "#e7f4ec" } } } },
  plugins: [],
};
