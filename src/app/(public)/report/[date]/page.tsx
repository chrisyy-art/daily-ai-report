import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReaderView from "@/components/public/ReaderView";
import { isValidDateString } from "@/lib/date";
import { getPublishedReportByDate, listPublishedReports } from "@/lib/reports";
import { resolveTheme } from "@/lib/theme";
import { formatChineseDate } from "@/lib/date";
import { parseReport } from "@/lib/markdown/sections";
import { SHARE_IMAGE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: { date: string }; searchParams: { theme?: string } };

/** 把导语 Markdown 变成一段纯文字摘要，用于分享卡片 */
function excerpt(markdown: string, max = 80): string {
  const text = markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[>*_`#]/g, "")
    .replace(/^\s*本期主线\s*[:：]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isValidDateString(params.date)) return {};
  const report = await getPublishedReportByDate(params.date);
  if (!report) return {};

  const title = `${report.title}（${formatChineseDate(report.date)}）`;
  const description = report.summary?.trim() || excerpt(parseReport(report.content).intro) || SITE_DESCRIPTION;
  return {
    title: `${title} · ${SITE_NAME}`,
    description,
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE.url] },
  };
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
