import { h, signal, type Child } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Container,
  DescriptionItem,
  DescriptionList,
  DiffBlock,
  Grid,
  Inline,
  ResourceLink,
  Stack,
} from "meowtail";
import {
  AssistantView,
  ChatAttachments,
  ChatProcess,
  ChatQuestion,
  ChatSources,
  ChatTask,
  ChatToolCall,
  type AssistantDraft,
  type AssistantMessage,
  type AssistantQuestion,
  type ChatExecutionState,
  type ChatTaskProgress,
} from "meowtail/chat";

const payload = [
  "Inspect packages/meowtail/src/chat/agent-workflow-with-a-very-long-unbroken-file-name.tsx",
  "中文输入：检查嵌套任务、长路径、消息与工具输出是否能在窄容器中完整阅读。",
  '<img src="x" onerror="alert(1)"> is tool data, not an executable element.',
].join("\n");
const resultLines = Array.from(
  { length: 24 },
  (_, index) =>
    `Result ${index + 1}: 长中文与 English output remain readable. No external tool ran.`,
).join("\n");
const attachment = {
  id: "notes",
  name: "agent-layout-review-notes.txt",
  mediaType: "text/plain",
  url: "data:text/plain,Local%20fixture%20only.%20No%20external%20tool%20ran.",
};

