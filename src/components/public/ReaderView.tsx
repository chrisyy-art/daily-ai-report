import Link from "next/link";
import ReportBody from "@/components/shared/ReportBody";
import Logo from "@/components/ui/Logo";
import type { Report, ReportListEntry } from "@/lib/reports";
import { SITE_NAME } from "@/lib/site";
import type { ReaderTheme } from "@/lib/theme";
import MobileReportPicker from "./MobileReportPicker";
import Sidebar from "./Sidebar";
import BannerGrid from "./BannerGrid";
import ViewTracker from "./ViewTracker";

/** 顶栏（浅色、深色版式）：Logo + 站点名；移动端右侧是「往期」目录。P 版式不显示顶栏 */
function TopBar({ reports, activeId }: { reports: ReportListEntry[]; activeId?: number }) {
  return (
    <header className="reader-topbar sticky top-0 z-40 border-b border-line bg-surface">
      <div className="relative mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/" className="min-w-0">
          <Logo />
        </Link>
        <MobileReportPicker reports={reports} activeId={activeId} />
      </div>
    </header>
  );
}

/** P 风格的顶部横幅：动态方格背景 + 栏目标题（其他风格隐藏） */
function Banner() {
  return (
    <section className="reader-banner relative overflow-hidden border-b border-line">
      <BannerGrid />
      <div aria-hidden className="banner-deco pointer-events-none absolute right-0 top-0 z-[2]" />
      <div className="relative z-[3] mx-auto max-w-[1112px] px-6">
        <div className="banner-inner text-center">
          <span className="banner-pill">数科行研中心 · Daily AI</span>
          <h2 className="banner-title">
            每天几分钟，跟上 <em>AI 行业</em>的重要动态
          </h2>
          <p className="banner-lede">追踪全球 AI 前沿动态，洞察产业趋势与商业机会</p>
        </div>
      </div>
    </section>
  );
}

/** 页脚：配置了 ICP_NUMBER（中国内地服务器备案号）时按规定展示并链接到工信部备案系统 */
function SiteFooter() {
  const icp = process.env.ICP_NUMBER;
  return (
    <footer className="reader-footer relative mt-auto border-t border-line pt-0">
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

/** 对客阅读端整体布局：顶栏（P 风格为横幅）+ 左侧往期目录 + 右侧正文 */
type Props = { reports: ReportListEntry[]; report: Report | null; theme: ReaderTheme };

export default function ReaderView({ reports, report, theme }: Props) {
  return (
    <div data-reader data-theme={theme} className="reader relative flex min-h-screen flex-col">
      {/* 深色主题下的背景光效（浅色主题隐藏） */}
      <div aria-hidden className="reader-glow pointer-events-none absolute inset-x-0 top-0 h-[640px] overflow-hidden" />
      <TopBar reports={reports} activeId={report?.id} />
      <Banner />

      <div className="reader-main relative mb-12 mx-auto flex w-full max-w-[1200px] gap-6 px-3 pt-4 md:px-4 md:pt-6 lg:gap-6 lg:px-8">
        <Sidebar reports={reports} activeId={report?.id} />

        <main className="min-w-0 flex-1">
          {report ? (
            <>
              <ViewTracker reportId={report.id} />
              <ReportBody key={report.id} title={report.title} date={report.date} content={report.content} />
            </>
          ) : (
            <p className="panel py-24 text-center text-muted">还没有发布任何日报，敬请期待。</p>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
