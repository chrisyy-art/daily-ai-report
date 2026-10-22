import Link from "next/link";
import { formatChineseDate, splitMonthDay } from "@/lib/date";
import type { ReportListEntry } from "@/lib/reports";

type Props = {
  report: ReportListEntry;
  /** 显示编号，如 1 → "01" */
  index: number;
  href: string;
  active?: boolean;
  /** 后台用：显示草稿/已发布标记 */
  showStatus?: boolean;
  /** 后台用：右侧操作按钮 */
  actions?: React.ReactNode;
  /** 后台用：状态行后追加的信息（如阅读数据） */
  meta?: React.ReactNode;
  /** card：后台的圆角卡片行；plain：前台目录样式，仅当前项带主色竖线 */
  variant?: "card" | "plain";
};

export default function ReportListItem({ report, index, href, active, showStatus, actions, meta, variant = "card" }: Props) {
  const { month, day } = splitMonthDay(report.date);

  if (variant === "plain") {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`group flex gap-3 border-l-2 py-2.5 pl-4 pr-2 transition ${
          active ? "border-primary" : "border-transparent hover:border-line"
        }`}
      >
        <span className={`w-5 shrink-0 pt-px text-xs font-semibold tabular-nums ${active ? "text-primary" : "text-muted/70"}`}>
          {String(index).padStart(2, "0")}
        </span>
        <span className="min-w-0">
          <span
            className={`line-clamp-2 text-sm leading-snug ${
              active ? "font-semibold text-ink" : "text-fg group-hover:text-ink"
            }`}
          >
            {report.title}
          </span>
          <span className="mt-1 block text-xs text-muted">{formatChineseDate(report.date)}</span>
        </span>
      </Link>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl px-3.5 py-3 transition ${
        active
          ? "bg-gradient-to-br from-sky-soft to-[#F5F9FF] ring-1 ring-primary/15"
          : "bg-soft/80 hover:bg-sky-soft/60"
      }`}
    >
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3.5" aria-current={active ? "page" : undefined}>
        <div className="flex w-8 shrink-0 flex-col items-center tabular-nums">
          <span className={`text-base font-bold leading-5 ${active ? "text-primary" : "text-primary/70"}`}>
            {String(index).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-medium leading-3 text-muted">{month}</span>
          <span className="text-[10px] font-medium leading-3 text-muted">{day}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className={`line-clamp-2 text-sm font-semibold leading-[22px] ${active ? "text-ink" : "text-ink/80"}`}>
            {report.title}
          </p>
          {showStatus && (
            <span className="mt-1.5 flex items-center gap-2 text-xs font-medium text-muted">
              <span className={`chip ${report.published ? "bg-success/10 text-success" : "bg-line/70 text-muted"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${report.published ? "bg-success" : "bg-muted/60"}`} />
                {report.published ? "已发布" : "草稿"}
              </span>
              {report.date}
              {meta}
            </span>
          )}
        </div>
      </Link>

      {actions && <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">{actions}</div>}
    </div>
  );
}