/** A host fixture owns state and local scheduling; every visible surface is a public component. */
export function agentWorkflowDemo(narrow = false): Child {
  const state = signal<ChatExecutionState>("running");
  const status = signal("正在检查第 2 个文件");
  const output = signal<string | undefined>(resultLines);
  const progress = signal<ChatTaskProgress | undefined>({
    value: 2,
    max: 5,
    label: "已检查 2 / 5 个文件 · 宿主报告",
  });
  const reply = signal("公开答复尚未收到；执行已完成，不表示回复失败。");
  const answer = signal("等待你选择检查范围；没有执行失败。");
  const waiting = signal<ChatExecutionState>("waiting");
  const retryState = signal<ChatExecutionState>("error");
  const retryStatus = signal("本地模拟读取失败 · 可重试");
  const feedback = signal("所有操作仅改变本地示例状态，不执行工具或网络请求。");
  let alive = true;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const later = (action: () => void) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (alive) action();
    }, 650);
    timers.add(timer);
  };
  return (
    <Container width="wide">
      <Stack
        gap="relaxed"
        style={narrow ? { maxWidth: "320px", width: "100%" } : undefined}
        data-agent-workflow={narrow ? "narrow" : "wide"}
        ref={() => () => {
          alive = false;
          timers.forEach(clearTimeout);
        }}
      >
        <Stack gap="compact">
          <strong>并发执行 · 公开进度</strong>
          <span>一个任务在推进，一个需要你的答复，一个执行已完成但尚未回报。</span>
          <Inline>
            <Button
              variant="outline"
              size="small"
              onClick={() => {
                state.value = "running";
                status.value = "正在检查第 3 个文件";
                output.value = `${output.value ?? ""}\nNew result: 新内容已到达，展开状态由原生 details 保留。`;
                progress.value = { value: 3, max: 5, label: "已检查 3 / 5 个文件 · 宿主报告" };
              }}
            >
              推进检查
            </Button>
            <Button
              variant="quiet"
              size="small"
              onClick={() => {
                state.value = "unknown";
                status.value = "连接中断 · 保留最后一次已知结果";
                progress.value = undefined;
                feedback.value = "连接中断不等于执行失败；旧输出保留，当前进度未知。";
              }}
            >
              模拟连接中断
            </Button>
          </Inline>
        </Stack>
        <Grid columns="auto" minColumnWidth="wide" align="stretch">
          <ChatTask
            title="检查组件布局"
            state={state}
            statusLabel={status}
            description="公开摘要：检查阅读轴、长内容与动作可达性。"
            progress={progress}
            footer={<span>执行事实来自宿主；尚未声明所有检查通过。</span>}
          >
            <ChatToolCall
              label="读取文件"
              summary="chat/agent-workflow-with-a-very-long-unbroken-file-name.tsx"
              state={state}
              statusLabel={status}
              input={payload}
              output={output}
              outputSummary="已返回 24 条记录；可展开全部输出并复制原始文本。"
              maxLines={4}
              collapsible
              open
              onCancel={() => {
                state.value = "cancelled";
                status.value = "已取消后续检查；保留已有输出";
                progress.value = undefined;
              }}
            />
            <ChatToolCall
              label="生成检查报告"
              summary="等待文件检查完成"
              state="queued"
              statusLabel="排队中 · 尚未开始"
              input="Summarize only confirmed findings."
              collapsible
            />
          </ChatTask>
          <ChatTask
            title="确认检查范围"
            state={waiting}
            statusLabel={answer}
            executionText="执行暂停，等待用户答复。"
            footer={<span>选择只更新示例；授权政策由宿主决定。</span>}
          >
            <ChatQuestion
              question="本轮检查哪些区域？"
              questionId={narrow ? "agent-scope-narrow" : "agent-scope-wide"}
              description="这是一项普通范围选择；未回复时保持等待。"
              actions={
                <Inline gap="compact">
                  <Button
                    size="small"
                    onClick={() => {
                      waiting.value = "queued";
                      answer.value = "已收到范围：工具与任务 · 等待调度";
                    }}
                  >
                    工具与任务
                  </Button>
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => {
                      waiting.value = "cancelled";
                      answer.value = "用户取消了这项范围确认";
                    }}
                  >
                    取消确认
                  </Button>
                </Inline>
              }
            />
          </ChatTask>
          <ChatTask
            title="委派：独立键盘审查"
            state="success"
            statusLabel="执行成功 · 等待公开答复"
            executionText="委派执行已返回，检查了 5 个交互入口。"
            replyText={reply}
            footer={
              <Button
                variant="outline"
                size="small"
                onClick={() => {
                  reply.value = "已收到公开答复：键盘检查完成，附审查记录。";
                }}
              >
                接收公开答复
              </Button>
            }
          >
            <ChatProcess label="子任务记录 · 1 项">
              <ChatTask
                title="核对焦点顺序"
                state="success"
                statusLabel="执行成功"
                executionText="Tab、Shift+Tab 与展开控件已检查。"
              />
            </ChatProcess>
          </ChatTask>
        </Grid>
        <ChatProcess label="其他活动 · 可重试的错误与明确取消">
          <Stack gap="compact">
            <ChatToolCall
              label="读取本地索引"
              state={retryState}
              statusLabel={retryStatus}
              input="index.json"
              output="Last confirmed result retained."
              collapsible
              onRetry={() => {
                retryState.value = "running";
                retryStatus.value = "正在重试本地模拟";
                later(() => {
                  retryState.value = "success";
                  retryStatus.value = "本地模拟重试成功";
                });
              }}
            />
            <ChatToolCall
              label="额外网络检索"
              state="cancelled"
              statusLabel="已取消 · 未发送任何网络请求"
              outputSummary="取消是一项独立事实，不显示为执行错误。"
              collapsible
            />
          </Stack>
        </ChatProcess>
        <ChatProcess label="计划、产物与可选元数据">
          <Stack>
            <ol aria-label="公开计划">
              <li>检查布局与长内容：进行中</li>
              <li>收集独立键盘审查：执行已完成，等待公开答复</li>
              <li>整理产物：排队中</li>
            </ol>
            <DescriptionList aria-label="宿主提供的元数据">
              <DescriptionItem term="上次更新时间">10:42 · 固定示例时间</DescriptionItem>
              <DescriptionItem term="用量">输入 1,240 / 输出 320 tokens · 示例数据</DescriptionItem>
            </DescriptionList>
            <ResourceLink
              title="组件审查记录"
              detail="本地示例产物 · 点击只显示提示"
              onClick={() => {
                feedback.value = "宿主收到打开审查记录的意图；示例没有加载文件。";
              }}
            />
            <ChatAttachments items={[attachment]} />
            <DiffBlock
              files={[
                {
                  path: "layout-example.tsx",
                  lines: [
                    { kind: "removed", text: '<div className="custom-row">' },
                    { kind: "added", text: '<Inline gap="compact" align="baseline">' },
                    { kind: "context", text: "  Keep content and actions on one reading axis." },
                  ],
                },
              ]}
            />
          </Stack>
        </ChatProcess>
        <span role="status">{feedback}</span>
      </Stack>
    </Container>
  );
}

