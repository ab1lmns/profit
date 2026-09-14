/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Nunito", "sans-serif"],
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        profit: {
          orange: "#FF8A00",
          orangeLight: "#FFF4E6",
          orangeHover: "#E67A00",
          green: "#22C55E",
          greenDark: "#16A34A",
          greenLight: "#EBFBEE",
          teal: "#4EBA97",
          dark: "#1E293B",
          cardBg: "#FFFFFF",
          bgLight: "#FAF9F6",
        }
      }
    },
  },
  plugins: [],
};
