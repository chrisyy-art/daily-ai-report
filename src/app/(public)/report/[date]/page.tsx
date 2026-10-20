import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReaderView from "@/components/public/ReaderView";
import { isValidDateString } from "@/lib/date";
import { getPublishedReportByDate, listPublishedReports } from "@/lib/reports";

export const dynamic = "force-dynamic";

type Props = { params: { date: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isValidDateString(params.date)) return {};
  const report = await getPublishedReportByDate(params.date);
  return report ? { title: `${report.title} · 每日 AI`, description: report.summary ?? undefined } : {};
}

export default async function ReportPage({ params }: Props) {
  if (!isValidDateString(params.date)) notFound();

  const [reports, report] = await Promise.all([
    listPublishedReports(),
    getPublishedReportByDate(params.date),
  ]);
  if (!report) notFound();

  return <ReaderView reports={reports} report={report} />;
}
