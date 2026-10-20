// 一键初始化：生成 .env（若不存在）→ 建表 → 写入示例数据
import { copyFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

if (existsSync(".env")) {
  console.log("✓ 已存在 .env，跳过复制");
} else {
  copyFileSync(".env.example", ".env");
  console.log("✓ 已根据 .env.example 生成 .env（默认后台密码 change-me）");
}

const run = (cmd) => execSync(cmd, { stdio: "inherit" });
run("npx prisma db push");
run("npx prisma db seed");

console.log("\n✓ 初始化完成，运行 npm run dev 启动");