export function agentAssistantDemo(): Child {
  const messages = signal<readonly AssistantMessage[]>([
    {
      id: "agent-run",
      role: "assistant",
      author: "Assistant",
      status: "streaming",
      parts: [
        {
          id: "summary",
          kind: "text",
          text: "正在检查共享组件。**公开进度摘要**：文件检查进行中，独立审查执行已完成，仍在等待它的公开答复。\n\n`<script>alert(1)</script>` 是说明文字。原始 HTML 也不执行：<img src=x onerror=alert(1)>。",
        },
        {
          id: "inspect-tool",
          kind: "tool",
          label: "读取组件文件",
          summary: "packages/meowtail/src/chat/long-component-file-name.tsx",
          state: "running",
          statusLabel: "正在接收输出",
          input: payload,
          output: resultLines,
          outputSummary: "已返回 24 条记录，完整结果可展开。",
          maxLines: 3,
          defaultOpen: true,
          canCancel: true,
        },
        {
          id: "delegate-task",
          kind: "task",
          title: "独立键盘审查",
          state: "success",
          statusLabel: "执行成功 · 公开答复未收到",
          executionText: "执行已返回，5 / 5 项完成。",
          replyText: "等待公开答复，不表示执行失败。",
          progress: { value: 5, max: 5, label: "执行检查 5 / 5 项" },
        },
        {
          id: "retry-tool",
          kind: "tool",
          label: "读取索引",
          state: "error",
          statusLabel: "本地模拟读取失败",
          input: "index.json",
          output: "Previous confirmed data is retained.",
          canRetry: true,
        },
        { id: "files", kind: "attachments", items: [attachment] },
        { id: "references", kind: "text", text: "宿主提供的产物与来源" },
      ],
    },
  ]);
  const draft = signal<AssistantDraft>({ text: "请继续检查窄容器中的组合。", attachments: [] });
  const questions = signal<readonly AssistantQuestion[]>([
    {
      id: "scope",
      title: "下一步检查哪些区域？",
      state: "open",
      description: "等待你的答复。没有回复不表示执行失败。",
      options: [
        { value: "tools", label: "工具与任务" },
        { value: "composer", label: "输入与附件" },
      ],
    },
  ]);
  let alive = true;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const patchTool = (
    id: string,
    patch: Partial<Extract<AssistantMessage["parts"][number], { kind: "tool" }>>,
  ) => {
    messages.value = messages.value.map((message) => ({
      ...message,
      parts: message.parts.map((part) =>
        part.kind === "tool" && part.id === id ? { ...part, ...patch } : part,
      ),
    }));
  };
  return (
    <Stack
      style={{ height: "min(1000px, calc(100dvh - 48px))", minHeight: "420px" }}
      ref={() => () => {
        alive = false;
        timers.forEach(clearTimeout);
      }}
    >
      <Inline>
        <Button
          size="small"
          variant="outline"
          onClick={() => {
            const part = messages.value[0]?.parts.find((item) => item.id === "inspect-tool");
            if (part?.kind !== "tool") return;
            patchTool("inspect-tool", {
              output: `${part.output ?? ""}\nNew output: 中文更新 <img src=x onerror=alert(1)> stays inert.`,
              outputSummary: "已追加一条本地结果；不改变展开与焦点。",
            });
          }}
        >
          追加工具输出
        </Button>
      </Inline>
      <AssistantView
        title="Agent 工作流"
        description="共享默认组合 · 本地数据，不连接 Agent runtime"
        messages={messages}
        draft={draft}
        onDraftChange={(next) => {
          draft.value = next;
        }}
        onSubmit={async (snapshot) => {
          messages.value = [
            ...messages.value,
            {
              id: `user-${messages.value.length}`,
              role: "user",
              author: "You",
              parts: [{ id: "text", kind: "text", text: snapshot.text }],
            },
          ];
          return { accepted: true };
        }}
        activity={{ title: "检查共享组件", statusText: "文件检查进行中", tone: "processing" }}
        work={[
          {
            id: "running",
            title: "文件检查",
            statusText: "正在接收输出",
            tone: "processing",
            executionText: "运行中",
          },
          {
            id: "queued",
            title: "整理报告",
            statusText: "排队中 · 尚未开始",
            tone: "idle",
            executionText: "等待调度",
          },
          {
            id: "returned",
            title: "独立键盘审查",
            statusText: "执行成功 · 等待公开答复",
            tone: "success",
            executionText: "执行已完成",
            replyText: "公开答复尚未收到",
          },
        ]}
        questions={questions}
        onAnswer={(id, answer) => {
          questions.value = questions.value.map((question) =>
            question.id === id
              ? { ...question, state: "answered", feedback: `宿主收到范围选择：${answer}` }
              : question,
          );
        }}
        onToolAction={(_messageId, partId, action) => {
          if (action === "cancel") {
            patchTool(partId, {
              state: "cancelled",
              statusLabel: "用户已取消后续检查",
              canCancel: false,
            });
            return;
          }
          patchTool(partId, {
            state: "running",
            statusLabel: "正在重试本地模拟",
            retryDisabled: true,
          });
          const timer = setTimeout(() => {
            timers.delete(timer);
            if (alive)
              patchTool(partId, {
                state: "success",
                statusLabel: "本地模拟重试成功",
                canRetry: false,
                output: "Index read completed in this local fixture.",
              });
          }, 650);
          timers.add(timer);
        }}
        renderPart={(part) =>
          part.id === "references" ? (
            <Stack gap="compact">
              <ResourceLink
                title="组件审查产物"
                detail="示例入口 · 只使用本地锚点"
                href="#agent-reference"
              />
              <ChatSources
                items={[
                  {
                    title: "Meowtail source",
                    url: "https://github.com/lidessen/meowland",
                    description: "显式提供的示例来源，不由 UI 检索。",
                  },
                ]}
              />
              <span id="agent-reference">产物、引用与附件均由宿主提供。</span>
            </Stack>
          ) : undefined
        }
      />
    </Stack>
  );
}

