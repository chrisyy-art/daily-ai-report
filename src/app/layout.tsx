import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SHARE_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

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
 * 默认的分享信息（Open Graph）：在钉钉等处发送网址时，显示为「16:9 大图 + 标题 + 描述」卡片。
 * 日报页面会用自己的标题和摘要覆盖。
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION, images: [SHARE_IMAGE.url] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${sans.variable} ${mono.variable}`}>
      {/*
        分享卡片只输出 og:image 等，不输出 og:title / og:description（钉钉据此按 16:9 大图版式渲染）。
        不走 metadata.openGraph：Next 会自动把页面 title / description 补成 og:title / og:description。
      */}
      <head>
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="zh_CN" />
        <meta property="og:image" content={new URL(SHARE_IMAGE.url, SITE_URL).toString()} />
        <meta property="og:image:width" content={String(SHARE_IMAGE.width)} />
        <meta property="og:image:height" content={String(SHARE_IMAGE.height)} />
        <meta property="og:image:alt" content={SHARE_IMAGE.alt} />
      </head>
      <body>{children}</body>
    </html>
  );
}
