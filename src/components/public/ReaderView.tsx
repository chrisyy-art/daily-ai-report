import Markdown from "@/components/shared/Markdown";
import ReportHeader, { DailyBadge } from "@/components/shared/ReportHeader";
import type { Report, ReportListEntry } from "@/lib/reports";
import BackHomeButton from "./BackHomeButton";
import MobileReportPicker from "./MobileReportPicker";
import Sidebar from "./Sidebar";

/** 对客阅读端整体布局：左侧日报列表 + 右侧正文 */
export default function ReaderView({ reports, report }: { reports: ReportListEntry[]; report: Report | null }) {
  return (
    <div className="mx-auto flex max-w-[1440px] gap-8 px-4 pb-12 lg:px-8 lg:pt-8">
      <Sidebar reports={reports} activeId={report?.id} />

      <main className="min-w-0 flex-1">
        <MobileReportPicker reports={reports} activeId={report?.id} />

        <article className="card overflow-hidden">
          {report ? (
            <>
              <div className="border-b-[3px] border-ink px-5 pb-8 pt-5 md:px-12 md:pb-10 md:pt-8">
                {/* 顶部一行：左侧返回按钮，DAILY AI 居中 */}
                <div className="relative flex flex-col items-center gap-5 md:flex-row md:justify-center">
                  <div className="self-start md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2">
                    <BackHomeButton />
                  </div>
                  <DailyBadge />
                </div>
                <div className="mx-auto mt-6 max-w-4xl md:mt-8">
                  <ReportHeader title={report.title} date={report.date} />
                </div>
              </div>
              <div className="mx-auto max-w-[860px] px-5 py-8 md:px-12 md:py-12">
                <Markdown content={report.content} />
              </div>
            </>
          ) : (
            <div className="px-6 py-24 text-center font-bold text-muted">还没有发布任何日报，敬请期待。</div>
          )}
        </article>
      </main>
    </div>
  );
}
