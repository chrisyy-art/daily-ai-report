#!/usr/bin/env bash
# 网站打不开时的一键诊断：在服务器上以 root 运行
#   bash deploy/doctor.sh
# 逐项检查网站程序、Nginx、域名解析、HTTPS 证书，并给出处理建议。
set -uo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NGINX_CONF=/etc/nginx/sites-available/daily-ai
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; FAILED=1; }
hint() { printf '    → %s\n' "$1"; }
FAILED=0

echo "== 1. 网站程序（pm2）"
if command -v pm2 >/dev/null && pm2 jlist 2>/dev/null | grep -q '"name":"daily-ai"'; then
  status=$(pm2 jlist | python3 -c 'import sys,json; print(next(p["pm2_env"]["status"] for p in json.load(sys.stdin) if p["name"]=="daily-ai"))' 2>/dev/null)
  [[ "$status" == "online" ]] && ok "daily-ai 正在运行" || { bad "daily-ai 状态：$status"; hint "执行 pm2 restart daily-ai；仍失败请执行 pm2 logs daily-ai --lines 50 并截图"; }
else
  bad "没找到 daily-ai 进程"
  hint "确认已执行 sudo -i 切换到 root；然后执行 cd $APP_DIR && pm2 start ecosystem.config.cjs && pm2 save"
fi

code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 http://127.0.0.1:3000/) || code=000
[[ "$code" == "200" ]] && ok "程序本机访问正常（HTTP $code）" || { bad "程序本机访问失败（HTTP $code）"; hint "执行 pm2 logs daily-ai --lines 50 查看错误"; }

echo "== 2. Nginx"
if systemctl is-active --quiet nginx 2>/dev/null || pgrep -x nginx >/dev/null; then ok "Nginx 正在运行"; else bad "Nginx 没有运行"; hint "执行 systemctl restart nginx"; fi
nginx -t >/dev/null 2>&1 && ok "Nginx 配置无误" || { bad "Nginx 配置有错误"; hint "执行 nginx -t 查看具体报错"; }

DOMAINS=$(grep -m1 -oP 'server_name\s+\K[^;]+' "$NGINX_CONF" 2>/dev/null | tr -s ' ')
public_ip=$(curl -fsS --max-time 5 https://ipinfo.io/ip 2>/dev/null || true)
echo "  公网 IP：${public_ip:-（获取失败）}    已配置的域名：${DOMAINS:-（无，只能用 IP 访问）}"

echo "== 3. 域名解析"
if [[ -z "${DOMAINS// /}" || "$DOMAINS" == "_" ]]; then
  echo "  （未配置域名，跳过）"
else
  for d in $DOMAINS; do
    resolved=$(getent ahostsv4 "$d" | awk 'NR==1 {print $1}')
    if [[ -z "$resolved" ]]; then
      bad "$d 解析不到 IP"
      hint "到阿里云「域名控制台」确认：①实名认证已通过（状态为「正常」）②已添加 A 记录指向 ${public_ip:-服务器公网 IP}"
    elif [[ -n "$public_ip" && "$resolved" != "$public_ip" ]]; then
      bad "$d 解析到 $resolved，与本机公网 IP $public_ip 不一致"; hint "修改 A 记录的记录值为 $public_ip"
    else
      ok "$d → $resolved"
    fi
  done
fi

echo "== 4. HTTPS 证书"
if [[ -z "${DOMAINS// /}" || "$DOMAINS" == "_" ]]; then
  echo "  （未配置域名，跳过）"
else
  for d in $DOMAINS; do
    cert="/etc/letsencrypt/live/$d/fullchain.pem"
    [[ -f "$cert" ]] || cert=$(ls -d /etc/letsencrypt/live/*/fullchain.pem 2>/dev/null | head -1)
    if [[ -n "$cert" && -f "$cert" ]] && openssl x509 -in "$cert" -noout -text 2>/dev/null | grep -q "DNS:$d"; then
      end=$(openssl x509 -in "$cert" -noout -enddate | cut -d= -f2)
      if openssl x509 -in "$cert" -noout -checkend 0 >/dev/null; then ok "$d 证书有效，到期：$end（会自动续期）"; else bad "$d 证书已过期（$end）"; hint "执行 certbot renew"; fi
      code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 --resolve "$d:443:127.0.0.1" "https://$d/") || code=000
      [[ "$code" == "200" ]] && ok "https://$d 本机访问正常" || { bad "https://$d 本机访问失败（HTTP $code）"; }
    else
      bad "$d 还没有 HTTPS 证书"
      hint "域名解析正常后执行：bash deploy/enable-https.sh $DOMAINS 你的邮箱"
    fi
  done
fi

echo
if [[ $FAILED -eq 0 ]]; then
  echo "服务器这一侧全部正常。如果手机仍打不开，问题多半在手机所在的网络到香港服务器的线路上："
  echo "  · 换 Wi-Fi / 流量各试一次，并记下时间和报错文字"
  echo "  · 在阿里云「云监控 → 站点监控」添加对网站的监测，查看内地各运营商的访问情况"
else
  echo "发现问题，请按上面 ✗ 后的提示处理；看不懂就把这段输出截图发给我。"
fi
