import ReportListItem from "./ReportListItem";
import type { ReportListEntry } from "@/lib/reports";

type Props = {
  reports: ReportListEntry[];
  hrefFor: (report: ReportListEntry) => string;
  activeId?: number;
  showStatus?: boolean;
  renderActions?: (report: ReportListEntry) => React.ReactNode;
  emptyText?: string;
};

/** 日报列表。传入的 reports 需按日期倒序，最新一篇编号为 01 */
export default function ReportList({
  reports,
  hrefFor,
  activeId,
  showStatus,
  renderActions,
  emptyText = "暂无日报",
}: Props) {
  if (reports.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-muted">{emptyText}</p>;
  }

  return (
    <ul className="space-y-3">
      {reports.map((r, i) => (
        <li key={r.id}>
          <ReportListItem
            report={r}
            index={i + 1}
            href={hrefFor(r)}
            active={r.id === activeId}
            showStatus={showStatus}
            actions={renderActions?.(r)}
          />
        </li>
      ))}
    </ul>
  );
}
