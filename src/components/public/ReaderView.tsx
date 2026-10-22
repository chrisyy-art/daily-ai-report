import ReportBody from "@/components/shared/ReportBody";
import ReportHeader from "@/components/shared/ReportHeader";
import type { Report, ReportListEntry } from "@/lib/reports";
import { SITE_NAME } from "@/lib/site";
import MobileReportPicker from "./MobileReportPicker";
import Sidebar from "./Sidebar";
import ViewTracker from "./ViewTracker";

/** 页脚：配置了 ICP_NUMBER（中国内地服务器备案号）时按规定展示并链接到工信部备案系统 */
function SiteFooter() {
  const icp = process.env.ICP_NUMBER;
  return (
    <footer className="mt-8 text-center text-xs font-semibold text-muted">
      <p>
        © {new Date().getFullYear()} {SITE_NAME}
        {icp && (
          <>
            <span className="mx-2">·</span>
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              {icp}
            </a>
          </>
        )}
      </p>
    </footer>
  );
}

/** 对客阅读端整体布局：左侧日报列表 + 右侧正文 */
export default function ReaderView({ reports, report }: { reports: ReportListEntry[]; report: Report | null }) {
  return (
    <div className="mx-auto flex max-w-[1280px] gap-7 px-4 pb-12 lg:px-8 lg:pt-8">
      <Sidebar reports={reports} activeId={report?.id} />

      <main className="min-w-0 flex-1">
        <MobileReportPicker reports={reports} activeId={report?.id} />

        {report ? (
          <>
            <ViewTracker reportId={report.id} />
            <ReportBody
              key={report.id}
              content={report.content}
              header={
                <div className="tint relative border-b border-line/80 px-5 py-8 md:px-8 md:py-10">
                  <div aria-hidden className="tint-dots pointer-events-none absolute inset-0" />
                  <div className="relative mx-auto max-w-4xl">
                    <ReportHeader title={report.title} date={report.date} />
                  </div>
                </div>
              }
            />
          </>
        ) : (
          <div className="card px-6 py-24 text-center font-medium text-muted">还没有发布任何日报，敬请期待。</div>
        )}

        <SiteFooter />
      </main>
    </div>
  );
}
