import Link from "next/link";
import ReportActions from "@/components/admin/ReportActions";
import ReportList from "@/components/shared/ReportList";
import { listAllReports } from "@/lib/reports";

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

  const all = await listAllReports();
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
          <p className="mt-1.5 text-sm font-semibold text-muted">草稿只在后台可见，发布后前台读者才能看到</p>
        </div>
        <Link href="/admin/new" className="btn-primary">
          + 新建日报
        </Link>
      </div>

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
          renderActions={(r) => (
            <ReportActions id={r.id} date={r.date} title={r.title} published={r.published} />
          )}
        />
      </div>
    </div>
  );
}
