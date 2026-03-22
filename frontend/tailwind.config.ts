import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    { pattern: /^(bg|text|border|from|to|via|ring)-primary-(50|100|200|300|400|500|600|700|800|900|950)$/ },
    { pattern: /^(bg|text|border|from|to|via|ring)-accent-(400|500|600)$/ },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        accent: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      animation: {
        "float":          "float 6s ease-in-out infinite",
        "float-slow":     "float 9s ease-in-out infinite",
        "slide-in-left":  "slideInLeft 0.5s ease-out both",
        "slide-in-right": "slideInRight 0.5s ease-out both",
        "fade-in-up":     "fadeInUp 0.6s ease-out both",
        "scale-in":       "scaleIn 0.3s ease-out both",
        "pulse-soft":     "pulseSoft 3s ease-in-out infinite",
      },
      keyframes: {
        float:         { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        slideInLeft:   { from: { opacity: "0", transform: "translateX(-24px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        slideInRight:  { from: { opacity: "0", transform: "translateX(24px)" },  to: { opacity: "1", transform: "translateX(0)" } },
        fadeInUp:      { from: { opacity: "0", transform: "translateY(20px)" },  to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn:       { from: { opacity: "0", transform: "scale(0.94)" },       to: { opacity: "1", transform: "scale(1)" } },
        pulseSoft:     { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
      },
    },
  },
  plugins: [],
};

export default config;
