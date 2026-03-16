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
        danger: {
          DEFAULT: "var(--clr-danger-a0)",
          muted: "var(--clr-danger-a10)",
          subtle: "var(--clr-danger-a20)"
        },
        success: {
          DEFAULT: "var(--clr-success-a0)",
          muted: "var(--clr-success-a10)",
          subtle: "var(--clr-success-a20)"
        },
        warning: {
          DEFAULT: "var(--clr-warning-a0)",
          muted: "var(--clr-warning-a10)",
          subtle: "var(--clr-warning-a20)"
        },
        info: {
          DEFAULT: "var(--clr-info-a10)",
          muted: "var(--clr-info-a20)"
        },
        surface: {
          DEFAULT: "var(--clr-surface-a0)",
          10: "var(--clr-surface-a10)",
          20: "var(--clr-surface-a20)",
          30: "var(--clr-surface-a30)",
          40: "var(--clr-surface-a40)",
          50: "var(--clr-surface-a50)"
        },
        brand: {
          DEFAULT: "var(--clr-primary-a0)",
          10: "var(--clr-primary-a10)",
          20: "var(--clr-primary-a20)",
          30: "var(--clr-primary-a30)",
          40: "var(--clr-primary-a40)",
          50: "var(--clr-primary-a50)"
        },
        bg: "var(--background)",
        fg: "var(--foreground)"
      }
    }
  },
  plugins: []
};

export default config;
