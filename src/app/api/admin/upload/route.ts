import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { IMAGE_TYPES, UPLOAD_DIR } from "@/lib/uploads";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/** 上传一张图片（导入 HTML 时把内嵌图片存到服务器），返回可访问的地址 */
export async function POST(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "请选择图片" }, { status: 400 });
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "只支持 JPG、PNG、WebP、GIF、SVG 图片" }, { status: 415 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "单张图片不能超过 5MB" }, { status: 413 });

  const buffer = Buffer.from(await file.arrayBuffer());
  // 同一张图重复导入只存一份
  const name = `${createHash("sha256").update(buffer).digest("hex").slice(0, 32)}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), buffer);
  return NextResponse.json({ url: `/uploads/${name}` });
}
