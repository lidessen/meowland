import { h, signal } from "meowjsx/runtime";
import { defineStory } from "meowbook";
import {
  Button,
  ChatAttachments,
  ChatComposer,
  ChatFrame,
  ChatHeader,
  ChatMessage,
  ChatMessageActions,
  ChatMessageList,
  ChatProcess,
  ChatSources,
  ChatStatus,
  ChatToolCall,
  Icon,
  IconButton,
} from "meowtail";

export const MessagePartsStory = defineStory({
  id: "message-parts",
  title: "消息 · 头像、长标题与操作",
  group: "对话组件",
  groupOrder: 50,
  component: "ChatMessage",
  variant: "头像与操作",
  description: "同一段对话中的头像、作者、时间、正文和操作；长内容不能挤走操作或撑破窄屏。",
  covers: [
    "ChatHeader all parts",
    "ChatMessage avatar/time/actions",
    "ChatFrame",
    "ChatMessageList custom label",
    "long text",
  ],
  render: () => (
    <div className="workshop-composition">
      <ChatFrame>
        <ChatHeader
          eyebrow="当前项目"
          title="重新检查组件的文字、图标、暗色表面与窄屏交互"
          description="标题和说明在空间不足时换行，不隐藏工作上下文。"
          status={<ChatStatus label="等待审阅" tone="waiting" />}
          actions={
            <IconButton label="查看会话信息" data-message-info>
              <Icon name="eye" />
            </IconButton>
          }
        />
        <ChatMessageList ariaLabel="组件审阅示例消息">
          <ChatMessage
            role="assistant"
            author="负责组件审阅的 Assistant"
            timestamp="09:41"
            avatar={<Icon name="brain" />}
            actions={
              <ChatMessageActions>
                <Button variant="quiet" size="small" data-message-action="已标记这段回复">
                  标记回复
                </Button>
                <IconButton label="回复详情" data-message-info>
                  <Icon name="eye" />
                </IconButton>
                <Button variant="quiet" size="small" disabled>
                  等待检查结果
                </Button>
              </ChatMessageActions>
            }
          >
            <p>标题、作者与操作需要共同维持阅读顺序。较长的路径也应能留在当前容器中：</p>
            <p>
              packages/meowtail/stories/review-of-typography-and-component-interaction-states.tsx
            </p>
          </ChatMessage>
          <ChatMessage
            role="assistant"
            author="负责组件审阅的 Assistant"
            continuation
            timestamp="09:42"
          >
            接续上一段，不重复视觉标题，但仍保留可访问的作者信息。
          </ChatMessage>
          <ChatMessage
            role="user"
            author="你"
            timestamp="09:43"
            avatar={<Icon name="user-round" />}
          >
            请保持输入、消息与附件之间的关系，长内容也要完整可读。
          </ChatMessage>
          <ChatMessage
            role="assistant"
            author="Assistant"
            timestamp="09:44"
            actions={
              <ChatMessageActions>
                <Button data-message-action="已打开本地建议示例">审阅建议</Button>
                <Button variant="outline" data-message-action="已打开本地差异示例">
                  查看差异
                </Button>
                <button type="button" data-message-action="已保留检查记录，可稍后回来">
                  稍后处理
                </button>
              </ChatMessageActions>
            }
          >
            <p>检查记录已准备好。可以先审阅建议，再决定是否采用；也可以保留记录稍后处理。</p>
          </ChatMessage>
        </ChatMessageList>
      </ChatFrame>
      <ChatHeader title="只有标题的紧凑会话" />
      <p className="workshop-feedback" role="status" data-message-feedback>
        操作仅反馈到本地示例。
      </p>
    </div>
  ),
  setup({ root, onCleanup }) {
    const click = (event: Event) => {
      const target = (event.target as Element).closest<HTMLElement>(
        "[data-message-action], [data-message-info]",
      );
      if (target)
        root.querySelector("[data-message-feedback]")!.textContent =
          target.dataset.messageAction ?? "这是组件审阅示例，没有真实会话数据。";
    };
    root.addEventListener("click", click);
    onCleanup(() => root.removeEventListener("click", click));
  },
});

