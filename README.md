# 每日 AI · 日报站

基于 Next.js 14（App Router）、Prisma 和 Tailwind CSS 的 AI 日报站，包含：

- **对客阅读端**（`/`、`/report/YYYY-MM-DD`）：不用登录，默认打开最新一篇
- **管理后台**（`/admin`）：密码登录；左边写 Markdown，右边实时预览；支持存草稿和发布

## 本地启动

需要 Node.js 18.17 或更高版本。

```bash
npm install                 # 会自动执行 prisma generate
cp .env.example .env        # 按需修改密码等配置
npm run db:push             # 按 schema 创建 SQLite 数据库（prisma/dev.db）
npm run db:seed             # 写入 2 条示例日报
npm run dev                 # http://localhost:3000
```

- 阅读端：http://localhost:3000
- 后台：http://localhost:3000/admin（默认密码 `change-me`）

其他命令：

| 命令 | 作用 |
|---|---|
| `npm run build && npm start` | 生产模式构建并运行 |
| `npm run db:studio` | 打开 Prisma Studio，可视化查看和修改数据 |

## 环境变量

| 变量 | 说明 |
|---|---|
| `DATABASE_URL` | 数据库连接串。本地默认 `file:./dev.db` |
| `ADMIN_PASSWORD` | 后台登录密码 |
| `SESSION_SECRET` | 签名登录 cookie 的密钥，至少 16 位，推荐用 `openssl rand -hex 32` 生成 |
| `REPORT_TIMEZONE` | 可选，新建日报时"今天"按哪个时区算，默认 `Asia/Shanghai` |

### 修改管理员密码

1. 修改 `.env` 中的 `ADMIN_PASSWORD`（线上环境在 Vercel 的 Settings → Environment Variables 中修改）
2. 重启服务（线上需要重新部署）
3. 如果还想让已登录的设备全部下线，同时更换 `SESSION_SECRET`，所有旧 cookie 会立即失效

## Markdown 写作语法

除标准 Markdown（引用、加粗、链接、列表、表格等，支持 GFM）外，还有两个扩展：

```markdown
**某某公司发布新模型** [消息来源](https://...) [体验地址](https://...)

:::summary
这里是重点摘要，会渲染成带渐变边条的高亮卡片，内部可以继续用 **加粗**、链接等。
:::
```

- `:::summary … :::` 渲染为重点摘要框。`:::summary` 和结尾的 `:::` 必须各占一行
- 文字恰好为"消息来源"或"体验地址"的链接，会渲染为带 ↗ 图标的胶囊标签
- 编辑器工具栏上有对应的快捷插入按钮

## 项目结构

```
prisma/
  schema.prisma            Report 模型
  seed.ts                  示例数据
src/
  middleware.ts            拦截 /admin 和 /api/admin，校验登录 cookie
  app/
    (public)/              对客阅读端：/ 和 /report/[date]
    admin/login/           登录页
    admin/(dashboard)/     后台列表、新建、编辑（布局内会再校验一次登录）
    api/auth/*             登录、退出
    api/admin/reports/*    日报增删改查（每个接口都单独校验登录）
  components/
    shared/                ★ 前后台复用：Markdown、ReportList、ReportListItem、ReportHeader
    public/                侧栏、移动端下拉、阅读布局
    admin/                 编辑器、列表操作、登录表单
    ui/                    Logo 等基础元素
  lib/
    reports.ts             数据访问层（页面和接口都只通过这里读写数据库）
    auth.ts / session.ts   HMAC 签名的 session（Web Crypto，Edge 和 Node 通用）
    validation.ts          表单校验
    markdown/remark-summary.ts   :::summary 语法插件
```

配色统一定义在 `src/app/globals.css` 的 `:root` CSS 变量中，`tailwind.config.ts` 引用这些变量。要换主题，只需改这一处。

## 部署到 Vercel（SQLite 换成 Postgres）

Vercel 的文件系统是只读、临时的，SQLite 无法持久化写入，上线前需要换成 Postgres。Vercel 控制台的 Storage 里提供 Postgres（由 Neon 等服务商提供）。

### 1. 创建数据库

在 Vercel 项目的 **Storage** 页面创建一个 Postgres 数据库，并关联到当前项目。Vercel 会自动注入连接串环境变量。不同服务商注入的变量名不同，常见的有：

- `DATABASE_URL` / `DATABASE_URL_UNPOOLED`（Neon）
- `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING`（旧版 Vercel Postgres）

请在项目的 Settings → Environment Variables 中确认实际的变量名。

### 2. 修改 `prisma/schema.prisma`

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")            // 带连接池的地址，供应用运行时使用
  directUrl = env("DATABASE_URL_UNPOOLED")   // 直连地址，供建表和迁移使用
}
```

如果注入的是旧版变量名，就把上面两个变量分别换成 `POSTGRES_PRISMA_URL` 和 `POSTGRES_URL_NON_POOLING`。

模型本身不用改。`date` 字段本来就存成 `YYYY-MM-DD` 字符串，在两种数据库里行为一致。

### 3. 建表

推荐使用迁移文件，便于后续改表：

```bash
# 先把线上的连接串写进本地 .env（可用 `vercel env pull .env` 拉取）
rm -rf prisma/migrations          # 如果之前在 SQLite 上生成过迁移，需要先删掉
npx prisma migrate dev --name init
npm run db:seed                   # 可选：写入示例数据
```

再把 `package.json` 中的 build 脚本改为部署时自动执行迁移：

```json
"build": "prisma generate && prisma migrate deploy && next build"
```

如果不想维护迁移文件，也可以直接执行 `npx prisma db push` 同步表结构。

### 4. 配置环境变量并部署

在 Vercel 的 Settings → Environment Variables 中添加：

- `ADMIN_PASSWORD`
- `SESSION_SECRET`（务必使用新的随机值）
- `REPORT_TIMEZONE`（可选）

然后把代码推送到 Git 仓库，在 Vercel 中导入该仓库即可，构建命令使用默认的 `npm run build`。

> 提示：线上 cookie 带有 `Secure` 标记，只能通过 HTTPS 访问后台。Vercel 默认就是 HTTPS。
