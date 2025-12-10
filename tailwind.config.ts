import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf2ff",
          100: "#f8ddff",
          200: "#f1b7ff",
          300: "#e481ff",
          400: "#d24dff",
          500: "#b51fe6",
          600: "#9014bf",
          700: "#6f1096",
          800: "#520b6e",
          900: "#39074d"
        }
      }
    }
  },
  plugins: []
};

export default config;