export const ComposerRecoveryStory = defineStory({
  id: "composer-recovery",
  title: "输入 · 发送、失败与恢复",
  group: "对话组件",
  groupOrder: 50,
  component: "ChatComposer",
  variant: "发送与恢复",
  description:
    "手动推进本地模拟状态，不使用计时器或网络。等待时可继续编辑；已提交内容与最新草稿分别保留。",
  covers: [
    "ChatComposer value/placeholder/hint/submitLabel/submitDisabled",
    "onInput/onSubmit",
    "pending/error/recovery",
    "long hint",
  ],
  render: () => (
    <div className="workshop-composition">
      <ChatComposer
        value="检查明暗主题下的组件状态，并保留我正在编辑的这段输入。"
        submitLabel="提交检查"
        hint="本地发送模拟：等待结果时可以继续写，最新草稿不会被清空。"
        hintId="recovery-hint"
      >
        <IconButton label="附件暂不可用" disabled>
          <Icon name="plus" />
        </IconButton>
      </ChatComposer>
      <p className="workshop-feedback" data-composer-submitted>
        尚未提交内容。
      </p>
      <div className="workshop-row">
        <Button variant="outline" data-composer-result="failure" disabled>
          模拟失败
        </Button>
        <Button variant="outline" data-composer-result="success" disabled>
          模拟成功
        </Button>
        <Button variant="quiet" data-composer-recover disabled>
          恢复并继续编辑
        </Button>
      </div>
      <p className="workshop-feedback" role="status" data-composer-feedback>
        等待提交。仅在本地演示。
      </p>
    </div>
  ),
  setup({ root, onCleanup }) {
    const form = root.querySelector("form")!;
    const input = root.querySelector("textarea")!;
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const feedback = root.querySelector("[data-composer-feedback]")!;
    const submitted = root.querySelector("[data-composer-submitted]")!;
    const results = [...root.querySelectorAll<HTMLButtonElement>("[data-composer-result]")];
    const recover = root.querySelector<HTMLButtonElement>("[data-composer-recover]")!;
    const send = (event: Event) => {
      event.preventDefault();
      if (submit.disabled) return;
      if (!input.value.trim()) {
        feedback.textContent = "请先输入检查要求。";
        input.focus();
        return;
      }
      submitted.textContent = `本次提交：${input.value}`;
      submit.disabled = true;
      results.forEach((button) => {
        button.disabled = false;
      });
      feedback.textContent = "已接纳本地发送模拟，等待结果。可以继续编辑下一段草稿。";
    };
    const click = (event: Event) => {
      const result = (event.target as Element).closest<HTMLElement>("[data-composer-result]");
      if (result) {
        results.forEach((button) => {
          button.disabled = true;
        });
        recover.disabled = false;
        feedback.textContent =
          result.dataset.composerResult === "failure"
            ? "模拟连接失败。尚未完成，可恢复并重试。"
            : "本地检查示例完成，可继续编辑。";
        recover.focus();
      }
      if ((event.target as Element).closest("[data-composer-recover]")) {
        submit.disabled = false;
        recover.disabled = true;
        feedback.textContent = "已恢复，输入保持原样。";
        input.focus();
      }
    };
    const edit = () => {
      feedback.textContent = submit.disabled
        ? "正在编辑最新草稿；此前提交内容保持不变，等待结果或恢复后可再提交。"
        : "正在编辑；最新修改尚未提交。";
    };
    form.addEventListener("submit", send);
    input.addEventListener("input", edit);
    root.addEventListener("click", click);
    onCleanup(() => {
      form.removeEventListener("submit", send);
      input.removeEventListener("input", edit);
      root.removeEventListener("click", click);
    });
  },
});

