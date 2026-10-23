import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SITE_NAME } from "@/lib/site";

// 西文与数字用 Inter，中文回落到 PingFang SC / 微软雅黑。
// 字体文件随项目提供（可变字重），构建时无需访问 Google Fonts，国内服务器也能正常构建。
const sans = localFont({
  src: "./fonts/inter-latin-wght.woff2",
  weight: "100 900",
  variable: "--font-sans",
  display: "swap",
});

// 等宽字体：日期、序号、标签等（P 风格大量使用），同样随项目提供
const mono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-400.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-mono-500.woff2", weight: "500" },
    { path: "./fonts/ibm-plex-mono-600.woff2", weight: "600" },
  ],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "每天几分钟，跟上 AI 行业的重要动态。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
