/**
 * 前台主题，读者的选择存在 cookie 里：
 * - p：P-Max 风格，顶部带动态方格横幅（默认）
 * - light：白底卡片
 * - dark：深色（参考钉钉开发者平台）
 */
export const THEME_COOKIE = "reader_theme";

export const THEMES = [
  { id: "p", title: "P 风格" },
  { id: "light", title: "浅色" },
  { id: "dark", title: "深色" },
] as const;

export type ReaderTheme = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ReaderTheme = "p";

export function parseTheme(value: string | undefined): ReaderTheme {
  return THEMES.some((t) => t.id === value) ? (value as ReaderTheme) : DEFAULT_THEME;
}
