import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.mdx",
  ],
  theme: {
    extend: {
      // Notebook palette: chalk on black graph paper, amber ink, red stamps.
      colors: {
        paper: {
          bg: "#0c0c0c",
          ink: "#ecebe6",
          body: "#cfccc3",
          muted: "#9c998f",
          line: "rgba(255,255,255,0.15)",
          accent: "#fbb040",
          stamp: "#ef5b5b",
        },
        muted: {
          DEFAULT: "rgba(255,255,255,0.05)",
          foreground: "#9c998f",
        },
        navy: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#1e1b4b',
        },
      },
      fontFamily: {
        hand: ["var(--font-hand)", "cursive"],
        print: ["var(--font-print)", "cursive"],
        heading: ["var(--font-hand)", "cursive"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
