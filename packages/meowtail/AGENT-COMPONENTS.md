# Agent 展示组件与组合

Meowtail 是组件库，不是 Agent 执行框架。工具调用、委派、消息、权限、网络、持久化与真实执行事实由宿主提供；组件把这些事实组织成可读、可操作的界面。用户口中的 meowface 对应本仓库的 `meowtail`，不另设包名。

这轮集中补齐两个高频接合处：扩展既有 `ChatToolCall` 的状态、惰性输入输出和恢复意图；新增 `ChatTask`，把执行、公开答复和有依据的进度分别呈现。消息、活动、问题、附件、来源、代码与输入框继续使用已有组件。没有引入 Agent 专属布局语言、OpenUI runtime、流式协议或另一套设计尺度。

## 能力矩阵

“已有”表示当前仓库已有实现，不表示本轮重做；“补齐”表示本轮新增或扩展；“宿主/后续”说明当前有限边界。

| 生命周期 / 阅读任务                | 已有能力                                                                                | 本轮补齐                                                              | 宿主 / 后续边界                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 消息角色、作者、时间、流式文本     | `ChatMessage`、`ChatMessageList`、`ChatConversation`、`AssistantView`；稳定 id 更新消息 | Assistant 默认 part 接入工具与任务                                    | 宿主归一化事件并更新数据；不解析服务端流式协议                             |
| Markdown 与代码                    | Assistant 的 `text` 默认安全 Markdown，`code` 复用 `CodeBlock`；未知语言保留纯文本      | 工具输入输出单独按原始文本展示                                        | 工具字符串不作为 Markdown 或 HTML 执行；不执行代码                         |
| 公开执行摘要                       | `ChatProcess`、`ProcessGroup/ProcessStep`、Assistant 的 process/activity                | `ChatTask` 的 description、executionText                              | 展示可公开的活动事实；不要求或假定暴露模型私有推理                         |
| 工具调用状态                       | `ChatToolCall`、`ChatStatus`、`StatusDot`                                               | queued/running/waiting/success/error/cancelled/unknown；complete 兼容 | 状态来自宿主，不从输出存在、超时或未回复推断成功/失败                      |
| 输入、输出与长结果                 | `ReadBlock`、`TerminalBlock`、`JsonBlock/JsonTree` 等；内部复用 OutputBlock             | `ChatToolCall` 的 reactive input/output/outputSummary、折叠及完整复制 | `maxLines` 是显示窗口，不是数据截断；流式 chunk 合并由宿主负责             |
| 多模态工具结果                     | `ChatAttachments`、`ImagePreview/ImageLightbox`、媒体与资源组件                         | 工具 children 保留普通组合出口                                        | 宿主给替代说明、来源和受支持资源；不猜测任意二进制格式                     |
| 委派、嵌套与并发任务               | Assistant activity/work、`WorkCard`、通用布局与过程分组                                 | `ChatTask` 及 Assistant 的 task part                                  | 用 children 与 `ChatProcess` 组合树；没有任务调度器或通用树协议            |
| 执行完成与答复送达                 | AssistantWork 已分别接 executionText/replyText                                          | `ChatTask` 与 task part 同样明确分开                                  | success 可以同时显示“公开答复未收到”，不会改成 error                       |
| plan / todo / 进度                 | 原生 ol/li、`ProcessGroup/ProcessStep`、Assistant steps                                 | `ChatTask` 的有标签原生 progress                                      | 数值须有真实依据；未知时省略，不编造百分比或倒计时；计划编辑器留宿主       |
| 等待用户、选项与授权显示           | `ChatQuestion`、`ChoiceGroup`、Assistant questions；必要时 `RiskConfirmation`           | 与 waiting task 组合示范                                              | UI 不定义授权政策；问题未回答、答复提交中与执行失败分别建模                |
| error / retry / cancel / interrupt | `Button variant="stop"`、反馈、Assistant readState 与恢复草稿                           | 工具 onRetry/onCancel 意图及禁用状态；Assistant onToolAction          | 回调不自动重试或停止任务；取消、打断、重试资格与并发冲突由宿主决定         |
| 引用来源                           | `ChatSources`、安全 Markdown 链接、`ResourceLink`                                       | 组合示例中明确来源与产物归属                                          | 来源由宿主查证；工具与任务不自动搜索或生成引用                             |
| 附件、文件产物、代码 diff          | `ChatAttachments`、`ResourceLink`、`DiffBlock`、`CodeBlock`                             | 与任务 footer / Assistant 局部 slot 组合                              | 不上传、不应用补丁；受保护资源地址与下载授权留宿主                         |
| timing / usage 等元数据            | `DescriptionList/DescriptionItem`、`Inline`、标签                                       | 复用示范，不增加一套 Agent 元数据 API                                 | 数字与时间由宿主提供，未知值不显示为零；不做计费或用量计算                 |
| composer、附件、发送与停止         | `ChatComposer`、完整 Assistant draft/attachments/model/trailing；提交接受与草稿消费分离 | 继续复用；工具取消按钮独立于发送状态                                  | 流式响应不自动等于发送 pending；停止按钮由宿主放入 trailing 并绑定明确意图 |
| 空态、初次加载、刷新失败           | Assistant readState 的 loading/ready/error、EmptyState                                  | 工具空字符串与缺失结果分开，Task 默认 unknown                         | refresh error 保留已读正文；没有数据不暗示执行失败                         |
| 连接中断、陈旧数据                 | Assistant readFeedback/work feedback、显式状态文字                                      | 示例使用 unknown + 最后已知输出                                       | 保留上次结果并明确“当前状态未知”；重连与 stale 时间策略由宿主提供          |
| 键盘、焦点与窄容器                 | 原生按钮/details、共享布局、Assistant 阅读锚点与窄容器活动对话框                        | 新组合覆盖更新时保留展开、长 I/O、320px 局部宽度与嵌套任务            | 不设全局快捷键；reduced motion 沿共享主题；实际验证范围见当次回执          |

