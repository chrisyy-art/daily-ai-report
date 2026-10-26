import path from "node:path";

/** 图片存放目录：默认项目根目录下的 uploads/，可用 UPLOAD_DIR 改到别处 */
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "uploads");

/** 允许上传的图片类型 → 扩展名 */
export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export const CONTENT_TYPES: Record<string, string> = Object.fromEntries(
  Object.entries(IMAGE_TYPES).map(([type, ext]) => [ext, type]),
);

/** 文件名 = 内容哈希 + 扩展名，只允许这种格式，防止路径穿越 */
export const FILE_NAME = /^[a-f0-9]{32}\.(jpg|png|webp|gif|svg)$/;
