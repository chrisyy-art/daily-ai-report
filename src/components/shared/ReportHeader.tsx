import { formatLongDate } from "@/lib/date";

/** 日报标题区：日期 + 大标题 + 资讯条数。对客端和后台预览共用（P 风格里条数与标题同一行） */
export default function ReportHeader({ title, date, count }: { title: string; date: string; count?: number }) {
  return (
    <header>
      {date && (
        <p className="report-date text-[13px] font-semibold text-primary">
          <time dateTime={date}>{formatLongDate(date)}</time>
        </p>
      )}
      <div className="report-title-row">
        <h1 className="report-title mt-2.5 text-[24px] font-bold leading-[1.3] tracking-tight text-ink md:text-[32px]">
          {title || "（未填写标题）"}
        </h1>
        {count !== undefined && count > 0 && (
          <p className="report-count mt-2.5 text-[13px] text-muted">
            共 <b className="font-semibold">{count}</b> 条资讯
          </p>
        )}
      </div>
    </header>
  );
}
