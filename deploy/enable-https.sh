#!/usr/bin/env bash
# 为已解析到本服务器的域名申请免费 HTTPS 证书（Let's Encrypt，自动续期）
#   bash deploy/enable-https.sh 域名 [更多域名...] 邮箱
# 例如：
#   bash deploy/enable-https.sh example.com www.example.com you@example.com
# 中国内地服务器的域名需先完成 ICP 备案；香港 / 海外服务器无需备案。
set -euo pipefail

usage="用法：bash deploy/enable-https.sh 域名 [更多域名...] 邮箱"
EMAIL=""
DOMAINS=()
for arg in "$@"; do
  if [[ "$arg" == *@* ]]; then EMAIL="$arg"; else DOMAINS+=("$arg"); fi
done
[[ -n "$EMAIL" && ${#DOMAINS[@]} -gt 0 ]] || { echo "$usage"; exit 1; }

[[ $EUID -eq 0 ]] || { echo "请先执行 sudo -i 切换到 root"; exit 1; }

# 先检查解析：域名没指向本机时，证书一定会申请失败
public_ip="$(curl -fsS --max-time 5 https://ipinfo.io/ip 2>/dev/null || true)"
for d in "${DOMAINS[@]}"; do
  resolved="$(getent ahostsv4 "$d" | awk 'NR==1 {print $1}')"
  if [[ -z "$resolved" ]]; then
    echo "✗ $d 还解析不到任何 IP。请确认已添加 A 记录，并等待 5~10 分钟后重试"
    exit 1
  fi
  if [[ -n "$public_ip" && "$resolved" != "$public_ip" ]]; then
    echo "✗ $d 解析到的是 $resolved，而本服务器的公网 IP 是 $public_ip。请检查 A 记录的记录值"
    exit 1
  fi
  echo "✓ $d → $resolved"
done

apt-get install -y certbot python3-certbot-nginx
sed -i "s/server_name .*;/server_name ${DOMAINS[*]};/" /etc/nginx/sites-available/daily-ai
nginx -t && systemctl reload nginx

certbot_args=()
for d in "${DOMAINS[@]}"; do certbot_args+=(-d "$d"); done
certbot --nginx "${certbot_args[@]}" -m "$EMAIL" --agree-tos --redirect --non-interactive

echo
for d in "${DOMAINS[@]}"; do echo "完成：https://$d"; done
