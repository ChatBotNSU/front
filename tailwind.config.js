/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Design tokens — surfaces and accents for the builder UI.
        canvas: "#0f1117",
        panel: "#171a21",
        "panel-2": "#1f232c",
        border: "#2a2f3a",
        accent: "#6366f1",
        "accent-soft": "#4f46e5",
        muted: "#8b93a7",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
