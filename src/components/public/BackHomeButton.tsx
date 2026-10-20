import Link from "next/link";

export default function BackHomeButton() {
  return (
    <Link href="/" className="btn-ghost !rounded-full !px-4">
      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
        <path d="M13 8H3m4-4L3 8l4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      返回首页
    </Link>
  );
}
