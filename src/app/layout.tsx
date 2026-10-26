import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SHARE_IMAGE, SHARE_THUMB, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

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

/**
 * 默认的分享信息（Open Graph）：在钉钉、微信等处发送网址时，显示为「标题 + 描述 + 封面图」卡片。
 * 日报页面会用自己的标题和摘要覆盖。
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "zh_CN",
    images: [SHARE_IMAGE],
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION, images: [SHARE_IMAGE.url] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${sans.variable} ${mono.variable}`}>
      <head>
        {/* 部分国内应用（如钉钉的小方图卡片）读取 itemprop / image_src 作为缩略图，而不是 og:image 大图 */}
        <meta itemProp="name" content={SITE_NAME} />
        <meta itemProp="description" content={SITE_DESCRIPTION} />
        <meta itemProp="image" content={new URL(SHARE_THUMB, SITE_URL).toString()} />
        <link rel="image_src" href={new URL(SHARE_THUMB, SITE_URL).toString()} />
      </head>
      <body>{children}</body>
    </html>
  );
}