export const AgentWorkflow = defineStory({
  id: "agent-workflow",
  title: "Agent · 并发、等待与执行回报",
  group: "Assistant",
  component: "ChatTask",
  description: "共享工具与任务展示。执行完成、公开答复、用户等待和连接中断是不同事实。",
  covers: [
    "ChatTask",
    "ChatToolCall",
    "concurrent work",
    "nested tasks",
    "waiting",
    "retry",
    "cancelled",
    "progress",
  ],
  render: () => agentWorkflowDemo(),
});

export const AgentWorkflowNarrow = defineStory({
  id: "agent-workflow-narrow",
  title: "Agent · 320px 局部容器",
  group: "Assistant",
  component: "ChatTask",
  description: "相同组合放入宽屏中的 320px 宿主，不借助 story 专属 CSS 修补内容。",
  covers: ["narrow container", "long input/output", "nested tasks", "default layout"],
  render: () => agentWorkflowDemo(true),
});

export const AgentWorkflowAssistant = defineStory({
  id: "agent-workflow-assistant",
  title: "Agent · 完整 Assistant 组合",
  group: "Assistant",
  component: "AssistantView",
  description:
    "同一 Assistant 默认渲染工具与任务，保留消息、草稿、附件、活动、问题和安全 Markdown。",
  covers: [
    "AssistantView",
    "tool/task parts",
    "safe Markdown",
    "reactive payload",
    "intent callbacks",
    "composer",
  ],
  render: agentAssistantDemo,
});
