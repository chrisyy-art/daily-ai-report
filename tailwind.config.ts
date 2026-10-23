import type { Config } from "tailwindcss";

// 颜色全部引用 globals.css 里的 CSS 变量，换主题只改变量
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        soft: "rgb(var(--soft) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        sky: "rgb(var(--sky) / <alpha-value>)",
        "sky-soft": "rgb(var(--sky-soft) / <alpha-value>)",
        link: "rgb(var(--link) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "PingFang SC", "monospace"],
      },
      boxShadow: {
        // 柔和投影：卡片、浮层、主按钮
        soft: "0 1px 2px rgb(15 23 42 / 0.04), 0 12px 32px -16px rgb(15 23 42 / 0.14)",
        "soft-sm": "0 1px 2px rgb(15 23 42 / 0.05), 0 4px 12px -6px rgb(15 23 42 / 0.10)",
        "primary-glow": "0 8px 20px -8px rgb(var(--primary) / 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