export const ExecutionDetailsStory = defineStory({
  id: "execution-details",
  title: "执行 · 四种状态与按需展开",
  group: "对话组件",
  groupOrder: 50,
  component: "ChatToolCall",
  variant: "执行与依据",
  description: "静态状态与真实原生展开行为分开：四种状态分别展示普通与可展开载体。",
  covers: [
    "ChatToolCall running/complete/waiting/error × collapsible",
    "ChatProcess open/closed",
    "ChatSources open/closed/custom label/no description/empty",
  ],
  render: () => (
    <div className="workshop-composition">
      <ChatProcess label="已展开的检查依据" open>
        <p>这些内容只展示组件状态，不代表检查了真实项目。</p>
      </ChatProcess>
      <ChatProcess label="需要时再展开的补充过程">
        <p>Tab 到标题后可用 Enter 或空格展开，再次操作可收起。</p>
      </ChatProcess>
      {(["running", "complete", "waiting", "error"] as const).map((state) => (
        <section className="workshop-section" aria-label={`${state} 执行状态`}>
          <ChatToolCall
            label={`组件检查 · ${state}`}
            state={state}
            detail="普通载体直接展示依据。"
          />
          <ChatToolCall
            label={`展开 ${state} 的完整检查信息与后续处理说明`}
            state={state}
            collapsible
            detail="摘要信息与详细内容属于同一项执行。"
          >
            <p>
              继续检查长路径 packages/meowtail/src/theme/components-and-conversation-state-review.ts
              的显示情况。
            </p>
          </ChatToolCall>
        </section>
      ))}
      <ChatSources
        label="设计依据"
        open
        items={[
          {
            title: "Apple 的桌面排版角色及本地 Web 适配边界",
            url: "https://developer.apple.com/design/human-interface-guidelines/typography",
            description: "来源标题和说明可以换行；打开链接会离开本地示例。",
          },
          {
            title: "不带补充说明的来源",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html",
          },
        ]}
      />
      <ChatSources items={[]} />
    </div>
  ),
});

export const ExecutionWorkflowStory = defineStory({
  id: "execution-workflow",
  title: "执行 · 任务、进展与实际结果",
  group: "对话组件",
  groupOrder: 50,
  component: "ChatToolCall",
  variant: "对话中的执行过程",
  description:
    "固定工程示例：折叠时辨认做了什么，展开后核对命令与结果。运行、等待、失败分别说明当前进展；不执行命令或请求模型。",
  covers: [
    "ChatToolCall concrete task and result",
    "running/complete/waiting/error",
    "collapsed and initially open",
    "long command/output on narrow viewport",
    "ChatProcess grouped execution",
  ],
  render: () => (
    <ChatFrame>
      <ChatMessageList ariaLabel="订单汇总修复示例">
        <ChatMessage role="user" author="你">
          修复订单汇总对特殊 SKU 的处理，补回归测试，并更新变更记录。
        </ChatMessage>
        <ChatMessage role="assistant" author="Assistant">
          <p>我会先核对汇总逻辑，再检查特殊键名和空订单的测试结果。</p>
          <ChatProcess label="检查与修改 · 3 项" open>
            <ChatToolCall label="阅读订单汇总与测试" state="complete" collapsible>
              <p>
                已阅读 <code>orders.ts</code>、<code>orders.test.ts</code>。汇总对象使用普通对象，
                <code>__proto__</code> 与 <code>constructor</code> 会碰到原型属性。
              </p>
            </ChatToolCall>
            <ChatToolCall label="修复特殊 SKU 的汇总" state="complete" collapsible>
              <p>
                使用 <code>Object.create(null)</code> 保存 SKU 数量，保留现有返回字段。
                已为特殊键名新增回归测试，并更新 <code>CHANGELOG.md</code>。
              </p>
            </ChatToolCall>
            <ChatToolCall label="运行订单汇总测试" state="complete" collapsible open>
              <pre>
                <code>{`$ bun test orders.test.ts

✓ 空订单返回零计数
✓ 只统计已支付订单
✓ 重复 SKU 合并数量
✓ 支持 __proto__、constructor、toString

4 pass · 0 fail · 10 expect calls
退出代码 0`}</code>
              </pre>
            </ChatToolCall>
          </ChatProcess>
          <p>修复和回归测试已完成。可以展开过程核对修改依据与测试输出。</p>
        </ChatMessage>
        <ChatMessage role="assistant" author="Assistant" continuation>
          <ChatToolCall
            label="检查组件库类型"
            state="running"
            collapsible
            open
            detail="已开始检查 MeowUI，尚未收到最终结果。"
          >
            <pre>
              <code>{`$ bun run --filter meowtail typecheck
正在检查 packages/meowtail/src/chat/tool-call.tsx`}</code>
            </pre>
          </ChatToolCall>
          <ChatToolCall
            label="安装项目依赖"
            state="waiting"
            collapsible
            detail="等待允许访问依赖仓库，尚未安装。"
          >
            <p>
              <code>bun install</code> 需要下载缺少的依赖。等待期间，已经完成的文件修改仍然保留。
            </p>
          </ChatToolCall>
          <ChatToolCall label="检查全仓格式" state="error" collapsible open>
            <pre>
              <code>{`$ bun run format:check
[warn] packages/meowtail/stories/conversation/long-running-execution-and-recovery.stories.tsx
[warn] Code style issues found in the above file.
退出代码 1`}</code>
            </pre>
            <p>格式检查未通过；该结果不能当作类型检查或测试失败。修正格式后可重新检查。</p>
          </ChatToolCall>
        </ChatMessage>
      </ChatMessageList>
    </ChatFrame>
  ),
});

