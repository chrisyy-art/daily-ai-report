import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 示例数据，仅用于演示排版，链接均为占位地址
const reports = [
  {
    date: "2026-10-19",
    title: "全球AI资讯日报",
    summary: "示例：按「AI模型 / AI应用 / 算力与MaaS / AI硬件 / 资本与并购」五个板块组织的日报。",
    published: true,
    content: `> 本期主线（示例内容）：DeepSeek 发布 V4.1-Flash 小版本更新并开放自研搜索 API；Google 开源 Agent 评测框架 Harness。企业应用侧，多家厂商推进 Agent 落地；算力侧，云厂商继续下调推理价格。

## AI模型

**【DeepSeek 发布 V4.1-Flash-1017 并开放自研搜索 API】**（DeepSeek，10月17日｜[链接](https://example.com/source)）

- 小版本更新，同步开放 Search & Fetch API，按 **0.75 美元/千次** 计费。
- 官方称在推理、编码、Agent 与视觉基准上全面提升，任务耗时与输出长度下降。

**【Google 开源 Agent 评测框架 Harness】**（Google，10月18日｜[链接](https://example.com/source)）

- 提供统一的任务定义、沙箱执行与打分接口，可复现主流 Agent 基准。

## AI应用

**【某企业助手完成新一轮融资】**（TechCrunch，10月18日｜[链接](https://example.com/source)）

- 面向企业团队的 AI 助手，资金将用于扩展 Agent 能力。

## 算力与MaaS

**【多家云厂商下调推理 API 价格】**（示例来源，10月18日｜[链接](https://example.com/source)）

- 主流模型的输入 / 输出价格平均下调约三成。

## AI硬件

**【某厂商发布新一代端侧 AI 芯片】**（示例来源，10月19日｜[链接](https://example.com/source)）

- 面向手机与 PC 的端侧推理芯片，官方称能效较上一代提升约 40%。

## 资本与并购

**【AI 芯片公司完成 E 轮融资】**（Axios，10月19日｜[链接](https://example.com/source)）

- 资金用于规模制造与全球商业扩张，量产与客户交付仍待兑现。
`,
  },
  {
    date: "2026-10-16",
    title: "Meta 发布新模型 Muse Spark / 开源称美国最强 / Step 5 预览版上线",
    summary: "Meta 发布 Muse Spark 并宣布开源；阶跃 Step 5 预览版开放体验。",
    published: true,
    content: `> 欢迎来到每日 AI。（以下为示例内容）

**Meta 发布新模型 Muse Spark 并宣布开源** [消息来源](https://example.com/source)

:::summary
Muse Spark 是 Meta 新一代通用模型，官方称在多项公开基准上领先同尺寸开源模型。权重以宽松许可证发布，支持商用。
:::

**Step 5 预览版上线** [消息来源](https://example.com/source) [体验地址](https://example.com/try)

:::summary
Step 5 预览版重点提升了长上下文与工具调用能力，目前面向开发者开放 API 申请。
:::

## 观点

> 模型能力的差距正在缩小，真正的竞争会转向产品和分发。

本期就到这里，明天见。
`,
  },
];

async function main() {
  for (const r of reports) {
    await prisma.report.upsert({ where: { date: r.date }, update: r, create: r });
  }
  console.log(`已写入 ${reports.length} 条示例日报`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
