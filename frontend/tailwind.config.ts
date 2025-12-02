// frontend/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--clr-surface-a10)",
        accent: "var(--clr-surface-a30)",
        danger: "var(--clr-danger-a0)",
        success: "var(--clr-success-a0)",
        warning: "var(--clr-warning-a0)",
        info: "var(--clr-info-a10)",
        surface: "var(--clr-surface-a0)"
      }
    }
  },
  plugins: []
};

export default config;
