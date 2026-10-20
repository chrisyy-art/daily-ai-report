import Markdown from "@/components/shared/Markdown";
import ReportHeader from "@/components/shared/ReportHeader";
import type { Report, ReportListEntry } from "@/lib/reports";
import BackHomeButton from "./BackHomeButton";
import MobileReportPicker from "./MobileReportPicker";
import Sidebar from "./Sidebar";

/** 对客阅读端整体布局：左侧日报列表 + 右侧正文 */
export default function ReaderView({ reports, report }: { reports: ReportListEntry[]; report: Report | null }) {
  return (
    <div className="mx-auto flex max-w-[1400px] gap-6 px-4 pb-10 lg:px-6 lg:pt-6">
      <Sidebar reports={reports} activeId={report?.id} />

      <main className="min-w-0 flex-1">
        <MobileReportPicker reports={reports} activeId={report?.id} />

        <article className="glass overflow-hidden">
          {report ? (
            <>
              <div className="border-b border-line/15 px-5 pb-8 pt-5 md:px-10 md:pb-10 md:pt-6">
                <BackHomeButton />
                <div className="mx-auto mt-6 max-w-3xl md:mt-2">
                  <ReportHeader title={report.title} date={report.date} />
                </div>
              </div>
              <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
                <Markdown content={report.content} />
              </div>
            </>
          ) : (
            <div className="px-6 py-24 text-center text-muted">还没有发布任何日报，敬请期待。</div>
          )}
        </article>
      </main>
    </div>
  );
}
