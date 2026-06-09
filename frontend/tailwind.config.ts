import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          base: "var(--color-bg-base)",
          sidebar: "var(--color-bg-sidebar)",
          surface: "var(--color-bg-surface)",
          elevated: "var(--color-bg-elevated)",
          border: "var(--color-border)",
        },
        accent: {
          DEFAULT: "#E07820",
          hover: "#C96A10",
          muted: "rgba(224,120,32,0.15)",
        },
        /** Accent dashboard — ardoise + bleu lien (Tout voir) */
        studio: {
          DEFAULT: "var(--studio-default)",
          light: "var(--studio-light)",
          muted: "var(--studio-muted)",
          soft: "var(--studio-soft)",
          border: "var(--studio-border)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
      },
      borderRadius: {
        card: "16px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
