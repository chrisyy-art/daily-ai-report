"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ReportList from "@/components/shared/ReportList";
import type { ReportListEntry } from "@/lib/reports";

/** 移动端：顶栏右侧「往期」按钮，点开为下拉目录 */
export default function MobileReportPicker({
  reports,
  activeId,
}: {
  reports: ReportListEntry[];
  activeId?: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // 切换页面后自动收起
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-fg transition hover:bg-soft"
      >
        往期
        <svg viewBox="0 0 16 16" className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} aria-hidden>
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full max-h-[70vh] overflow-y-auto border-b border-line bg-surface px-2 py-3 shadow-[0_12px_24px_-12px_rgb(32_33_36/0.25)]">
          <ReportList reports={reports} activeId={activeId} variant="plain" hrefFor={(r) => `/report/${r.date}`} />
        </div>
      )}
    </div>
  );
}
