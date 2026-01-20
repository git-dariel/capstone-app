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
      keyframes: {
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "spin-slow": "spin-slow 3s linear infinite",
        shimmer: "shimmer 2s infinite",
        float: "float 3s ease-in-out infinite",
        "float-delayed": "float-delayed 4s ease-in-out infinite",
        gradient: "gradient 3s ease infinite",
      },
    },
  },
  plugins: [],
};
