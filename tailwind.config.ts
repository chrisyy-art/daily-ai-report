import type { Config } from "tailwindcss";

// 颜色全部引用 globals.css 里的 CSS 变量，换主题只改变量
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        cyan: "rgb(var(--cyan) / <alpha-value>)",
        violet: "rgb(var(--violet) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "PingFang SC",
          "Microsoft YaHei",
          "Hiragino Sans GB",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(var(--cyan) / 0.5), 0 0 24px rgb(var(--cyan) / 0.25)",
        "glow-violet": "0 0 24px rgb(var(--violet) / 0.35)",
      },
      backgroundImage: {
        brand: "linear-gradient(90deg, rgb(var(--cyan)), rgb(var(--violet)))",
      },
    },
  },
  plugins: [],
};

export default config;
