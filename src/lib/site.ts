/** 站点名称：Logo、浏览器标题、页脚等处统一引用 */
export const SITE_NAME = "数科行研中心-每日AI";

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
