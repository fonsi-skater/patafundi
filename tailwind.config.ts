import type { Config } from "tailwindcss";

// Design tokens — dark teal/near-black background with a glowing mint
// accent, inspired by the Voxbase-style reference. Class names (navy,
// gold, ink, offwhite) are kept as-is so every existing component picks
// up the new palette automatically without needing individual edits.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1512", // primary dark background — near-black teal
          light: "#12211D",   // card / secondary panels on dark
        },
        gold: {
          DEFAULT: "#2DD4A6", // primary accent — glowing mint/teal
          dark: "#1FAE85",
        },
        ink: "#081210",       // near-black for footer / deepest sections
        offwhite: "#F5F9F8",  // light-section background, cool-tinted white
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        card: "0.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
