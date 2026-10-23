/**
 * 前台主题（版式）。前台不提供切换按钮，所有读者看到同一套：
 * - p：P-Max 风格（默认）
 * - light：白底卡片
 * - dark：深色（参考钉钉开发者平台）
 *
 * 更换全站版式：在 .env 中设置 READER_THEME=light / dark / p 后重启。
 * 临时预览其他版式：在网址后加 ?theme=light 或 ?theme=dark（只影响当前页面）。
 */
export const THEMES = [
  { id: "p", title: "P 风格" },
  { id: "light", title: "浅色" },
  { id: "dark", title: "深色" },
] as const;

export type ReaderTheme = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ReaderTheme = "p";

const isTheme = (value: unknown): value is ReaderTheme => THEMES.some((t) => t.id === value);

/** 依次取：网址里的 ?theme= → 环境变量 READER_THEME → 默认 P */
export function resolveTheme(preview?: string | string[]): ReaderTheme {
  if (isTheme(preview)) return preview;
  const configured = process.env.READER_THEME;
  return isTheme(configured) ? configured : DEFAULT_THEME;
}
