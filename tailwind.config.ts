import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-card": "var(--bg-card)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        mist: "var(--mist)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        nova: "var(--nova-violet)",
        "nova-soft": "var(--nova-violet-soft)",
        flare: "var(--flare)",
        "flare-soft": "var(--flare-soft)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        nova: "var(--shadow)",
      },
    },
  },
  plugins: [],
};
export default config;
