import ReaderView from "@/components/public/ReaderView";
import { getLatestPublishedReport, listPublishedReports } from "@/lib/reports";

export const dynamic = "force-dynamic";

/** 首页：默认展示最新一篇 */
export default async function HomePage() {
  const [reports, latest] = await Promise.all([listPublishedReports(), getLatestPublishedReport()]);
  return <ReaderView reports={reports} report={latest} />;
}
