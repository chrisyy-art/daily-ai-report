import TurndownService from "turndown";
import { strikethrough, taskListItems } from "turndown-plugin-gfm";

/**
 * 把富文本 HTML（语雀 / 飞书 / Word / 网页复制，或 .docx 转出的 HTML）转成 Markdown。
 * 浏览器（粘贴、导入 .html）和服务端（导入 .docx）共用。
 */

const BOLD_WEIGHT = /font-weight\s*:\s*(bold|bolder|[6-9]00)/i;
const NORMAL_WEIGHT = /font-weight\s*:\s*(normal|[1-4]00)/i;

// 这些元素有各自的转换规则，加粗样式不在它们身上处理
const STRUCTURAL_TAGS = new Set([
  "A", "B", "STRONG", "H1", "H2", "H3", "H4", "H5", "H6",
  "UL", "OL", "LI", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD", "PRE", "CODE", "BLOCKQUOTE", "IMG",
]);
const BLOCK_TAGS = new Set(["P", "DIV", "SECTION", "ARTICLE", "HEADER", "MAIN", "DD", "DT", "FIGURE", "FIGCAPTION"]);

const styleOf = (node: Node) => ((node as HTMLElement).getAttribute?.("style") ?? "");

/** 单元格内容不能换行，也不能有未转义的竖线 */
const cellText = (md: string) => md.replace(/\n+/g, " ").replace(/\|/g, "\\|").trim();

function createService() {
  const service = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
  });

  service.use([strikethrough, taskListItems]);
  service.remove(["style", "script", "meta", "title", "head", "noscript"]);

  // Google Docs 会用 <b style="font-weight:normal"> 包住整段，不应当成加粗
  service.addRule("fakeBold", {
    filter: (node) => node.nodeName === "B" && NORMAL_WEIGHT.test(styleOf(node)),
    replacement: (content) => content,
  });

  // 很多编辑器 / 导出页面用 style="font-weight:700" 表示加粗（span、p、div 都有）
  service.addRule("styledBold", {
    filter: (node) => !STRUCTURAL_TAGS.has(node.nodeName) && BOLD_WEIGHT.test(styleOf(node)),
    replacement: (content, node) => {
      const inner = content.replace(/\*\*/g, "").trim(); // 去掉内部重复的加粗标记
      const block = BLOCK_TAGS.has(node.nodeName);
      // 跨段落的内容不能整体加粗，保持原样
      if (!inner || inner.includes("\n\n")) return block ? `\n\n${content}\n\n` : content;
      return block ? `\n\n**${inner}**\n\n` : `**${inner}**`;
    },
  });

  // 链接：去掉无效链接和 title，括号、空格做编码，避免破坏 Markdown 语法
  service.addRule("link", {
    filter: (node) => node.nodeName === "A",
    replacement: (content, node) => {
      const href = ((node as HTMLElement).getAttribute("href") ?? "").trim();
      if (!content.trim()) return "";
      if (!href || /^(javascript|data):/i.test(href) || href.startsWith("#")) return content;
      const url = href.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
      const link = `[${content.replace(/\*\*/g, "").trim()}](${url})`;
      return BOLD_WEIGHT.test(styleOf(node)) ? `**${link}**` : link;
    },
  });

  // 图片：保留网络图片和站内图片（导入 HTML 时内嵌图片已上传到 /uploads/），其余 base64 图片丢弃。
  // 原文图片设置了「完整显示、不裁切」（class="is-contain"）时，用 title "contain" 记下来
  service.addRule("image", {
    filter: "img",
    replacement: (_content, node) => {
      const el = node as HTMLElement;
      const src = (el.getAttribute("src") ?? "").trim();
      if (!/^(https?:\/\/|\/uploads\/)/i.test(src)) return "";
      const alt = (el.getAttribute("alt") ?? "").replace(/[[\]【】]/g, "").replace(/[，,]\s*图片取自.*$/, "").trim();
      const title = /\bis-contain\b/.test(el.getAttribute("class") ?? "") ? ' "contain"' : "";
      return `![${alt}](${src.replace(/ /g, "%20")}${title})`;
    },
  });

  // 表格：统一转成 GFM 表格，第一行当表头（插件版遇到无表头的表格会原样保留 HTML）
  service.addRule("table", {
    filter: "table",
    replacement: (_content, node) => {
      const rows = Array.from((node as HTMLTableElement).querySelectorAll("tr"));
      if (rows.length === 0) return "";
      const matrix = rows.map((tr) =>
        Array.from(tr.querySelectorAll("th, td")).map((cell) => cellText(service.turndown((cell as HTMLElement).innerHTML))),
      );
      const width = Math.max(...matrix.map((r) => r.length));
      if (width === 0) return "";
      const line = (cells: string[]) =>
        `| ${Array.from({ length: width }, (_, i) => cells[i] ?? "").join(" | ")} |`;
      const [head, ...body] = matrix;
      return `\n\n${[line(head), line(Array(width).fill("---")), ...body.map(line)].join("\n")}\n\n`;
    },
  });

  return service;
}

let cached: TurndownService | null = null;

export function htmlToMarkdown(html: string): string {
  cached ??= createService();
  return cached
    .turndown(html)
    .replace(/ /g, " ")
    .replace(/^(\s*)([-*]|\d+\.) {2,}/gm, "$1$2 ") // turndown 的列表标记后有 3 个空格，收成 1 个
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
