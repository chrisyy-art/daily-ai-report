import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkSummary from "@/lib/markdown/remark-summary";

// 文字等于这些值的链接使用专门的样式（紧跟正文的蓝色链接）
const TAG_LINKS = new Set(["消息来源", "体验地址"]);

function textOf(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textOf).join("");
  return "";
}

const components: Components = {
  a({ href, children, node: _node, ...rest }) {
    const isExternal = !!href && /^https?:\/\//.test(href);
    const isTag = TAG_LINKS.has(textOf(children).trim());
    return (
      <a
        href={href}
        className={isTag ? "md-tag-link" : undefined}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  },
};

/**
 * 日报正文渲染。没有 "use client"，服务端和客户端都能用：
 * 对客端在服务端渲染，后台编辑器在客户端实时预览。
 */
export default function Markdown({ content }: { content: string }) {
  return (
    <div className="md-body">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkDirective, remarkSummary]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
