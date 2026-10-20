import mammoth from "mammoth";
import { NextResponse } from "next/server";
import { htmlToMarkdown } from "@/lib/markdown/html-to-markdown";
import { requireAuth } from "@/lib/session";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/** 导入 Word 文档：.docx → HTML（mammoth）→ Markdown */
export async function POST(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请选择要导入的文件" }, { status: 400 });
  }
  if (!/\.docx$/i.test(file.name)) {
    return NextResponse.json({ error: "这个接口只处理 .docx 文件；旧版 .doc 请先在 Word 里另存为 .docx" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "文件不能超过 10MB" }, { status: 413 });
  }

  let images = 0;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { value: html } = await mammoth.convertToHtml(
      { buffer },
      {
        // 图片暂不导入（站点还没有图片存储），只统计数量提示用户
        convertImage: mammoth.images.imgElement(async () => {
          images += 1;
          return { src: "" };
        }),
      },
    );
    return NextResponse.json({ markdown: htmlToMarkdown(html), images });
  } catch {
    return NextResponse.json({ error: "文档解析失败，请确认是有效的 .docx 文件" }, { status: 422 });
  }
}
