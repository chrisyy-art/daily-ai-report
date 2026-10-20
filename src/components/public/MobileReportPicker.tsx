"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import ReportListItem from "@/components/shared/ReportListItem";
import { splitMonthDay } from "@/lib/date";
import type { ReportListEntry } from "@/lib/reports";

/** 移动端：顶部栏 + 点击展开的日报下拉列表 */
export default function MobileReportPicker({
  reports,
  activeId,
}: {
  reports: ReportListEntry[];
  activeId?: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const activeIndex = reports.findIndex((r) => r.id === activeId);
  const active = reports[activeIndex];

  // 切换页面后自动收起
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="sticky top-0 z-30 -mx-4 mb-5 bg-bg/90 px-4 pb-1 pt-3 backdrop-blur lg:hidden">
      <div className="overflow-hidden rounded-[22px] border-[3px] border-ink bg-surface shadow-brutal-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/">
            <Logo />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-sky-soft px-3 py-1 text-sm font-extrabold text-ink"
          >
            {active ? (
              <span>
                <span className="text-primary">{String(activeIndex + 1).padStart(2, "0")}</span> ·{" "}
                {splitMonthDay(active.date).month}/{splitMonthDay(active.date).day}
              </span>
            ) : (
              <span>往期</span>
            )}
            <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} aria-hidden>
              <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {open && (
          <ul className="max-h-[60vh] space-y-3 overflow-y-auto border-t-2 border-dashed border-ink/15 p-3 pr-4">
            {reports.map((r, i) => (
              <li key={r.id}>
                <ReportListItem report={r} index={i + 1} href={`/report/${r.date}`} active={r.id === activeId} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
