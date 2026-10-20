import type { Root, PhrasingContent } from "mdast";
import type {} from "mdast-util-directive";
import { visit } from "unist-util-visit";

/**
 * 配合 remark-directive 使用：
 *   :::summary
 *   这里是重点摘要
 *   :::
 * 渲染为 <div class="md-summary">。
 *
 * remark-directive 还会把正文里的 "abc:def" 之类误识别为行内指令，
 * 这里把未声明的指令还原成原始文本，避免内容丢失。
 */
export default function remarkSummary() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (node.type === "containerDirective" && node.name === "summary") {
        node.data = { ...node.data, hName: "div", hProperties: { className: ["md-summary"] } };
        return;
      }

      if (!parent || index === undefined) return;

      if (node.type === "textDirective") {
        const hasLabel = node.children.length > 0;
        const restored: PhrasingContent[] = [
          { type: "text", value: `:${node.name}${hasLabel ? "[" : ""}` },
          ...node.children,
          ...(hasLabel ? [{ type: "text", value: "]" } as const] : []),
        ];
        parent.children.splice(index, 1, ...(restored as never[]));
        return index + restored.length;
      }

      if (node.type === "leafDirective" || node.type === "containerDirective") {
        // 未知的块级指令：降级为普通段落 / 原样保留子内容
        const prefix = node.type === "leafDirective" ? "::" : ":::";
        if (node.type === "leafDirective") {
          parent.children.splice(index, 1, {
            type: "paragraph",
            children: [{ type: "text", value: prefix + node.name }, ...node.children],
          } as never);
        } else {
          node.data = { ...node.data, hName: "div" };
        }
      }
    });
  };
}
