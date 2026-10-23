import ReportList from "@/components/shared/ReportList";
import type { ReportListEntry } from "@/lib/reports";

/**
 * 桌面端左侧「往期日报」目录。
 * 白框随右侧正文拉伸到等高；里面的目录在框内吸顶，往下读时始终可见。
 */
export default function Sidebar({ reports, activeId }: { reports: ReportListEntry[]; activeId?: number }) {
  return (
    <aside className="panel hidden w-[256px] shrink-0 lg:block">
      <div className="sticky top-[calc(var(--sticky-top)+12px)] flex max-h-[calc(100vh-var(--sticky-top)-24px)] flex-col p-3">
        <h2 className="px-3 pb-2 pt-2 text-xs font-semibold tracking-[0.12em] text-muted">往期日报</h2>
        <nav className="overflow-y-auto [scrollbar-width:thin]" aria-label="往期日报">
          <ReportList reports={reports} activeId={activeId} variant="plain" hrefFor={(r) => `/report/${r.date}`} />
        </nav>
      </div>
    </aside>
  );
}
