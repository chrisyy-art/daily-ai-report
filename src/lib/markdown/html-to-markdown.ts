import TurndownService from "turndown";
import { strikethrough, taskListItems } from "turndown-plugin-gfm";

/**
 * 把富文本 HTML（语雀 / 飞书 / Word / 网页复制，或 .docx 转出的 HTML）转成 Markdown。
 * 浏览器（粘贴、导入 .html）和服务端（导入 .docx）共用。
 */

const BOLD_WEIGHT = /font-weight\s*:\s*(bold|bolder|[6-9]00)/i;
const NORMAL_WEIGHT = /font-weight\s*:\s*(normal|[1-4]00)/i;

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

  // 很多编辑器用 <span style="font-weight:700"> 表示加粗
  service.addRule("styledBold", {
    filter: (node) => node.nodeName === "SPAN" && BOLD_WEIGHT.test(styleOf(node)),
    replacement: (content) => (content.trim() ? `**${content}**` : content),
  });

  // 链接：去掉无效链接和 title，括号、空格做编码，避免破坏 Markdown 语法
  service.addRule("link", {
    filter: (node) => node.nodeName === "A",
    replacement: (content, node) => {
      const href = ((node as HTMLElement).getAttribute("href") ?? "").trim();
      if (!content.trim()) return "";
      if (!href || /^(javascript|data):/i.test(href) || href.startsWith("#")) return content;
      const url = href.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
      return `[${content.trim()}](${url})`;
    },
  });

  // 图片：只保留网络图片，内嵌的 base64 图片丢弃
  service.addRule("image", {
    filter: "img",
    replacement: (_content, node) => {
      const src = ((node as HTMLElement).getAttribute("src") ?? "").trim();
      if (!/^https?:\/\//i.test(src)) return "";
      const alt = ((node as HTMLElement).getAttribute("alt") ?? "").replace(/[[\]]/g, "");
      return `![${alt}](${src})`;
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
