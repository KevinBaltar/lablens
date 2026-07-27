/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f2f7ff",
          100: "#dfeeff",
          200: "#c5dcff",
          300: "#9ec6ff",
          400: "#6ba2ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#153e75",
          950: "#112d4e",
        },
      },
      boxShadow: {
        soft: "0 12px 30px -12px rgba(15, 23, 42, 0.18)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
