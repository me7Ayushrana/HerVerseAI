/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        bgDark: "var(--color-bg-dark)",
        bgCard: "var(--color-bg-card)",
        textMain: "var(--color-text)",
        muted: "var(--color-muted)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
