import { SparkIcon } from "@/components/ui/Logo";
import { formatChineseDate } from "@/lib/date";

/** "✦ DAILY AI" 小标识 */
export function DailyBadge() {
  return (
    <p className="inline-flex items-center gap-1.5 text-[13px] font-black tracking-[0.3em] text-primary">
      <SparkIcon className="h-4 w-4" />
      DAILY AI
    </p>
  );
}

/** 日报大标题 + 日期。对客端和后台预览共用 */
export default function ReportHeader({ title, date }: { title: string; date: string }) {
  return (
    <header className="text-center">
      <h1 className="text-[22px] font-black leading-snug text-ink md:text-[30px] md:leading-[1.35]">
        {title || "（未填写标题）"}
      </h1>
      {date && (
        <p className="mt-3 text-sm font-bold text-muted">
          <time dateTime={date}>{formatChineseDate(date)}</time>
        </p>
      )}
    </header>
  );
}
