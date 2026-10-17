# 有限 JSON UI catalog

`meowtail/json` 的 `createMeowUICatalog()` 注册原有 `AssistantView`、`Button`、`Input`、`Stack`，由 `meowjsx/json` 构造同一 MeowJSX VNode。它不复制 renderer、主题、组件实现或业务 store，不从 TypeScript 开放 Props 反射任意属性。

```ts
import { createJsonView, parseJsonView } from "meowjsx/json";
import { signal, type ReadableSignal } from "meowjsx";
import type { AssistantDraft, AssistantMessage } from "meowtail/chat";
import { createMeowUICatalog } from "meowtail/json";

const catalog = createMeowUICatalog();
const messages = signal<readonly AssistantMessage[]>([]);
const draft = signal<AssistantDraft>({ text: "", attachments: [] });
const view = parseJsonView(
  {
    component: "AssistantView",
    props: {
      messages: { $binding: "messages" },
      draft: { $binding: "draft" },
      onDraftChange: { $action: "draft.change" },
      onSubmit: { $action: "submit" },
    },
  },
  catalog,
);
const child = createJsonView(view, {
  catalog,
  bindings: new Map<string, ReadableSignal<unknown>>([
    ["messages", messages],
    ["draft", draft],
  ]),
  actions: new Map<string, (...args: any[]) => unknown>([
    [
      "draft.change",
      (next: AssistantDraft) => {
        draft.value = next;
      },
    ],
    ["submit", (snapshot: AssistantDraft) => ({ accepted: snapshot.text.trim().length > 0 })],
  ]),
});
```

`messages` 是必填项。消息支持 text/code/process/attachments 四个明确分支；过程步骤、活动、后台工作、问题、模型选项、读取状态、草稿和发送快照使用有限 schema。`assistantJsonSchemas` 与 catalog 复用相同定义，校验、描述与类型关联不会各维护一份。controlled 草稿必须接 `onDraftChange` 或设只读；发送是否接受仍由宿主显式返回 `{accepted:true}` 决定。

本片支持序列化附件元数据（id/name/url/mediaType/sizeBytes），不支持 File、本地文件上传、附件回调、renderPart/renderWorkDetail、headerActions/composerTrailing slots。需要这些能力时使用完整 `meowtail/chat` JSX API。JSON 不提供 `onAttach`，并用有限 `allowAttachments: false` 默认值关闭本地文件选择入口，显式 true 会被拒绝；文本编辑、发送和已有附件的显示/移除仍可使用。网络、权限、持久化、数据协议和上传始终属于宿主。

Button 的点击 action 不传原生事件；Input 的 input action 只传经校验的当前字符串值。仅列出的属性可用，开放 JSX native props、HTML 标签名、ref/raw HTML、任意事件对象、任意代码、路径表达式、动态 import 均不在 catalog 内。其他 MeowUI 组件尚未提供 JSON metadata；本片不声称完整 UI 属性自动序列化。
