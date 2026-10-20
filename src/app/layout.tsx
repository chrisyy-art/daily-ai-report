import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { SITE_NAME } from "@/lib/site";

// 西文与数字用圆润的 Nunito，中文回落到 PingFang SC / 微软雅黑
const sans = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "每天几分钟，跟上 AI 行业的重要动态。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
