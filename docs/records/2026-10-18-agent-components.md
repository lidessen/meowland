# Agent 组件：本地实现与验收回执

本轮用户口中的 meowface 对应实际包 `meowtail`，没有重命名。实现扩展既有 `ChatToolCall`，新增 `ChatTask`，并接入完整 `AssistantView` 的 tool/task parts 与有限 JSON catalog。完整的已有、补齐及宿主/后续能力矩阵见 [Agent 组件说明](../../packages/meowtail/AGENT-COMPONENTS.md)。

**活动展示尚未获用户认可。** 用户最新反馈仍不满意现有 Assistant 的“进行中活动”；父线程将另行安排独立研究和多个原型。本轮没有新增 `AgentActivity`，没有修改既有 activity/work/questions 的设计，也不把当前活动 UI 锁定为认可方案。本文截图只记录已验收的组件行为和当前组合。

## 本轮范围

- 工具调用展示 queued/running/waiting/success/error/cancelled/unknown，保留旧 complete 拼写；输入、输出、结果摘要独立，缺失结果与空字符串分开。长结果复用内部 `OutputBlock` 的原生折叠与完整复制，工具数据始终为惰性文本。
- `ChatTask` 分别显示目标、执行状态、公开答复事实和有依据的原生 progress；嵌套正文与 footer 动作归属明确。执行成功但尚未收到公开答复不会变成失败。
- Assistant 同源复用组件，`onToolAction(messageId, partId, "retry" | "cancel")` 只通知宿主。有限 JSON 只接受已声明的数据与 action 参数，不引入任意执行能力、任务调度器、OpenUI runtime 或流式协议。
- 继续复用消息、Markdown/代码、过程、问题、附件、来源、资源链接、diff、composer 和公共布局；没有为全面性另造几十个组件。

