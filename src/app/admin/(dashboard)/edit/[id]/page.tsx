import { notFound } from "next/navigation";
import ReportEditor from "@/components/admin/ReportEditor";
import { getReportById } from "@/lib/reports";

export default async function EditReportPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const report = Number.isInteger(id) && id > 0 ? await getReportById(id) : null;
  if (!report) notFound();

  return (
    <ReportEditor
      key={report.id}
      id={report.id}
      initialPublished={report.published}
      initial={{
        date: report.date,
        title: report.title,
        summary: report.summary ?? "",
        content: report.content,
      }}
    />
  );
}
