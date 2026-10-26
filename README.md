# 每日 AI · 日报站

基于 Next.js 14（App Router）、Prisma 和 Tailwind CSS 的 AI 日报站，包含：

- **对客阅读端**（`/`、`/report/YYYY-MM-DD`）：不用登录，默认打开最新一篇
- **管理后台**（`/admin`）：密码登录；左边写 Markdown，右边实时预览；支持存草稿和发布

## 本地启动

需要 Node.js 18.17 或更高版本。

```bash
npm install        # 安装依赖（会自动执行 prisma generate）
npm run setup      # 一键初始化：生成 .env、创建 SQLite 数据库、写入 2 条示例日报
npm run dev        # http://localhost:3000
```

`npm run setup` 只需在第一次运行；它等价于手动执行
`cp .env.example .env && npm run db:push && npm run db:seed`。

> 如果打开页面报 `Environment variable not found: DATABASE_URL`，说明缺少 `.env` 文件，运行 `npm run setup` 即可。

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

## 板块与新闻条目（前台 Tab 展示）

正文按下面的结构书写，前台会自动显示为「导语 + 板块 Tab + 新闻卡片」：

```markdown
> 本期主线：……（第一个板块之前的内容都算导语，显示在标题下方）

## AI模型

**【某公司发布新模型】**（来源，10月20日｜[链接](https://...)）

- 要点一
- 要点二

**【另一条新闻】**（来源，10月20日｜[链接](https://...)）

- 要点

## AI应用
……
```

- 第一个标签「汇总」是当天新闻总览（默认打开）：全部新闻按板块分组、序号连续，每组可点「只看本板块」跳到对应标签。
- 其后固定显示 5 个板块 Tab：AI模型、AI应用、算力与MaaS、AI硬件、资本与并购（在 `src/lib/site.ts` 的 `SECTION_TABS` 中修改）。
- 每个 `## 标题` 是一个板块，按名称放进对应的 Tab（忽略「一、」等序号，名称包含也算；也会识别别名，如「投融资」「收购」归入资本与并购，「芯片」归入 AI硬件）。名称对不上的板块按顺序放进空着的 Tab，空 Tab 用完后并入最后一个，内容不会丢失。
- 板块里以「【」开头的段落（加粗也可以）或 `### 标题` 开始一条新闻，每条显示为一张卡片。
- 编辑器工具栏的「板块」「条目」按钮可以快速插入这两种格式。导入 HTML 时，字号较大的小节标题会自动识别为板块。

## 从文档导入内容

后台编辑器支持两种方式把已有文档搬进来，链接、加粗、标题、列表、表格都会保留：

- **直接粘贴**：从语雀、飞书、Word、Google Docs、网页复制内容后，粘贴到正文框，会自动转换为 Markdown。
  - 编辑器上的「粘贴保留格式」开关可以关闭这个功能；想临时粘贴纯文本，用 `Cmd/Ctrl + Shift + V`。
- **导入文档**：点「导入文档」按钮，支持 `.docx`、`.md`、`.txt`、`.html`。
  - 标题为空时，会用文档开头的一级或二级标题自动填充。
  - 正文已有内容时，会询问是替换正文，还是插入到光标位置。
  - 旧版 `.doc` 需要先在 Word 里另存为 `.docx`。
  - 导入 `.html` 时会先在隐藏的沙箱里渲染页面（不执行其中的脚本），因此用 CSS 类设置的加粗、大字号小标题也能识别；导航栏、页脚、按钮、隐藏元素会自动去掉；GBK 等非 UTF-8 编码的文件会自动识别。
  - 文档中的图片暂不导入（站点还没有图片存储），导入后会提示跳过了几张。

## 前台主题

前台有三套版式，**不向读者提供切换按钮**，全站统一显示一套（默认 P）：

| 风格 | 说明 |
|---|---|
| **P（默认）** | 按「每日AI · P-Max」设计稿：暖白底、橙红强调色、IBM Plex Mono 等宽字；顶部方格横幅随鼠标亮起；往期直接放在底色上，新闻列表为一张白卡；不显示自己的顶栏，便于嵌入 P-Max |
| 浅色 | 浅灰蓝底 + 白色卡片 + 顶栏 |
| 深色 | 参考钉钉开发者平台：近黑底、卡片蓝色光晕 |

- **更换全站版式**：在服务器 `.env` 中加一行 `READER_THEME=light`（或 `dark`、`p`），然后执行 `pm2 restart daily-ai`。
- **临时预览其他版式**：在网址后加 `?theme=light` 或 `?theme=dark`，例如 `https://你的域名/?theme=dark`，只影响当前页面。
- 横幅文字在 `src/components/public/ReaderView.tsx` 的 `Banner` 中修改。
- 三套风格共用同一套页面结构，颜色变量分别定义在 `src/app/globals.css` 的 `:root`（浅色）、`.reader[data-theme="dark"]`、`.reader[data-theme="p"]` 中。
- 后台始终为浅色。

## 新闻配图

导入的 HTML 里，每条新闻自带的配图会一起导入，前台显示在新闻右侧（手机上在文字下方），点击打开原图。

- 内嵌（base64）图片导入时自动上传到服务器的 `uploads/` 目录（可用 `UPLOAD_DIR` 修改），每天随数据库一起备份到 `backups/uploads/`。
- 正文里的写法：在一条新闻内单独一段写 `![说明](图片地址)`，要点开原图就再包一层链接 `[![说明](图片地址)](原图地址)`；Logo、带文字的图不想被裁切，写成 `![说明](图片地址 "contain")`。
- 一条新闻只有第一张单独成段的图片显示在右侧。

## 阅读统计

后台「日报管理」页顶部显示今日阅读、今日新访客、累计阅读、累计访客，每篇已发布日报下方显示累计「N 人阅读」。统计全部去重，重复访问不会重复记录：

- **阅读**：同一访客读同一篇日报只算 1 次，之后再打开、刷新都不计入；按首次阅读的日期计入「今日」。
- **访客**：同一访客只算 1 次，按首次来访的日期计入「今日新访客」。用浏览器里的匿名随机 ID 区分，不记录 IP 等个人信息。换设备、换浏览器或清除 cookie 会被当作新访客。
- **不计入**：已登录的管理员浏览前台、搜索引擎爬虫等自动访问，以及侧栏链接的预加载。

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

## 部署上线

- **读者在国内**：部署到国内云服务器（阿里云 / 腾讯云），详见 **[DEPLOY.md](./DEPLOY.md)**。数据库继续用 SQLite，有一键部署脚本。
- **读者能访问海外网站**：也可以部署到 Vercel，见下文。注意 `vercel.app` 域名在国内经常打不开。

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
