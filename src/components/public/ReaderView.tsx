import Link from "next/link";
import ReportBody from "@/components/shared/ReportBody";
import Logo from "@/components/ui/Logo";
import type { Report, ReportListEntry } from "@/lib/reports";
import { SITE_NAME } from "@/lib/site";
import MobileReportPicker from "./MobileReportPicker";
import Sidebar from "./Sidebar";
import ViewTracker from "./ViewTracker";

/** 顶栏：Logo + 站点名；移动端右侧是「往期」目录 */
function TopBar({ reports, activeId }: { reports: ReportListEntry[]; activeId?: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="relative mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/" className="min-w-0">
          <Logo />
        </Link>
        <MobileReportPicker reports={reports} activeId={activeId} />
      </div>
    </header>
  );
}

/** 页脚：配置了 ICP_NUMBER（中国内地服务器备案号）时按规定展示并链接到工信部备案系统 */
function SiteFooter() {
  const icp = process.env.ICP_NUMBER;
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted lg:px-8">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
        {icp && (
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-ink">
            {icp}
          </a>
        )}
      </div>
    </footer>
  );
}

/** 对客阅读端整体布局：顶栏 + 左侧往期目录 + 右侧正文 */
export default function ReaderView({ reports, report }: { reports: ReportListEntry[]; report: Report | null }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar reports={reports} activeId={report?.id} />

      <div className="mx-auto flex w-full max-w-[1200px] flex-1 gap-14 px-4 pt-8 md:pt-12 lg:px-8">
        <Sidebar reports={reports} activeId={report?.id} />

        <main className="min-w-0 max-w-[800px] flex-1">
          {report ? (
            <>
              <ViewTracker reportId={report.id} />
              <ReportBody key={report.id} title={report.title} date={report.date} content={report.content} />
            </>
          ) : (
            <p className="py-24 text-center text-muted">还没有发布任何日报，敬请期待。</p>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
