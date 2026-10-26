import Link from "next/link";
import ReportActions from "@/components/admin/ReportActions";
import ReportList from "@/components/shared/ReportList";
import { listAllReports } from "@/lib/reports";
import { siteOverview, statsByReport } from "@/lib/stats";

const TABS = [
  { key: "all", label: "全部" },
  { key: "published", label: "已发布" },
  { key: "draft", label: "草稿" },
] as const;

type Status = (typeof TABS)[number]["key"];

const EMPTY_TEXT: Record<Status, string> = {
  all: "还没有日报，点击右上角新建一篇吧",
  published: "还没有已发布的日报",
  draft: "没有草稿。编辑日报时点「存草稿」，就会出现在这里",
};

export default async function AdminHomePage({ searchParams }: { searchParams: { status?: string } }) {
  const status: Status = searchParams.status === "published" || searchParams.status === "draft" ? searchParams.status : "all";

  const [all, stats, overview] = await Promise.all([listAllReports(), statsByReport(), siteOverview()]);
  const counts: Record<Status, number> = {
    all: all.length,
    published: all.filter((r) => r.published).length,
    draft: all.filter((r) => !r.published).length,
  };
  const reports = status === "all" ? all : all.filter((r) => r.published === (status === "published"));

  return (
    <div className="mx-auto max-w-4xl py-2">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">日报管理</h1>
          <p className="mt-1.5 text-sm font-semibold text-muted">草稿只在后台可见，发布后前台读者才能看到。阅读数据不含管理员自己的浏览</p>
        </div>
        <Link href="/admin/new" className="btn-primary">
          + 新建日报
        </Link>
      </div>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="阅读数据概览">
        <StatCard label="今日阅读" value={overview.today.views} />
        <StatCard label="今日新访客" value={overview.today.visitors} />
        <StatCard label="累计阅读" value={overview.total.views} />
        <StatCard label="累计访客" value={overview.total.visitors} />
      </section>

      <nav className="mb-4 flex gap-2" aria-label="按状态筛选">
        {TABS.map((tab) => {
          const active = tab.key === status;
          return (
            <Link
              key={tab.key}
              href={tab.key === "all" ? "/admin" : `/admin?status=${tab.key}`}
              aria-current={active ? "page" : undefined}
              className={`chip !px-3.5 !py-1 !text-sm transition ${
                active ? "bg-primary !text-white shadow-primary-glow" : "border border-line bg-surface text-ink hover:bg-sky-soft/60"
              }`}
            >
              {tab.label}
              <span className={active ? "text-white/70" : "text-muted"}>{counts[tab.key]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="card p-4 md:p-5">
        <ReportList
          reports={reports}
          showStatus
          hrefFor={(r) => `/admin/edit/${r.id}`}
          emptyText={EMPTY_TEXT[status]}
          renderMeta={(r) => {
            if (!r.published) return null;
            const s = stats.get(r.id) ?? { readers: 0 };
            return (
              <span className="flex items-center gap-1" title="累计阅读人数（同一访客重复打开只计一次，管理员浏览不计入）">
                <EyeIcon />
                <span className="font-semibold text-ink/80">{s.readers}</span> 人阅读
              </span>
            );
          }}
          renderActions={(r) => (
            <ReportActions id={r.id} date={r.date} title={r.title} published={r.published} />
          )}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line/80 bg-gradient-to-br from-sky-soft/70 to-surface px-4 py-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-ink">{value.toLocaleString("zh-CN")}</p>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
