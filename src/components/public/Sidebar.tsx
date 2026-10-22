import ReportList from "@/components/shared/ReportList";
import type { ReportListEntry } from "@/lib/reports";

/** 桌面端左侧「往期日报」目录 */
export default function Sidebar({ reports, activeId }: { reports: ReportListEntry[]; activeId?: number }) {
  return (
    <aside className="panel sticky top-24 hidden max-h-[calc(100vh-7rem)] w-[272px] shrink-0 flex-col self-start p-3 lg:flex">
      <h2 className="px-3 pb-2 pt-2 text-xs font-semibold tracking-[0.12em] text-muted">往期日报</h2>
      <nav className="overflow-y-auto [scrollbar-width:thin]" aria-label="往期日报">
        <ReportList reports={reports} activeId={activeId} variant="plain" hrefFor={(r) => `/report/${r.date}`} />
      </nav>
    </aside>
  );
}