## 工具调用：数据与执行动作分开

```tsx
import { h, signal } from "meowjsx";
import { ChatToolCall, type ChatExecutionState } from "meowtail/chat";

const state = signal<ChatExecutionState>("queued");
const output = signal<string | undefined>(undefined);

const view = (
  <ChatToolCall
    label="读取文件"
    summary="docs/layout.md"
    state={state}
    input={'{"path":"docs/layout.md"}'}
    output={output}
    outputSummary="宿主提供的简短结果"
    maxLines={8}
    collapsible
    onCancel={() => hostRequestCancel()}
  />
);
```

`label` 表示动作，`summary` 是折起时仍可见的简短目标，`statusLabel` 补充具体进展或等待对象。输入输出标题、空内容与 retry/cancel 文字可用 `labels` 局部覆盖。`input/output` 为 `undefined` 时省略该区，空字符串则明确显示空数据；在排队或运行中，缺失输出都不表示错误。`outputSummary` 是宿主给出的展开正文摘要，只在工具 body 展开时可见；折起时需要保留的内容放在 `summary`。组件不删减、推理或改写工具结果。

`maxLines` 默认沿内部共享的 `OutputBlock`（不新增公共导出）；超出时保留开头和结尾，中间用原生 disclosure 展开，复制使用完整原始 payload。文字 I/O 默认换行，代码、终端等专门结构继续用相应组件。工具总 disclosure 与输出中间行 disclosure 分别保留自己的展开状态。

`onRetry`、`onCancel` 只表示用户意图。组件不擅自将 error 改成 running，不自动吞掉既有结果，也不因回调返回就宣称任务成功。Assistant part 的 `canRetry/canCancel` 仅决定入口显隐，不授予执行权限；宿主仍须校验资格。宿主可通过 reactive `retryDisabled/cancelDisabled` 防止重复操作，并明确更新状态。`onActivate` 选择宿主导航动作时，工具行不会同时切换内部 disclosure；不要将整行按钮包在另一个可点击卡片里。

为兼容已有调用，单独使用 `ChatToolCall` 省略 state 仍沿 `complete`；新调用建议显式传事实，不知道时用 `unknown`。Assistant 的 tool part 省略 state 使用 unknown，避免缺失事实变成完成。`complete` 与 success 都是执行完成的拼写，不表示公开答复已送达。

## 任务：执行、推进与等待分别可见

```tsx
import { h } from "meowjsx";
import { ChatTask, ChatToolCall } from "meowtail/chat";
import { Button, Inline } from "meowtail";

const view = (
  <ChatTask
    title="独立键盘审查"
    state="success"
    statusLabel="执行成功 · 等待公开答复"
    executionText="执行已返回，5 项检查完成。"
    replyText="公开答复尚未收到。"
    progress={{ value: 5, max: 5, label: "已检查 5 / 5 项" }}
    footer={
      <Inline>
        <Button variant="outline">查看审查记录</Button>
      </Inline>
    }
  >
    <ChatToolCall label="检查焦点顺序" state="success" summary="5 个交互入口" />
  </ChatTask>
);
```

`ChatTask` 是带状态和可选内容的语义 section，默认 state 为 unknown，不是执行容器或整卡按钮。`title/state/statusLabel/description/executionText/replyText/progress` 均可由 Signal 更新。`progress` 只接有限有效的数值，要求 `0 <= value <= max` 且 `max > 0`，否则明确抛出错误；未提供时不显示进度条。

