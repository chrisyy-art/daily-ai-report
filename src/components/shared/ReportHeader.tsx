import { SparkIcon } from "@/components/ui/Logo";
import { formatChineseDate } from "@/lib/date";

/** "✦ DAILY AI" 小标识 */
export function DailyBadge() {
  return (
    <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-surface/80 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-primary">
      <SparkIcon className="h-3.5 w-3.5" />
      DAILY AI
    </p>
  );
}

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
