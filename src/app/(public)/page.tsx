import ReaderView from "@/components/public/ReaderView";
import { getLatestPublishedReport, listPublishedReports } from "@/lib/reports";
import { resolveTheme } from "@/lib/theme";

export const dynamic = "force-dynamic";

/** 首页：默认展示最新一篇 */
export default async function HomePage({ searchParams }: { searchParams: { theme?: string } }) {
  const [reports, latest] = await Promise.all([listPublishedReports(), getLatestPublishedReport()]);
  return <ReaderView reports={reports} report={latest} theme={resolveTheme(searchParams.theme)} />;
}
