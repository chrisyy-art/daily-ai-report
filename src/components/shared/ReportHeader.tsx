import { formatLongDate } from "@/lib/date";

/** 日报标题区：日期（主色小字）+ 大标题 + 补充信息。对客端和后台预览共用 */
export default function ReportHeader({ title, date, meta }: { title: string; date: string; meta?: string }) {
  return (
    <header>
      {date && (
        <p className="text-sm font-semibold text-primary">
          <time dateTime={date}>{formatLongDate(date)}</time>
        </p>
      )}
      <h1 className="mt-3 text-[28px] font-bold leading-[1.25] tracking-tight text-ink md:text-[40px]">
        {title || "（未填写标题）"}
      </h1>
      {meta && <p className="mt-3 text-sm text-muted">{meta}</p>}
    </header>
  );
}
