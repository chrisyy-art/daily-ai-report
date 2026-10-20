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
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border-[2.5px] px-3.5 py-3 transition ${
        active
          ? "border-ink bg-sky-soft shadow-[3px_3px_0_0_rgb(var(--ink))]"
          : "border-transparent bg-soft hover:bg-sky-soft/70"
      }`}
    >
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3.5" aria-current={active ? "page" : undefined}>
        <div className="flex w-8 shrink-0 flex-col items-center">
          <span className="text-base font-black leading-5 text-primary">{String(index).padStart(2, "0")}</span>
          <span className="text-[10px] font-semibold leading-3 text-muted">{month}</span>
          <span className="text-[10px] font-semibold leading-3 text-muted">{day}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-extrabold leading-[22px] text-ink">{report.title}</p>
          {showStatus && (
            <span className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-muted">
              <span
                className={`chip !py-0 ${report.published ? "bg-sky-soft text-ink" : "bg-surface text-muted !border-ink/30"}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${report.published ? "bg-success" : "bg-muted/60"}`} />
                {report.published ? "已发布" : "草稿"}
              </span>
              {report.date}
            </span>
          )}
        </div>
      </Link>

      {actions && <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">{actions}</div>}
    </div>
  );
}
