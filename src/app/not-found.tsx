import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="glass max-w-md px-8 py-12 text-center">
        <p className="text-gradient font-mono text-5xl font-bold">404</p>
        <p className="mt-4 text-muted">这一天的日报不存在或尚未发布。</p>
        <Link href="/" className="btn-primary mt-8">
          返回首页
        </Link>
      </div>
    </div>
  );
}
