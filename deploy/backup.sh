#!/usr/bin/env bash
# 备份 SQLite 数据库到 backups/，保留最近 14 份。install.sh 已配置为每天 03:30 自动执行
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB="$APP_DIR/prisma/prod.db"
DEST="$APP_DIR/backups"

[[ -f "$DB" ]] || { echo "未找到数据库 $DB，跳过备份"; exit 0; }
mkdir -p "$DEST"
# 用 sqlite3 的 .backup，写入过程中备份也不会损坏
sqlite3 "$DB" ".backup '$DEST/prod-$(date +%Y%m%d-%H%M%S).db'"
ls -1t "$DEST"/prod-*.db | tail -n +15 | xargs -r rm -f
echo "$(date '+%F %T') 备份完成"
