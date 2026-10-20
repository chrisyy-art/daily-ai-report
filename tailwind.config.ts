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
        primary: "rgb(var(--primary) / <alpha-value>)",
        sky: "rgb(var(--sky) / <alpha-value>)",
        "sky-soft": "rgb(var(--sky-soft) / <alpha-value>)",
        link: "rgb(var(--link) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "PingFang SC", "monospace"],
      },
      boxShadow: {
        // neo-brutalism 偏移阴影
        brutal: "8px 8px 0 0 rgb(var(--ink))",
        "brutal-md": "5px 5px 0 0 rgb(var(--ink))",
        "brutal-sm": "3px 3px 0 0 rgb(var(--ink))",
      },
    },
  },
  plugins: [],
};

export default config;
