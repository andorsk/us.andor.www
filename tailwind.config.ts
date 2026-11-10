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
        // shadcn / prompt-kit tokens, mapped onto the notebook palette.
        background: "#0c0c0c",
        foreground: "#ecebe6",
        border: "rgba(255,255,255,0.2)",
        input: "rgba(255,255,255,0.3)",
        ring: "#fbb040",
        primary: { DEFAULT: "#fbb040", foreground: "#0c0c0c" },
        secondary: { DEFAULT: "rgba(255,255,255,0.06)", foreground: "#ecebe6" },
        accent: { DEFAULT: "rgba(251,176,64,0.14)", foreground: "#fbb040" },
        destructive: { DEFAULT: "#ef5b5b", foreground: "#0c0c0c" },
        card: { DEFAULT: "#141414", foreground: "#ecebe6" },
        popover: { DEFAULT: "#141414", foreground: "#ecebe6" },
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
