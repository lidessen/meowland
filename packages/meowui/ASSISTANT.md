# 完整 Assistant 组合

状态：新增组合已实现，作者的局部行为回归与独立源码／页面验收进行中；第一阶段五包 tarball 不含本页新能力，不能用其安装通过代替本组合验收。当前尚未正式发布，也未切换 Rossovia 的消费。

`meowui/chat` 的 `AssistantView` 提供消息、安全 Markdown、代码、过程、输入框、附件、模型与思考选项、当前活动、后台工作详情及待答问题。默认结构和视觉都在库中；Meowbook 的 `assistant-complete` 场景只提供本地数据和动作。

```tsx
import { h, signal } from "meowjsx";
import { AssistantView, type AssistantDraft, type AssistantMessage } from "meowui/chat";

const messages = signal<readonly AssistantMessage[]>([]);
const draft = signal<AssistantDraft>({ text: "", attachments: [] });

const view = (
  <AssistantView
    messages={messages}
    draft={draft}
    onDraftChange={(next) => {
      draft.value = next;
    }}
    onSubmit={async (snapshot) => {
      const accepted = await hostSend(snapshot);
      return { accepted };
    }}
  />
);
```

组件由父容器取得受约束高度；标准安装仍需 `createMeowUI` 与 `standardTheme.cssText`，不依赖 Rossovia 的 CSS 或 controller。消息和 composer 使用同一阅读列，回最新只锚定消息区域。活动在宽容器旁显，在窄容器变为同一个原生模态对话框，不重挂消息和草稿。

## 数据与动作的归属

- 传 `draft` 时，宿主是唯一 owner，必须给 `onDraftChange` 或显式 `readOnly`。组件不直接写传入 Signal；不传 `draft` 时，`defaultDraft` 初始化组件自己的临时草稿。宿主拥有持久化。
- `onSubmit` 必须显式返回 `{accepted: true}` 才消费已提交快照。等待时允许继续编辑；没有新编辑的文本可清空，原快照中的附件单独消费，后来添加或替换的附件保留。拒绝和异常保留草稿并显示反馈。该接纳只代表宿主接纳消息，不代表 Agent 已处理或任务完成。
- 默认选文件只在本地保留 `File` 和预览 URL，不上传、不执行、不持久化。宿主提供 `onAttach` 时可返回归一化附件；也可以直接更新受控草稿并返回空值。不要在同一回调中既追加草稿又返回相同附件。预览 URL 由组件卸载时释放；持久消息附件应由宿主换成自己的资源地址。
- 只支持已有序列化附件的宿主可设 `allowAttachments={false}`，不呈现本地文件选择入口；已有附件仍可显示、移除和随消息提交。JSON catalog 的首片使用这一明确边界，不把 File 混入 JSON 草稿。
- `messages`、`activity`、`work`、`questions`、模型与思考选项支持 `MaybeSignal`。用不可变数组更新驱动视图。同一消息和 part 的稳定 `id` 保留其节点；改变 part 的 `kind` 会重建该 part。
- 工作的 `statusText`、`executionText`、`replyText` 都由宿主提供；UI 不将 pending 解释成 running，不把 returned 当目标完成，也不从执行结果推断公开答复已发布。状态点只辅助对应文字。
- 问题状态由宿主的 `open/submitting/answered/unavailable` 事实决定。`onAnswer` 返回不自动把问题标为 answered；异常保留局部答案。`onDismissQuestion` 只通知宿主，没有隐式业务关闭或重试。
- `readState="error"` 保留已给消息并显示失败；`loading`、真实空消息与刷新失败分别呈现。工作详情 `error` 保留正文；`unavailable` 隐去正文。授权与数据撤回仍是宿主职责。

## 内容与局部定制

消息 `parts` 包含 `text`、`code`、`process` 和 `attachments`。`text` 默认安全 Markdown：原始 HTML 与图片作为文字，只有明确的 HTTP、HTTPS、mailto 链接可导航；代码 part 使用共享 `CodeBlock`。过程使用原生 disclosure，过程步骤只接归一化的标题、说明、状态文字与视觉 tone。

`renderPart` 可只替换一个 part，返回 `undefined` 使用默认实现；`renderWorkDetail` 只替换详情正文。`composerTrailing` 和 `headerActions` 放局部控件，无需替换整页。自定义组件仍在原渲染树中消费祖先 Context，不另建 renderer root。

新增默认文案集中在 `assistantCopy`；宿主可用 `labels={{ latest: "回到最新", send: "发送" }}` 覆盖局部文字，不需要另装国际化运行时。数据中的标题、状态与说明仍由宿主提供。

宿主传历史消息时直接前插 `messages`，组件保留可见消息锚点；向上阅读时追加与流式更新不强制跳到底。`onLoadOlder` 只请求宿主加载，UI 不拥有分页、网络或记录权限。列表使用同一 MeowJSX keyed 机制；删除项释放其组件生命周期。

模型选择、文件、路径、URL、回调名字及 UI 状态都不授予后端权限。连接、上传、执行、停止、发布、授权与恢复由应用 adapter 接入；这里没有 Agent 执行框架。
