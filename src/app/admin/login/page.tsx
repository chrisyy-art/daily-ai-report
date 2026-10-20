import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import Logo from "@/components/ui/Logo";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: `登录 · ${SITE_NAME} 后台` };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo label={`${SITE_NAME} 后台`} />
          <p className="text-xs font-black tracking-[0.3em] text-primary">ADMIN CONSOLE</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
