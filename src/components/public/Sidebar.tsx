import Link from "next/link";
import Logo from "@/components/ui/Logo";
import ReportList from "@/components/shared/ReportList";
import type { ReportListEntry } from "@/lib/reports";

/** 桌面端固定侧栏 */
export default function Sidebar({ reports, activeId }: { reports: ReportListEntry[]; activeId?: number }) {
  return (
    <aside className="card sticky top-8 hidden h-[calc(100vh-4rem)] w-[340px] shrink-0 flex-col overflow-hidden lg:flex">
      <div className="px-7 pb-5 pt-7">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="mx-7 border-t-2 border-dashed border-ink/15" />
      <nav className="flex-1 overflow-y-auto px-5 pb-6 pr-6 pt-5 [scrollbar-width:thin]" aria-label="日报列表">
        <ReportList reports={reports} activeId={activeId} hrefFor={(r) => `/report/${r.date}`} />
      </nav>
    </aside>
  );
}
