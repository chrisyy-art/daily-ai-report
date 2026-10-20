#!/usr/bin/env bash
# 为已备案、已解析到本服务器的域名申请免费 HTTPS 证书（Let's Encrypt，自动续期）
#   bash deploy/enable-https.sh daily.example.com you@example.com
set -euo pipefail

DOMAIN="${1:?用法：bash deploy/enable-https.sh 域名 邮箱}"
EMAIL="${2:?用法：bash deploy/enable-https.sh 域名 邮箱}"

apt-get install -y certbot python3-certbot-nginx
sed -i "s/server_name .*;/server_name ${DOMAIN};/" /etc/nginx/sites-available/daily-ai
nginx -t && systemctl reload nginx
certbot --nginx -d "$DOMAIN" -m "$EMAIL" --agree-tos --redirect --non-interactive
echo "完成：https://${DOMAIN}"
