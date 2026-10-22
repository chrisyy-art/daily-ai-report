import ReportList from "@/components/shared/ReportList";
import type { ReportListEntry } from "@/lib/reports";

/** 桌面端左侧「往期日报」目录 */
export default function Sidebar({ reports, activeId }: { reports: ReportListEntry[]; activeId?: number }) {
  return (
    <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-[248px] shrink-0 flex-col self-start lg:flex">
      <h2 className="mb-3 pl-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">往期日报</h2>
      <nav className="-mr-2 overflow-y-auto pr-2 [scrollbar-width:thin]" aria-label="往期日报">
        <ReportList reports={reports} activeId={activeId} variant="plain" hrefFor={(r) => `/report/${r.date}`} />
      </nav>
    </aside>
  );
}