共享实现、独立设计质疑与源码参考遵循本仓库开发约定。OpenUI 参考固定在 commit `8d9c4c3b108a7b5352192a6a9d7327bdf7ea19b5`：阅读 [DefaultToolCard](https://github.com/thesysdev/openui/blob/8d9c4c3b108a7b5352192a6a9d7327bdf7ea19b5/packages/react-ui/src/components/ToolCall/DefaultToolCard.tsx)、[CompositeCardBlock](https://github.com/thesysdev/openui/blob/8d9c4c3b108a7b5352192a6a9d7327bdf7ea19b5/packages/react-ui/src/components/CompositeCardBlock/CompositeCardBlock.tsx)、共享 [CardBlockLayout](https://github.com/thesysdev/openui/blob/8d9c4c3b108a7b5352192a6a9d7327bdf7ea19b5/packages/react-ui/src/components/_shared/cards/CardBlockLayout.tsx) 与 [Stack](https://github.com/thesysdev/openui/blob/8d9c4c3b108a7b5352192a6a9d7327bdf7ea19b5/packages/react-ui/src/genui-lib/Stack/index.tsx) 的具体实现，借鉴语义分区、阅读轴、footer 基线和 padding 归属；没有接入 DSL/parser，也没有复制代码。独立审查证据保存在 `artifacts/agent-independent-review/review.md`。

## 两轮实质闭环

第一轮盘点并行覆盖组件/API、交互与可访问性、真实组合、Assistant/JSON 接合和文档。压力场景复现了窄工具行文字挤成细列、隐藏摘要参与显示、嵌套任务 footer 归属不清，以及 Task 在等高 Grid 中隐式行被拉伸产生大块空白；修复后用实际故事、嵌套动作和状态切换复核。

第二轮在正式 Meowbook 场景及实际 tgz 包外消费者复验。约 936px 工具行的超长路径仍挤压短标签与“已取消”状态，改为摘要 `flex-basis: 0` 优先省略自身，最终标签和状态各为一行。旧粗指针测试把多行 header 的整体中心当作图标中心，现改为首行 line box，同时保留操作高度、图标/箭头精确对齐和后续文字无重叠检查；独立审查确认没有放宽容差。另修正 `files` 白名单，确保公开文档链接的 `AGENT-COMPONENTS.md` 实际进入 tgz。

## 同版验证

最终第五次统一 build 之后，生产源码冻结，再进行下列检查：

| 检查       | 结果与范围                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 工程       | 五包 build、根 typecheck、完整 Meowtail tsc、fmt、lint、diff 检查通过；fmt/lint 排除未知 `data/`                                                                              |
| 单测       | Meowtail 342 项通过，71 个文件，2136 个断言；日志 `artifacts/agent-components-final/unit.log`                                                                                 |
| 浏览器     | 最终相关 chat、content views、read highlight 合计 42 项通过，15.9s；日志 `artifacts/agent-components-final/browser-final.log`                                                 |
| Meowbook   | 118 个故事检查通过；真实组合覆盖宽、窄、短窗口、明暗主题、并发和嵌套任务                                                                                                      |
| 安装态     | 新三包 tgz 在仓库外空 `/tmp` 目录离线安装；无源码 alias、父 node_modules 或逃逸 symlink；严格正负类型与无 DOM JSX/CSS core 通过                                               |
| 安装态行为 | root/chat 导出身份、JSX/JSON 宿主意图一致性、动态输出、缺失/空结果、展开与焦点保留、复制最新完整数据、原生进度、成功但待回复均通过；1280×960、390×844、900×480 原图已实际审查 |

最终安装态回执：`artifacts/agent-components-final-consumer-a25q6rfl/receipt.json`；消费者 `/tmp/meowland-agent-consumer-ydiBzV`。current dist、staging dist 和 installed dist 三包全文件 SHA256 一致，浏览器检查后再次核对。`meowtail` tgz SHA256 为 `3a45177bb74ca5682817f4eebd0c886c0df19cce2aaecd7a22bbb5ca30924023`；其余两包身份及完整命令见回执。前版反例 tgz 与截图保留在 `artifacts/agent-components-consumer-3xtqvyn3`，没有覆盖旧包。

## 截图与后续原型入口

| 截图                                 | Library 完整 ID                            |
| ------------------------------------ | ------------------------------------------ |
| 宽屏并发工作流                       | `libfile_314e151029c48191aef4bcabed95cc80` |
| Assistant 当前组合概览（非认可方案） | `libfile_9b25d9b1d6bc8191adc7702ee2573c87` |
| 窄屏工作流                           | `libfile_9b7418e0f7d48191a10fc9e9bacd3463` |

原图位于 `artifacts/agent-components-final/` 的 `agent-workflow-1440x1000-light.png`、`assistant-overview-light.png`、`agent-workflow-narrow-390x844-light.png`；上传回执在相邻 `library-upload.json`，文件身份 xattrs 已写入。

后续活动原型可复用 `ChatToolCall`、`ChatTask`、`ChatExecutionState`，以及 `packages/meowtail/stories/agent-workflow.stories.tsx` 导出的 `agentWorkflowDemo`、`agentAssistantDemo`。当前故事 id 为 `agent-workflow`、`agent-workflow-narrow`、`agent-workflow-assistant`；这些是可运行组合参考，不代表用户接受现有活动设计。

## 验证边界

浏览器为 Chrome/Chromium，没有真实辅助技术或屏幕阅读器会话，也未验 Firefox/WebKit。安装态剪贴板与宿主动作是局部模拟；源码浏览器另测原生复制。没有真实后端、工具执行、网络、权限策略、上传或持久化验收。未修改 Rossovia、Panda、未知 `data/`、依赖、锁文件或版本；只做本地提交，未推送、发布 npm 或部署。自建服务均已关闭，本轮未操作原用户预览端口 `13012`、`13014`；末次只读 lsof 未发现上述端口或本轮临时端口监听，不据此声称用户预览仍在运行。