waiting 应说明“等谁、等什么”：等待用户选项、等待调度和等待外部结果是不同事实。queued 代表尚未开始；running 应有当前活动事实；unknown 适合连接中断后无法确认的状态。无结果、无新消息和无公开答复都不是自动失败条件。

## 组合规则

- 同一工作区使用 `Stack`、`Inline`、`Grid`、`LayoutItem`。并行任务可用 `Grid columns="auto" minColumnWidth="wide"` 随宿主宽度排列；固定列数则保持明确列数，不偷偷变成移动端模板。
- 父布局分配组间 gap；Task 拥有自身 header/body/footer 的内部节奏；工具拥有自己的展开缩进。Task body 默认用一次低对比起始边线与 `spaceSection` 缩进标明内容归属，子任务 footer 留在该边界内，父任务 footer 回到父级轴线，避免相邻动作混淆。普通任务不额外套 Card，工具组不重复添加一圈 panel padding。嵌套任务通过 `ChatProcess` 折叠低频记录，避免每层都展开成长墙。
- 默认收起低频原始结果，保留动作、目标、状态与简短结果。只展开当前需要阅读的一两个工具；折叠不能藏起失败、等待对象或当前活动状态。长输出的显示窗口与完整复制共用同一份数据。
- footer 放普通 `Button`、`ResourceLink`、`Inline`；正文不靠空格或 `space-between` 对齐动作。工具 retry/cancel 动作位于展开 body；放进可折叠内容的 footer 也随祖先折起而隐藏。需要始终可达的全局 Stop / interrupt 应置于折叠区外的普通操作组或 Assistant `headerActions/composerTrailing`，不要藏在任务详情中。不同长度任务保持自然高度，若宿主需要等高卡片，应由宿主明确分配空间，不用占位文本伪造内容。
- 公开 plan 使用原生 ol/li 或过程组件。Task 可以包含子 Task，但树的 id、排序、父子关系与权限仍由宿主决定；不要把任务标题当程序路径执行。
- 可见状态始终有文字，状态点只是装饰。原生 details、button、progress 保留键盘语义；更新状态不主动移动用户焦点。大段输出可在自身区域用键盘阅读。
- 工具输入输出是惰性字符串。不要把 payload 交给 `innerHTML`、事件属性或脚本解释器。Assistant 默认 text 的安全 Markdown 策略与工具文本策略分别成立；自定义 `renderPart` 的安全性由扩展作者继续负责。
- 文件、URL、回调名称、状态枚举及确认显示本身不授予权限。引用来源用 `ChatSources` 或安全链接，产物用 `ResourceLink` / `ChatAttachments`；下载、读取和授权由宿主接管。

## 完整 Assistant 与局部出口

Assistant 消息增加 `kind: "tool"` 和 `kind: "task"` 的 typed parts。工具 part 提供 label/summary/state/input/output/outputSummary/maxLines/defaultOpen、动作入口显隐与禁用字段；`onToolAction(messageId, partId, "retry" | "cancel")` 交由宿主处理。Task part 提供标题、独立执行/答复文字、进度与可选 steps。数组按相同稳定 id 不可变更新；相同 id/kind 保留默认组件实例和原生展开状态，改变 kind 则重建该 part。`defaultOpen` 表示初始化展开，不是每次消息更新的强制控制。

超出默认 part 的局部内容继续使用 `renderPart`；不要为一种产物替换整页 Assistant。完整 Assistant 的草稿、附件接纳、发送快照、活动详情、问题与阅读锚点沿[既有合同](ASSISTANT.md)。本轮同步为已有 `AssistantView` JSON catalog 增加有限的 tool/task 消息分支与 `onToolAction` action schema，继续渲染同一组件；没有新增独立 `ChatTask/ChatToolCall` JSON entry、递归任务树或任意对象解释能力。字段支持集见 [JSON 合同](JSON.md)，网络协议与实际执行仍由宿主负责。

Meowbook 场景：

- `agent-workflow`：并发运行、排队、用户等待、执行成功而答复未收到；包含嵌套任务、原生计划、可选元数据、产物、附件和 diff。
- `agent-workflow-narrow`：同一组合置于宽视口中的 320px 局部宿主，检查长中英文与无空格路径。
- `agent-workflow-assistant`：默认 tool/task parts 与安全 Markdown、活动、待答问题、附件、来源和 composer 共存；按钮驱动本地输出追加、重试与取消，不执行外部请求。

本页是能力和使用边界说明，实际运行、独立审查、截图与安装态结果以当轮验证回执为准；未运行的浏览器、屏幕阅读器和真实后端适配不因这里列出能力就视为通过。
