import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import Logo from "@/components/ui/Logo";

export const metadata: Metadata = { title: "登录 · 每日 AI 后台" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="glass w-full max-w-sm p-8">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo label="每日 AI 后台" />
          <p className="font-mono text-xs tracking-widest text-muted">ADMIN CONSOLE</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
