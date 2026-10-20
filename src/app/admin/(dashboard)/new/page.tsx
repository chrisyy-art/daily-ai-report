import ReportEditor from "@/components/admin/ReportEditor";
import { todayString } from "@/lib/date";

export default function NewReportPage() {
  return <ReportEditor initial={{ date: todayString(), title: "", summary: "", content: "" }} />;
}
