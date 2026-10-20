import { SITE_NAME } from "@/lib/site";

export function SparkIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M10 3.5c.5 4.4 2.6 6.5 7 7-4.4.5-6.5 2.6-7 7-.5-4.4-2.6-6.5-7-7 4.4-.5 6.5-2.6 7-7Z" />
      <path d="M18 3v4M16 5h4M19 15.5v3M17.5 17h3" strokeLinecap="round" />
    </svg>
  );
}

/** 站点 Logo：浅蓝圆形徽标 + 星芒 */
export default function Logo({ label = SITE_NAME }: { label?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border-[2.5px] border-ink bg-sky text-ink shadow-[2px_2px_0_0_rgb(var(--ink))]">
        <SparkIcon className="h-[18px] w-[18px]" />
      </span>
      <span className="truncate text-base font-black text-ink sm:text-[17px]">{label}</span>
    </span>
  );
}
