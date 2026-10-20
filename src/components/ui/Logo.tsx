export function SparkIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M10 3.5c.5 4.4 2.6 6.5 7 7-4.4.5-6.5 2.6-7 7-.5-4.4-2.6-6.5-7-7 4.4-.5 6.5-2.6 7-7Z" />
      <path d="M18 3v4M16 5h4M19 15.5v3M17.5 17h3" strokeLinecap="round" />
    </svg>
  );
}

/** 站点 Logo：浅蓝圆形徽标 + 星芒 */
export default function Logo({ label = "每日 AI" }: { label?: string }) {
  return (
    <span className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-full border-[3px] border-ink bg-sky text-ink shadow-[2px_2px_0_0_rgb(var(--ink))]">
        <SparkIcon className="h-5 w-5" />
      </span>
      <span className="text-xl font-black text-ink">{label}</span>
    </span>
  );
}
