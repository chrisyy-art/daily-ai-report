import Link from "next/link";
import ReportActions from "@/components/admin/ReportActions";
import ReportList from "@/components/shared/ReportList";
import { listAllReports } from "@/lib/reports";

export default async function AdminHomePage() {
  const reports = await listAllReports();
  const publishedCount = reports.filter((r) => r.published).length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">日报管理</h1>
          <p className="mt-1 font-mono text-xs text-muted">
            共 {reports.length} 篇 · 已发布 {publishedCount} · 草稿 {reports.length - publishedCount}
          </p>
        </div>
        <Link href="/admin/new" className="btn-primary">
          + 新建日报
        </Link>
      </div>

      <div className="glass p-3 md:p-4">
        <ReportList
          reports={reports}
          showStatus
          hrefFor={(r) => `/admin/edit/${r.id}`}
          emptyText="还没有日报，点击右上角新建一篇吧"
          renderActions={(r) => (
            <ReportActions id={r.id} date={r.date} title={r.title} published={r.published} />
          )}
        />
      </div>
    </div>
  );
}