export const AttachmentScaleStory = defineStory({
  id: "attachment-scales",
  title: "附件 · 比例、大小与缺省信息",
  group: "对话组件",
  groupOrder: 50,
  component: "ChatAttachments",
  variant: "比例与缺省信息",
  description: "宽图、长图和文件使用各自载体。下载为内置示例，不读取本地文件。",
  covers: [
    "ChatAttachments image/file",
    "host download callback/default link",
    "wide/tall image",
    "zero/KB/MB/unknown size",
    "long filename",
    "empty list/custom label",
  ],
  render: () => {
    const downloadFeedback = signal("宿主下载回调示例，不连接服务。");
    return (
      <div className="workshop-composition">
        <ChatAttachments
          label="图片比例示例"
          items={[
            {
              id: "wide",
              name: "横向结构图.svg",
              mediaType: "image/svg+xml",
              url:
                "data:image/svg+xml," +
                encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="120"><rect width="600" height="120" fill="#ced8d4"/><text x="24" y="68" font-size="24" fill="#34463e">600 × 120</text></svg>',
                ),
            },
            {
              id: "tall",
              name: "纵向结构图.svg",
              mediaType: "image/svg+xml",
              url:
                "data:image/svg+xml," +
                encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="360"><rect width="120" height="360" fill="#d8d8e1"/><text x="12" y="180" font-size="16" fill="#424254">120 × 360</text></svg>',
                ),
            },
          ]}
        />
        <ChatAttachments
          label="文件大小示例"
          items={[
            {
              id: "zero",
              name: "empty.txt",
              mediaType: "text/plain",
              sizeBytes: 0,
              url: "data:text/plain,",
            },
            {
              id: "kb",
              name: "组件设计语言和全部交互状态检查记录以及后续修改建议.md",
              mediaType: "text/markdown",
              sizeBytes: 2860,
              url: "data:text/plain,Example",
            },
            {
              id: "mb",
              name: "reference.pdf",
              mediaType: "application/pdf",
              sizeBytes: 1572864,
              url: "data:text/plain,Fixture%20metadata%20only",
            },
            {
              id: "unknown",
              name: "size-not-provided.txt",
              mediaType: "text/plain",
              url: "data:text/plain,Unknown%20size",
            },
          ]}
        />
        <p className="workshop-note">文件大小为固定展示数据，不声称与下载内容的实际字节数一致。</p>
        <ChatAttachments
          label="宿主下载回调示例"
          items={[
            {
              id: "host-download",
              name: "受保护文档.txt",
              mediaType: "text/plain",
              url: "data:text/plain,Host%20download%20example",
              onDownload: () => downloadFeedback.set("宿主已接手下载，仅本地示例。"),
            },
          ]}
        />
        <p className="workshop-feedback" role="status" data-attachment-download-feedback>
          {downloadFeedback}
        </p>
        <ChatAttachments label="暂无附件" items={[]} />
      </div>
    );
  },
});
