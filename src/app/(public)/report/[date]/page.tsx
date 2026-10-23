import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReaderView from "@/components/public/ReaderView";
import { isValidDateString } from "@/lib/date";
import { getPublishedReportByDate, listPublishedReports } from "@/lib/reports";
import { resolveTheme } from "@/lib/theme";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: { date: string }; searchParams: { theme?: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isValidDateString(params.date)) return {};
  const report = await getPublishedReportByDate(params.date);
  return report ? { title: `${report.title} · ${SITE_NAME}`, description: report.summary ?? undefined } : {};
}

export default async function ReportPage({ params, searchParams }: Props) {
  if (!isValidDateString(params.date)) notFound();

  const [reports, report] = await Promise.all([
    listPublishedReports(),
    getPublishedReportByDate(params.date),
  ]);
  if (!report) notFound();

  return <ReaderView reports={reports} report={report} theme={resolveTheme(searchParams.theme)} />;
}
