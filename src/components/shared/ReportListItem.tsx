import Link from "next/link";
import { splitMonthDay } from "@/lib/date";
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
};

export default function ReportListItem({ report, index, href, active, showStatus, actions }: Props) {
  const { month, day } = splitMonthDay(report.date);

  return (
    <div
      className={`group relative flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border px-4 py-3 transition ${
        active
          ? "border-cyan/50 bg-cyan/[0.07] shadow-glow"
          : "border-transparent bg-surface/[0.03] hover:border-line/25 hover:bg-surface/[0.06]"
      }`}
    >
      {active && <span className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-brand" />}

      <Link href={href} className="flex min-w-0 flex-1 items-center gap-4" aria-current={active ? "page" : undefined}>
        <div className="flex w-8 shrink-0 flex-col items-center font-mono">
          <span className={`text-base font-bold ${active ? "text-gradient" : "text-cyan/80"}`}>
            {String(index).padStart(2, "0")}
          </span>
          <span className="mt-0.5 text-[10px] leading-3 text-muted">{month}</span>
          <span className="text-[10px] leading-3 text-muted">{day}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`line-clamp-2 text-sm font-semibold leading-6 ${
              active ? "text-fg" : "text-fg/80 group-hover:text-fg"
            }`}
          >
            {report.title}
          </p>
          {showStatus && (
            <span
              className={`mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] ${
                report.published ? "text-success" : "text-muted"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${report.published ? "bg-success" : "bg-muted"}`} />
              {report.published ? "已发布" : "草稿"}
              <span className="text-muted/70">· {report.date}</span>
            </span>
          )}
        </div>
      </Link>

      {actions && <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">{actions}</div>}
    </div>
  );
}
