import Link from "next/link";
import Logo from "@/components/ui/Logo";
import ReportList from "@/components/shared/ReportList";
import type { ReportListEntry } from "@/lib/reports";

/** 桌面端固定侧栏 */
export default function Sidebar({ reports, activeId }: { reports: ReportListEntry[]; activeId?: number }) {
  return (
    <aside className="glass sticky top-6 hidden h-[calc(100vh-3rem)] w-[340px] shrink-0 flex-col overflow-hidden lg:flex">
      <div className="px-6 pb-5 pt-6">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="mx-6 border-t border-dashed border-line/20" />
      <nav className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin]" aria-label="日报列表">
        <ReportList reports={reports} activeId={activeId} hrefFor={(r) => `/report/${r.date}`} />
      </nav>
    </aside>
  );
}
