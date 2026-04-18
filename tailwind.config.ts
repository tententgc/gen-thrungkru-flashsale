import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C84B31",
          fg: "#FFFFFF",
          50: "#FDF3F0",
          100: "#FADFD7",
          200: "#F3B3A3",
          300: "#E88770",
          400: "#D8644A",
          500: "#C84B31",
          600: "#A53A24",
          700: "#7E2B19",
          800: "#581C10",
          900: "#371008",
        },
        secondary: {
          DEFAULT: "#FFB84D",
          fg: "#2B1F0F",
        },
        accent: {
          DEFAULT: "#2D7D6E",
          fg: "#FFFFFF",
        },
        background: "#FAF7F2",
        surface: "#FFFFFF",
        muted: "#6B7280",
        border: "#E5E0D8",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        flash: "#FF3B30",
        ink: "#1F1912",
      },
      fontFamily: {
        sans: ["var(--font-plex-thai)", "var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-plex-thai)", "var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 2px 10px -3px rgba(40, 24, 10, 0.08)",
        pop: "0 10px 30px -10px rgba(200, 75, 49, 0.35)",
      },
      keyframes: {
        "pulse-flash": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.04)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(14px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "pulse-flash": "pulse-flash 1.6s ease-in-out infinite",
        "slide-up": "slide-up 320ms ease-out both",
        shimmer: "shimmer 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
