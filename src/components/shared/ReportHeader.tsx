import { SparkIcon } from "@/components/ui/Logo";
import { formatChineseDate } from "@/lib/date";

/** 日报标题区：DAILY AI 标识 + 渐变大标题 + 日期。对客端和后台预览共用 */
export default function ReportHeader({ title, date }: { title: string; date: string }) {
  return (
    <header className="text-center">
      <p className="mb-5 inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.4em] text-violet">
        <SparkIcon className="h-4 w-4" />
        DAILY AI
      </p>
      <h1 className="text-gradient text-2xl font-extrabold leading-snug md:text-4xl md:leading-[1.35]">
        {title || "（未填写标题）"}
      </h1>
      {date && (
        <p className="mt-4 font-mono text-sm text-muted">
          <time dateTime={date}>{formatChineseDate(date)}</time>
        </p>
      )}
    </header>
  );
}
