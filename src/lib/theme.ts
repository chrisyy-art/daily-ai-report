/** 前台主题：浅色（白底卡片）/ 深色（参考钉钉开发者平台）。读者的选择存在 cookie 里 */
export const THEME_COOKIE = "reader_theme";
export const DEFAULT_THEME: ReaderTheme = "dark";

export type ReaderTheme = "light" | "dark";

export function parseTheme(value: string | undefined): ReaderTheme {
  return value === "light" || value === "dark" ? value : DEFAULT_THEME;
}
