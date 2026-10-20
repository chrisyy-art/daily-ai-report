# 部署到国内云服务器

本文介绍把网站部署到云服务器（以阿里云轻量应用服务器为例，腾讯云等同理），让国内读者通过网址访问。

整体架构：

```
读者浏览器 ──► Nginx（80 / 443 端口）──► Next.js（pm2 守护，仅本机 3000 端口）──► SQLite 数据库文件
```

`deploy/` 目录里的脚本会自动完成安装、构建、启动、开机自启和每日备份。你只需要买服务器，再复制粘贴几条命令。

---

## 第 0 步：先决定服务器放在哪

| | 中国内地（如杭州、北京） | 中国香港 |
|---|---|---|
| 国内访问速度 | 快 | 一般可用，高峰期偏慢 |
| 价格 | 便宜（2 核 2G 活动价几十元一年起） | 较贵（约几十元一月） |
| 备案 | **用域名对外提供网站需要 ICP 备案**，约 1~3 周 | 免备案 |
| 什么时候能用 | 买完即可用公网 IP 测试；正式用域名要等备案通过 | 买完即可正式使用 |

**建议**

- 想尽快上线：选 **香港**。
- 长期运营、读者访问量较大：选 **中国内地 + 备案**。备案期间可以先用 IP 地址内部试用。

> ⚠️ **关于备案主体**：如果网站是"数科行研中心"对外发布内容，通常应以**公司（企业）名义**备案。用个人名义备案的网站不能用于企业用途。
> 日报内容如果属于公司内部资料，放到公网前请先确认公司的数据安全规定。

价格与备案要求经常变化，请以云厂商官网为准。

---

## 第 1 步：购买服务器

在阿里云控制台购买「轻量应用服务器」：

- **地域**：按第 0 步的选择
- **镜像**：选「系统镜像」→ **Ubuntu 22.04 或 24.04**（不要选应用镜像）
- **配置**：2 核 2G 即可；1G 内存也能跑，脚本会自动加交换空间，但构建会慢一些
- **登录密码**：购买后在控制台「远程连接」或「重置密码」里设置 root 密码

然后在服务器的「**防火墙**」页面，确认已放行 **80**（HTTP）和 **443**（HTTPS）端口。22 端口用于 SSH 登录，一般默认已放行。

---

## 第 2 步：登录服务器

任选一种方式：

- **网页登录（最简单）**：控制台 → 服务器 → 「远程连接」，浏览器里直接打开命令行。
- **Mac 终端**：`ssh root@你的服务器IP`，再输入 root 密码。

---

## 第 3 步：一键部署

在服务器的命令行里**逐行**执行：

```bash
apt-get update && apt-get install -y git
git clone https://github.com/chrisyy-art/daily-ai-report.git /opt/daily-ai-report
cd /opt/daily-ai-report
bash deploy/install.sh
```

脚本运行中会提示你设置**后台管理员密码**。直接回车会随机生成一个，并显示在屏幕上，请记下来。整个过程大约 5~10 分钟，结束时会显示：

```
部署完成！
  阅读端：http://你的IP
  后台：  http://你的IP/admin
```

在浏览器打开这个地址，就能访问网站了。

**常见情况**

- **`git clone` 卡住或失败**：国内服务器访问 GitHub 不稳定，可以改为从你的 Mac 上传代码。
  1. 在 **Mac 终端**里打包并上传：
     ```bash
     cd ~/daily-ai-report
     git archive -o ~/Desktop/daily-ai.zip HEAD
     scp ~/Desktop/daily-ai.zip root@你的服务器IP:/opt/
     ```
  2. 回到**服务器**解压：
     ```bash
     apt-get install -y unzip
     unzip /opt/daily-ai.zip -d /opt/daily-ai-report
     cd /opt/daily-ai-report && bash deploy/install.sh
     ```
- **香港 / 海外服务器**：可以改用官方 npm 源，速度更快：
  ```bash
  NPM_REGISTRY=https://registry.npmjs.org bash deploy/install.sh
  ```
- **想先放 2 条示例日报看看效果**：
  ```bash
  SEED=1 bash deploy/install.sh
  ```

---

## 第 4 步（可选）：把本地写好的日报搬到服务器

日报都存在本地的数据库文件 `prisma/dev.db` 里，上传到服务器即可。

> ⚠️ 这一步会**覆盖服务器上已有的日报**，请在服务器上开始写日报之前做。

1. 在 **Mac 终端**执行：
   ```bash
   cd ~/daily-ai-report
   scp prisma/dev.db root@你的服务器IP:/opt/daily-ai-report/prisma/prod.db
   ```
2. 在**服务器**执行：
   ```bash
   pm2 restart daily-ai
   ```

---

## 第 5 步（可选）：绑定域名并开启 HTTPS

1. **买域名**：在阿里云「域名」购买（如 `daily-ai.com`），并完成实名认证。
2. **备案**：仅中国内地服务器需要。在阿里云「ICP 代备案管理系统」提交，审核约 1~20 个工作日。备案通过后：
   - 30 天内还要完成**公安联网备案**；
   - 在服务器的 `.env` 里加一行 `ICP_NUMBER="京ICP备XXXXXXXX号-1"`（换成你的备案号），然后执行 `pm2 restart daily-ai`。网站页脚会按规定显示备案号，并链接到工信部网站。
3. **解析域名**：在域名控制台添加一条 **A 记录**，主机记录填 `@`（或 `daily` 之类的子域名），记录值填服务器公网 IP。
4. **申请免费 HTTPS 证书**（自动续期）。在服务器执行：
   ```bash
   cd /opt/daily-ai-report
   bash deploy/enable-https.sh 你的域名 你的邮箱
   ```
   完成后即可通过 `https://你的域名` 访问，http 会自动跳转到 https。

---

## 日常维护

以下命令都在服务器上、进入 `/opt/daily-ai-report` 目录后执行。

| 要做的事 | 命令 |
|---|---|
| 更新到最新代码 | `bash deploy/update.sh`（会先自动备份数据库；重启期间有 1~2 秒访问不了） |
| 修改后台密码 | `nano .env`，改 `ADMIN_PASSWORD` 那一行，`Ctrl+O` 回车保存、`Ctrl+X` 退出，再执行 `pm2 restart daily-ai` |
| 查看运行状态 | `pm2 status` |
| 查看错误日志 | `pm2 logs daily-ai` |
| 手动备份数据库 | `bash deploy/backup.sh` |

如果是用上传 zip 的方式部署的，更新时需要重新上传解压一次代码，再执行 `bash deploy/update.sh`。

**备份说明**

- 每天 03:30 自动备份数据库到 `backups/` 目录，保留最近 14 份。
- 建议偶尔把备份下载到自己电脑上，在 Mac 终端执行：
  ```bash
  scp -r root@你的服务器IP:/opt/daily-ai-report/backups ~/Desktop/
  ```

**从备份恢复**

```bash
pm2 stop daily-ai
cp backups/prod-某个时间.db prisma/prod.db
pm2 start daily-ai
```

---

## 安全提醒

- 后台密码要足够复杂，不要用 `change-me`。
- `.env` 里有密码和密钥，不要发给别人，也不要上传到 GitHub（项目已配置忽略它）。
- 用 IP 地址或 http 访问时，登录信息是明文传输的。正式使用前请完成第 5 步，开启 HTTPS。
