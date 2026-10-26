/** 站点名称：Logo、浏览器标题、页脚等处统一引用 */
export const SITE_NAME = "数科行研中心-每日AI";

/** 站点一句话介绍：分享卡片、搜索结果中的描述 */
export const SITE_DESCRIPTION = "追踪全球 AI 前沿动态，洞察产业趋势与商业机会";

/** 站点对外地址：分享卡片里的图片、链接需要完整网址。换域名时在 .env 设置 SITE_URL */
export const SITE_URL = process.env.SITE_URL || "https://dtresearchhub.cn";

/**
 * 分享卡片封面（og:image）。须为 16:9，钉钉才会按「大图 + 标题」的版式渲染链接卡片；
 * 页面上不要再放其他候选图片（如 itemprop image），以免被当作小缩略图。
 */
export const SHARE_IMAGE = { url: "/cover.png", width: 1280, height: 720, alt: SITE_NAME };

/**
 * 前台固定显示的新闻板块 Tab（顺序即显示顺序）。
 * 正文里的 ## 板块名与 label 一致或包含 aliases 中的词时，归入该 Tab。
 */
export const SECTION_TABS = [
  { label: "AI模型", aliases: ["大模型", "模型"] },
  { label: "AI应用", aliases: ["应用", "Agent", "产品"] },
  { label: "算力与MaaS", aliases: ["算力", "MaaS", "云服务", "推理服务"] },
  { label: "AI硬件", aliases: ["硬件", "芯片", "终端", "机器人"] },
  { label: "资本与并购", aliases: ["投融资", "融资", "并购", "收购", "资本", "IPO", "上市"] },
] as const;
