import Link from "next/link";

export default function BackHomeButton() {
  return (
    <Link href="/" className="btn-ghost !px-3.5 !py-1.5">
      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
        <path d="M13 8H3m4-4L3 8l4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      返回首页
    </Link>
  );
}
