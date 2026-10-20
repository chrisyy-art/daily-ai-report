import { notFound } from "next/navigation";
import ReportEditor from "@/components/admin/ReportEditor";
import { getReportById } from "@/lib/reports";

type Props = { params: { id: string }; searchParams: { saved?: string } };

export default async function EditReportPage({ params, searchParams }: Props) {
  const id = Number(params.id);
  const report = Number.isInteger(id) && id > 0 ? await getReportById(id) : null;
  if (!report) notFound();

  return (
    <ReportEditor
      key={report.id}
      id={report.id}
      initialPublished={report.published}
      initialNotice={searchParams.saved === "draft" || searchParams.saved === "publish" ? searchParams.saved : undefined}
      initial={{
        date: report.date,
        title: report.title,
        summary: report.summary ?? "",
        content: report.content,
      }}
    />
  );
}
