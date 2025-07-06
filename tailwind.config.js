/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#fdf2f6",
          100: "#fce7ed",
          200: "#facfdc",
          300: "#f7aac0",
          400: "#f1749d",
          500: "#e8477d",
          600: "#d1295f",
          700: "#a31261", // Main color
          800: "#901452",
          900: "#7a1748",
        },
      },
    },
  },
  plugins: [],
};
