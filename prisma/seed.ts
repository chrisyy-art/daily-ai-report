import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 示例数据，仅用于演示排版，链接均为占位地址
const reports = [
  {
    date: "2026-10-19",
    title: "DeepSeek V4.1-Flash 更新并公开自研搜索 API / Google 开源 Harness",
    summary: "DeepSeek 发布 V4.1-Flash 小版本更新并开放 Search & Fetch API；Google 开源 Agent 评测框架 Harness。",
    published: true,
    content: `> 欢迎来到每日 AI。（以下为示例内容）

**DeepSeek 发布并上线 DeepSeek-V4.1-Flash-1017**，作为 V4.1-Flash 的小版本更新，同步开放 Search & Fetch API（DeepSeek 自研搜索 API）[消息来源](https://example.com/source) [体验地址](https://example.com/try)

:::summary
DeepSeek V4.1 Flash 1017 通过基于自反馈的强化学习（RL）训练技术，提升了在游戏开发、3D 建模等完整项目的能力。模型沿用 deepseek-flash 模型名，官网、App 与 API 已切换；官方称在推理、编码、Agent 与视觉基准上全面提升，任务耗时与输出长度下降，形成性能-成本帕累托改进。Search/Fetch 通过服务端工具调用，按 **0.75 美元/千次** 计费。
:::

**Google 开源 Agent 评测框架 Harness** [消息来源](https://example.com/source)

:::summary
Harness 提供统一的任务定义、沙箱执行与打分接口，可复现主流 Agent 基准，并支持自定义工具与多轮交互评测。
:::

## 简讯

- 某开源社区发布新一代多模态数据集，覆盖 **40+** 语言
- 多家云厂商宣布下调推理 API 价格
- 详见各条目的原文链接
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
