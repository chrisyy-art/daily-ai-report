import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SITE_NAME } from "@/lib/site";

// 西文与数字用圆润的 Nunito，中文回落到 PingFang SC / 微软雅黑。
// 字体文件随项目提供（可变字重），构建时无需访问 Google Fonts，国内服务器也能正常构建。
const sans = localFont({
  src: "./fonts/nunito-latin-wght.woff2",
  weight: "200 1000",
  variable: "--font-sans",
  display: "swap",
});

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
