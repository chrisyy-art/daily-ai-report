import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkSummary from "@/lib/markdown/remark-summary";

// 文字等于这些值的链接渲染成胶囊标签
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
        {isTag && (
          <svg aria-hidden viewBox="0 0 16 16" className="md-tag-icon">
            <path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
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
