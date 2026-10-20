import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import Logo from "@/components/ui/Logo";
import { isAuthenticated } from "@/lib/session";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: `${SITE_NAME} 后台` };
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // middleware 已拦截，这里再校验一次兜底
  if (!(await isAuthenticated())) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <Link href="/admin">
            <Logo label={`${SITE_NAME} 后台`} />
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/" target="_blank" className="btn-ghost hidden !py-1.5 sm:inline-flex">
              查看前台 ↗
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6">{children}</div>
    </div>
  );
}
