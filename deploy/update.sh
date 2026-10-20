#!/usr/bin/env bash
# 更新到最新代码：在服务器的项目目录里运行
#   bash deploy/update.sh
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo "==> 备份数据库"
bash deploy/backup.sh

if [[ -d .git ]]; then
  echo "==> 拉取最新代码"
  git pull --ff-only
else
  echo "==> 未检测到 git 仓库，使用当前目录中已上传的代码"
fi

echo "==> 安装依赖、同步表结构、构建"
if ! PRISMA_ENGINES_MIRROR="https://registry.npmmirror.com/-/binary/prisma" npm ci --no-audit --no-fund; then
  echo "镜像安装失败，改用官方源重试……"
  npm ci --no-audit --no-fund
fi
npx prisma db push --skip-generate
npm run build

echo "==> 重启服务"
pm2 reload daily-ai

# 等服务重新就绪（重启期间会有 1~2 秒访问不了）
for _ in $(seq 1 30); do
  if curl -fs -o /dev/null http://127.0.0.1:3000/; then
    echo "更新完成，网站已恢复访问"
    exit 0
  fi
  sleep 1
done
echo "服务 30 秒内没有恢复，请运行 pm2 logs daily-ai 查看错误"
exit 1
