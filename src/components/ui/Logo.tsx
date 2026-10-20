export function SparkIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2.5c.5 4.6 2.9 7 7.5 7.5-4.6.5-7 2.9-7.5 7.5-.5-4.6-2.9-7-7.5-7.5 4.6-.5 7-2.9 7.5-7.5Zm6.5 11c.2 1.9 1.1 2.8 3 3-1.9.2-2.8 1.1-3 3-.2-1.9-1.1-2.8-3-3 1.9-.2 2.8-1.1 3-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** 站点 Logo：渐变方块 + 星芒 */
export default function Logo({ label = "每日 AI" }: { label?: string }) {
  return (
    <span className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-bg shadow-glow-violet">
        <SparkIcon className="h-5 w-5" />
      </span>
      <span className="text-lg font-bold tracking-wide">{label}</span>
    </span>
  );
}
