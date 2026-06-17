/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  // Preflight OFF: the existing JSX twins use inline styles + theme.js; Tailwind is
  // utility-only for the new TSX twin and must not globally reset the working tabs.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        bg: "#0a0e16", canvas: "#0c1320", panel: "#111a28", panel2: "#0d1320", box: "#0e1726",
        line: "#283751", soft: "rgba(120,140,175,0.13)",
        blue: "#4ea3e0", teal: "#23b6a4", amber: "#f5a623", red: "#ff5a5f", green: "#37d399",
        yellow: "#f5d23a", ink: "#f3f8fe", lab: "#aebcd0", unit: "#7f8da3", dim: "#6a7588",
        geo: "#b48ef0", txt2: "#9aa7bb",
      },
      fontFamily: {
        mono: ['ui-monospace', '"SF Mono"', "Menlo", "Consolas", "monospace"],
        sans: ['ui-sans-serif', "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
