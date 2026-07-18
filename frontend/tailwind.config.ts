import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#0E091C",     // Primary deep purple-black — page background
        onbg: "#DDD7FE",     // text sitting directly on the dark page bg
        paper: "#170F2B",    // card surface — one step lighter than the
                               // page, NOT white anymore (dark cards to
                               // match the deep-purple theme)
        ink: "#F4F1FA",       // text INSIDE cards — now light, since cards
                               // are dark
        accent: "#6E54FF",    // Primary purple — buttons, links, logo mark

        // Secondary colors, brightened to full/near-full saturation so
        // they read clearly against the dark card surface.
        ledger: "#85E6FF",    // "settled" — Secondary Sky
        aged: "#FFAE45",      // "awaiting payment" — Secondary Orange
        pink: "#FF8EE4",      // decorative accent — Secondary Pink
        sky: "#85E6FF",

        line: "#332B4D",      // divider/border color against the dark card
        stampRed: "#FF6B6B",  // functional error/red, brightened for dark bg
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
