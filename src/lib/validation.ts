import { isValidDateString } from "./date";
import type { ReportInput } from "./reports";

export type FieldErrors = Partial<Record<keyof ReportInput, string>>;

export type ValidationResult =
  | { ok: true; data: ReportInput }
  | { ok: false; errors: FieldErrors };

/** 校验新建 / 完整更新的表单数据 */
export function validateReportInput(body: unknown): ValidationResult {
  const raw = (body ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const date = typeof raw.date === "string" ? raw.date.trim() : "";
  const summary = typeof raw.summary === "string" ? raw.summary.trim() : "";
  const content = typeof raw.content === "string" ? raw.content : "";
  const published = raw.published === true;

  if (!title) errors.title = "请填写标题";
  else if (title.length > 200) errors.title = "标题不能超过 200 字";

  if (!date) errors.date = "请选择日期";
  else if (!isValidDateString(date)) errors.date = "日期无效，格式应为 YYYY-MM-DD";

  if (summary.length > 500) errors.summary = "摘要不能超过 500 字";

  if (!content.trim()) errors.content = "请填写正文";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: { title, date, summary: summary || null, content, published },
  };
}
