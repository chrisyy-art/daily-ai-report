import { readFile } from "node:fs/promises";
import path from "node:path";
import { CONTENT_TYPES, FILE_NAME, UPLOAD_DIR } from "@/lib/uploads";

/** 读取后台上传的图片。文件名是内容哈希，内容不会变，可长期缓存 */
export async function GET(_req: Request, { params }: { params: { name: string } }) {
  if (!FILE_NAME.test(params.name)) return new Response("Not found", { status: 404 });
  const data = await readFile(path.join(UPLOAD_DIR, params.name)).catch(() => null);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(data, {
    headers: {
      "Content-Type": CONTENT_TYPES[params.name.split(".").pop()!],
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // SVG 单独打开时也不能执行脚本
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
    },
  });
}
