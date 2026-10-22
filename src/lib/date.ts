const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** 校验 YYYY-MM-DD 且是真实存在的日期 */
export function isValidDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/**
 * 日报所在时区的今天，YYYY-MM-DD。
 * 服务器（如 Vercel）通常跑在 UTC，这里固定按日报时区计算，默认北京时间。
 */
export function todayString(timeZone = process.env.REPORT_TIMEZONE || "Asia/Shanghai"): string {
  // en-CA 的日期格式恰好是 YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}

/** "2026-10-19" → { month: "10", day: "19" }，用于侧栏两行小字 */
export function splitMonthDay(date: string) {
  const [, month = "", day = ""] = date.split("-");
  return { month, day };
}

/** "2026-10-09" → "10 月 9 日" */
export function formatChineseDate(date: string): string {
  const [, m, d] = date.split("-");
  return `${Number(m)} 月 ${Number(d)} 日`;
}

const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

/** "2026-10-22" → "2026年10月22日 · 星期四" */
export function formatLongDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${y}年${m}月${d}日 · ${weekday}`;
}
