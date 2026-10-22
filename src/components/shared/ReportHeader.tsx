import { formatChineseDate } from "@/lib/date";

/** 日报大标题 + 日期。对客端和后台预览共用 */
export default function ReportHeader({ title, date }: { title: string; date: string }) {
  return (
    <header className="text-center">
      <h1 className="text-[22px] font-bold leading-snug tracking-tight text-ink md:text-[30px] md:leading-[1.35]">
        {title || "（未填写标题）"}
      </h1>
      {date && (
        <p className="mt-3 text-sm font-medium text-muted">
          <time dateTime={date}>{formatChineseDate(date)}</time>
        </p>
      )}
    </header>
  );
}
