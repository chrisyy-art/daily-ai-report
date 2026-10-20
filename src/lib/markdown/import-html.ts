import { htmlToMarkdown } from "./html-to-markdown";

/**
 * 导入 .html 文件（仅浏览器端）。
 *
 * 导出的 HTML 往往用 CSS 类控制加粗（如 .title { font-weight: 700 }），直接转换会丢格式。
 * 这里先把文件放进禁用脚本的隐藏 iframe 里渲染，让样式表生效，
 * 再把"计算后"的加粗写回成内联样式，最后交给 htmlToMarkdown。
 */

// 与正文无关的页面元素
const CHROME_SELECTORS = "script, style, link, noscript, template, iframe, nav, footer, aside, button, form, input, select, textarea, svg, canvas";
const NO_BOLD_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6", "TH", "B", "STRONG"]);

/** 按 <meta charset> 解码，兼容 GBK 等非 UTF-8 文件 */
function decode(buffer: ArrayBuffer): string {
  const head = new TextDecoder("latin1").decode(buffer.slice(0, 4096));
  const declared = head.match(/<meta[^>]+charset\s*=\s*["']?\s*([\w-]+)/i)?.[1];
  const tryDecode = (label: string) => {
    try {
      return new TextDecoder(label).decode(buffer);
    } catch {
      return null;
    }
  };
  if (declared) {
    const text = tryDecode(declared);
    if (text) return text;
  }
  const utf8 = tryDecode("utf-8") ?? "";
  // 出现大量替换字符，多半是没声明编码的 GBK 文件
  const broken = (utf8.match(/�/g) ?? []).length;
  return broken > 10 ? tryDecode("gb18030") ?? utf8 : utf8;
}

/** 在隐藏、禁用脚本的 iframe 中渲染，等样式就绪 */
function renderInSandbox(html: string): Promise<{ doc: Document; dispose: () => void }> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    // 不给 allow-scripts：文件里的脚本不会执行；allow-same-origin 让我们能读取渲染结果
    iframe.setAttribute("sandbox", "allow-same-origin");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText = "position:fixed;left:-10000px;top:0;width:1200px;height:800px;border:0;";
    const dispose = () => iframe.remove();
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      const doc = iframe.contentDocument;
      if (doc?.body) resolve({ doc, dispose });
      else {
        dispose();
        reject(new Error("HTML 文件解析失败"));
      }
    };
    iframe.onload = done;
    // 外链样式加载太慢时不无限等待
    window.setTimeout(done, 5000);
    iframe.srcdoc = html.replace(/<script[\s\S]*?<\/script>/gi, "");
    document.body.appendChild(iframe);
  });
}

const isBold = (el: Element, win: Window) => {
  const weight = win.getComputedStyle(el).fontWeight;
  return weight === "bold" || weight === "bolder" || Number(weight) >= 600;
};

/** 把计算后的样式写回为内联：隐藏元素删除，加粗起点标上 font-weight:700 */
function inlineComputedStyles(doc: Document) {
  const win = doc.defaultView!;
  const elements = Array.from(doc.body.querySelectorAll("*"));

  // 先判定再修改，避免删除节点影响后续计算
  const hidden: Element[] = [];
  const boldStarts: Element[] = [];
  for (const el of elements) {
    const style = win.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") {
      hidden.push(el);
      continue;
    }
    if (NO_BOLD_TAGS.has(el.tagName) || !el.textContent?.trim()) continue;
    const parent = el.parentElement;
    if (isBold(el, win) && (!parent || !isBold(parent, win))) boldStarts.push(el);
  }

  // 字号明显大于正文、单独成块的短文字，视为小节标题（如"一、投融资"）
  const baseSize = parseFloat(win.getComputedStyle(doc.body).fontSize) || 16;
  const headings = new Map<Element, "h2" | "h3">();
  for (const el of elements) {
    if (hidden.includes(el) || /^H[1-6]$/.test(el.tagName) || el.closest("li, td, th, a")) continue;
    const style = win.getComputedStyle(el);
    const text = el.textContent?.trim() ?? "";
    const hasBlockChild = Array.from(el.children).some((c) => win.getComputedStyle(c).display !== "inline");
    if (style.display !== "block" || hasBlockChild || !text || text.length > 40) continue;
    const ratio = parseFloat(style.fontSize) / baseSize;
    if (ratio >= 1.25) headings.set(el, "h2");
    else if (ratio >= 1.1 && isBold(el, win)) headings.set(el, "h3");
  }

  for (const el of boldStarts) {
    (el as HTMLElement).setAttribute("style", "font-weight:700");
  }
  for (const el of elements) {
    if (!boldStarts.includes(el)) el.removeAttribute("style");
  }
  hidden.forEach((el) => el.remove());

  headings.forEach((tag, el) => {
    const heading = doc.createElement(tag);
    heading.innerHTML = el.innerHTML;
    el.replaceWith(heading);
  });
}

/** 优先取 <main> / <article>，否则用整个 body */
function pickContent(doc: Document): HTMLElement {
  const bodyText = doc.body.textContent?.trim().length ?? 0;
  const candidate = doc.querySelector("main") ?? (doc.querySelectorAll("article").length === 1 ? doc.querySelector("article") : null);
  // 候选区域要占全文大部分内容才采用，避免只取到一个小模块
  if (candidate && (candidate.textContent?.trim().length ?? 0) > bodyText * 0.5) return candidate as HTMLElement;
  return doc.body;
}

export async function htmlFileToMarkdown(file: File): Promise<string> {
  const html = decode(await file.arrayBuffer());
  const { doc, dispose } = await renderInSandbox(html);
  try {
    inlineComputedStyles(doc);
    const root = pickContent(doc);
    root.querySelectorAll(CHROME_SELECTORS).forEach((el) => el.remove());
    return htmlToMarkdown(root.innerHTML);
  } finally {
    dispose();
  }
}
