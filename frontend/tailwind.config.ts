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
          base: "#0A0A0F",
          sidebar: "#111118",
          surface: "#16161F",
          elevated: "#1C1C28",
          border: "rgba(255,255,255,0.06)",
        },
        accent: {
          DEFAULT: "#E07820",
          hover: "#C96A10",
          muted: "rgba(224,120,32,0.15)",
        },
        /** Accent dashboard — ardoise + bleu lien (Tout voir) */
        studio: {
          DEFAULT: "#5D6B7A",
          light: "#8BA4C7",
          muted: "rgba(139, 164, 199, 0.10)",
          soft: "rgba(139, 164, 199, 0.06)",
          border: "rgba(139, 164, 199, 0.20)",
        },
        text: {
          primary: "#F0EFE8",
          secondary: "#8A8A9A",
          muted: "#555566",
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
