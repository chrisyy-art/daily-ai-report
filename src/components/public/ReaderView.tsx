import { cookies } from "next/headers";
import Link from "next/link";
import ReportBody from "@/components/shared/ReportBody";
import Logo from "@/components/ui/Logo";
import type { Report, ReportListEntry } from "@/lib/reports";
import { SITE_NAME } from "@/lib/site";
import { parseTheme, THEME_COOKIE, type ReaderTheme } from "@/lib/theme";
import MobileReportPicker from "./MobileReportPicker";
import Sidebar from "./Sidebar";
import BannerGrid from "./BannerGrid";
import ThemeSwitch from "./ThemeSwitch";
import ViewTracker from "./ViewTracker";

/** 顶栏：Logo + 站点名，右侧风格切换；移动端右侧还有「往期」目录。P 风格在电脑上隐藏（由横幅代替） */
function TopBar({ reports, activeId, theme }: { reports: ReportListEntry[]; activeId?: number; theme: ReaderTheme }) {
  return (
    <header className="reader-topbar sticky top-0 z-40 border-b border-line bg-surface">
      <div className="relative mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/" className="min-w-0">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <ThemeSwitch initial={theme} />
          <MobileReportPicker reports={reports} activeId={activeId} />
        </div>
      </div>
    </header>
  );
}

/** P 风格的顶部横幅：动态方格背景 + 栏目标题（其他风格隐藏） */
function Banner({ theme }: { theme: ReaderTheme }) {
  return (
    <section className="reader-banner relative overflow-hidden border-b border-line">
      <BannerGrid />
      <div className="relative mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="absolute right-4 top-4 hidden lg:right-8 lg:block">
          <ThemeSwitch initial={theme} />
        </div>
        <div className="flex flex-col items-center py-12 text-center md:py-16">
          <p className="rounded-full border border-line bg-surface/70 px-3.5 py-1 font-mono text-[11px] tracking-[0.3em] text-muted">
            DAILY AI BRIEFING
          </p>
          <p className="mt-4 text-[30px] font-bold leading-tight tracking-tight text-ink md:text-[40px]">
            数科每日<span className="text-primary">AI</span>
          </p>
          <p className="mt-3 text-sm text-muted md:text-[15px]">追踪全球 AI 前沿动态，洞察产业趋势与商业机会</p>
        </div>
      </div>
    </section>
  );
}

/** 页脚：配置了 ICP_NUMBER（中国内地服务器备案号）时按规定展示并链接到工信部备案系统 */
function SiteFooter() {
  const icp = process.env.ICP_NUMBER;
  return (
    <footer className="relative mt-12 border-t border-line">
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
export default function ReaderView({ reports, report }: { reports: ReportListEntry[]; report: Report | null }) {
  const theme = parseTheme(cookies().get(THEME_COOKIE)?.value);

  return (
    <div data-reader data-theme={theme} className="reader relative flex min-h-screen flex-col">
      {/* 深色主题下的背景光效（浅色主题隐藏） */}
      <div aria-hidden className="reader-glow pointer-events-none absolute inset-x-0 top-0 h-[640px] overflow-hidden" />
      <TopBar reports={reports} activeId={report?.id} theme={theme} />
      <Banner theme={theme} />

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-1 gap-6 px-3 pt-4 md:px-4 md:pt-6 lg:gap-6 lg:px-8">
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
