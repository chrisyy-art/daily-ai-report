#!/usr/bin/env bash
# 首次部署：在全新的 Ubuntu 22.04 / 24.04 服务器上，以 root 身份运行
#   bash deploy/install.sh
# 可选环境变量：
#   DOMAIN=daily.example.com   绑定域名（不填则先用公网 IP 访问）
#   SEED=1                     写入 2 条示例日报
#   NPM_REGISTRY=...           npm 源，默认国内镜像 npmmirror（香港 / 海外服务器可设为 https://registry.npmjs.org）
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_VERSION="20.18.1"
NPM_REGISTRY="${NPM_REGISTRY:-https://registry.npmmirror.com}"
# Node.js 安装包下载源，依次尝试：国内镜像 → 官方
NODE_MIRRORS=(https://npmmirror.com/mirrors/node https://cdn.npmmirror.com/binaries/node https://nodejs.org/dist)
PRISMA_MIRROR="https://registry.npmmirror.com/-/binary/prisma"
DOMAIN="${DOMAIN:-}"

step() { printf '\n\033[1;34m==> %s\033[0m\n' "$1"; }

[[ $EUID -eq 0 ]] || { echo "请用 root 运行：sudo bash deploy/install.sh"; exit 1; }
cd "$APP_DIR"

step "1/7 安装系统软件（nginx、sqlite3 等）"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx sqlite3 curl xz-utils openssl ca-certificates

step "2/7 内存不足 3G 时添加 2G 交换空间（避免构建时内存不够）"
mem_mb=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
if [[ $mem_mb -lt 3000 ]] && ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "已添加 2G swap"
else
  echo "跳过（内存 ${mem_mb}MB 或已有 swap）"
fi

step "3/7 安装 Node.js ${NODE_VERSION}（从国内镜像下载）"
if ! command -v node >/dev/null || [[ $(node -p 'process.versions.node.split(".")[0]') -lt 18 ]]; then
  case "$(uname -m)" in
    x86_64) arch=x64 ;;
    aarch64) arch=arm64 ;;
    *) echo "不支持的 CPU 架构：$(uname -m)"; exit 1 ;;
  esac
  tarball="node-v${NODE_VERSION}-linux-${arch}.tar.xz"
  downloaded=""
  for m in "${NODE_MIRRORS[@]}"; do
    echo "尝试从 ${m} 下载……"
    if curl -fL --connect-timeout 10 "${m}/v${NODE_VERSION}/${tarball}" -o "/tmp/${tarball}"; then downloaded=1; break; fi
  done
  [[ -n "$downloaded" ]] || { echo "Node.js 下载失败，请检查服务器网络"; exit 1; }
  tar -xJf "/tmp/${tarball}" -C /usr/local --strip-components=1
  rm -f "/tmp/${tarball}"
fi
node -v
npm config set registry "${NPM_REGISTRY}"
command -v pm2 >/dev/null || npm install -g pm2

step "4/7 生成配置文件 .env"
if [[ -f .env ]]; then
  echo "已存在 .env，保持不变"
else
  if [[ -t 0 ]]; then
    read -rsp "请设置后台管理员密码（输入时不显示，直接回车则随机生成）：" admin_pw; echo
  fi
  generated=""
  if [[ -z "${admin_pw:-}" ]]; then
    admin_pw="$(openssl rand -base64 12 | tr -d '/+=')"
    generated=1
  fi
  cat > .env <<ENV
DATABASE_URL="file:./prod.db"
ADMIN_PASSWORD="${admin_pw}"
SESSION_SECRET="$(openssl rand -hex 32)"
REPORT_TIMEZONE="Asia/Shanghai"
ENV
  chmod 600 .env
  [[ -n "$generated" ]] && echo "已随机生成后台密码：${admin_pw}   （请记下来，也可在 .env 中查看和修改）"
fi

step "5/7 安装依赖、建库、构建（需要几分钟）"
# Prisma 引擎先走国内镜像，失败再用官方源重试
if ! PRISMA_ENGINES_MIRROR="${PRISMA_MIRROR}" npm ci --no-audit --no-fund; then
  echo "镜像安装失败，改用官方源重试……"
  npm ci --no-audit --no-fund
fi
npx prisma db push --skip-generate
[[ "${SEED:-}" == "1" ]] && npx prisma db seed
npm run build

step "6/7 用 pm2 启动并设置开机自启"
pm2 startOrReload ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null || echo "（未检测到 systemd，跳过开机自启设置）"

step "7/7 配置 Nginx 与每日数据库备份"
cat > /etc/nginx/sites-available/daily-ai <<NGINX
server {
    listen 80;
    server_name ${DOMAIN:-_};

    # 导入 Word 文档最大 10MB，这里留一点余量
    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX
ln -sf /etc/nginx/sites-available/daily-ai /etc/nginx/sites-enabled/daily-ai
rm -f /etc/nginx/sites-enabled/default
nginx -t
if systemctl enable --now nginx 2>/dev/null; then
  systemctl reload nginx
else
  service nginx start 2>/dev/null || nginx
  nginx -s reload
fi

chmod +x deploy/*.sh
echo "30 3 * * * root ${APP_DIR}/deploy/backup.sh >> /var/log/daily-ai-backup.log 2>&1" > /etc/cron.d/daily-ai-backup

ip="$(curl -fsS --max-time 5 https://ipinfo.io/ip 2>/dev/null || hostname -I | awk '{print $1}')"
printf '\n\033[1;32m部署完成！\033[0m\n'
echo "  阅读端：http://${DOMAIN:-$ip}"
echo "  后台：  http://${DOMAIN:-$ip}/admin"
echo "  若打不开，请在云服务器控制台的「防火墙 / 安全组」中放行 80 端口"
