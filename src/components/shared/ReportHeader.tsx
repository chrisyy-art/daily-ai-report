import { SparkIcon } from "@/components/ui/Logo";
import { formatChineseDate } from "@/lib/date";

/** "✦ DAILY AI" 小标识 */
export function DailyBadge() {
  return (
    <p className="inline-flex items-center gap-2 text-sm font-black tracking-[0.3em] text-primary">
      <SparkIcon className="h-5 w-5" />
      DAILY AI
    </p>
  );
}

/** 日报大标题 + 日期。对客端和后台预览共用 */
export default function ReportHeader({ title, date }: { title: string; date: string }) {
  return (
    <header className="text-center">
      <h1 className="text-2xl font-black leading-snug text-ink md:text-[40px] md:leading-[1.3]">
        {title || "（未填写标题）"}
      </h1>
      {date && (
        <p className="mt-4 text-base font-bold text-muted">
          <time dateTime={date}>{formatChineseDate(date)}</time>
        </p>
      )}
    </header>
  );
}
