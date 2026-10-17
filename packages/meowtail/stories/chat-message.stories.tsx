// oxlint-disable-next-line no-unused-vars -- Fragment is the JSX fragment factory.
import { h, Fragment, signal, type Child } from "meowjsx/runtime";
import { defineStory } from "meowbook";
import {
  Button,
  ChatAttachments,
  ChatBubble,
  ChatFrame,
  ChatMessage,
  ChatMessageActions,
  ChatMessageList,
  ChatMessageListContent,
  ChatMessageListItem,
  ChatProcess,
  ChatSources,
  ChatToolCall,
  Container,
  Icon,
  Stack,
} from "meowtail";

const reference = {
  title: "AbortController",
  url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController",
  description: "取消异步请求的浏览器接口。",
};

export const ChatToolSequenceStory = defineStory({
  id: "chat-tool-sequence",
  title: "消息 · 工具调用序列",
  group: "对话组件",
  groupOrder: 60,
  component: "ChatToolCall",
  description: "工具动作与目标保持同排；结果按需展开，非完成状态始终明确显示。静态示例不执行工具。",
  render: () => (
    <Container>
      <ChatFrame>
        <ChatMessageList ariaLabel="工具调用序列">
          <ChatMessage role="user" author="你" surface="none">
            <ChatBubble>检查请求取消后，旧响应是否仍会写入列表。</ChatBubble>
          </ChatMessage>
          <ChatMessage role="assistant" author="Assistant" surface="none">
            <ChatBubble>
              <p>我会先查看请求与结果提交的位置。</p>
            </ChatBubble>
            <ChatProcess label="读取、搜索 · 3 次调用" icon={<Icon name="search" />}>
              <ChatToolCall
                label="读取"
                summary="src/search/request.ts"
                icon={<Icon name="file" />}
                collapsible
              >
                <pre>
                  <code>const request = await fetch(url, options);</code>
                </pre>
              </ChatToolCall>
              <ChatToolCall
                label="搜索"
                summary="currentRequest · src/search"
                icon={<Icon name="search" />}
                collapsible
              >
                <p>发现 2 处请求身份检查。</p>
              </ChatToolCall>
              <ChatToolCall
                label="读取"
                summary="src/search/results.ts"
                icon={<Icon name="file" />}
                collapsible
              >
                <p>提交结果前未核对请求身份。</p>
              </ChatToolCall>
            </ChatProcess>
            <ChatBubble>
              <p>结果写入处缺少身份检查，下面是验证状态。</p>
            </ChatBubble>
            <ChatProcess label="执行验证 · 4 项" open>
              <ChatToolCall
                label="执行"
                summary="bun test search/request.test.ts"
                state="running"
                collapsible
              >
                <p>等待进程输出。</p>
              </ChatToolCall>
              <ChatToolCall label="读取" summary="受限工作区配置" state="waiting" collapsible>
                <p>等待权限确认。</p>
              </ChatToolCall>
              <ChatToolCall label="执行" summary="远端连接检查" state="error" collapsible>
                <p>连接失败，没有修改远端内容。</p>
              </ChatToolCall>
              <ChatToolCall label="执行" summary="上次中断的验证" state="unknown" collapsible>
                <p>缺少最终回执，不能确认执行结果。</p>
              </ChatToolCall>
            </ChatProcess>
          </ChatMessage>
        </ChatMessageList>
      </ChatFrame>
    </Container>
  ),
});

export const ChatToolCallActionStory = defineStory({
  id: "chat-tool-call-action",
  title: "工具行 · 动作与展开",
  group: "对话组件",
  groupOrder: 60,
  component: "ChatToolCall",
  variant: "宿主动作",
  description:
    "同一个行有两种交互：展开自己的正文，或由宿主执行动作。两种都是同一个可聚焦控件，行度量、状态与悬停字形一致。示例只回显本地状态，不执行命令。",
  covers: ["onActivate", "button header", "collapsible body", "row geometry"],
  render: () => {
    const feedback = signal("尚未激活");
    return (
      <Container>
        <Stack>
          <ChatFrame>
            <ChatMessageList ariaLabel="工具行的两种交互">
              <ChatToolCall
                label="执行命令"
                summary="bun test search/request.test.ts"
                icon={<Icon name="terminal" />}
                onActivate={() => {
                  feedback.value = "已激活：由宿主打开这次命令的记录。";
                }}
                data-tool-action="demo"
              />
              <ChatToolCall
                label="读取"
                summary="src/search/request.ts"
                icon={<Icon name="file" />}
                collapsible
              >
                <p>展开的行把结果留在原位。</p>
              </ChatToolCall>
              <ChatToolCall
                label="执行"
                summary="远端连接检查"
                icon={<Icon name="terminal" />}
                state="error"
              />
            </ChatMessageList>
          </ChatFrame>
          <p className="workshop-feedback" role="status" data-tool-action-result>
            {feedback}
          </p>
        </Stack>
      </Container>
    );
  },
});

export const ChatMessageCompositionStory = defineStory({
  id: "chat-message-composition",
  title: "消息 · 文字、文件与依据",
  group: "对话组件",
  groupOrder: 60,
  component: "ChatMessage",
  variant: "组合与表面",
  description:
    "消息负责身份与排列，Bubble负责阅读面。附件与过程可以在气泡之外，操作只回显本地状态。",
  covers: [
    "ChatMessage header/footer/surface",
    "ChatBubble auto/plain/filled",
    "ChatMessageActions",
    "mixed content",
  ],
  render: () => (
    <Container>
      <Stack>
        <ChatFrame>
          <ChatMessageList ariaLabel="消息组合示例">
            <ChatMessage
              role="user"
              author="你"
              timestamp="14:20"
              surface="none"
              footer={<span>已送达</span>}
            >
              <ChatAttachments
                items={[
                  {
                    id: "log",
                    name: "search-request.log",
                    url: "data:text/plain,Search%20request%20example",
                    mediaType: "text/plain",
                    sizeBytes: 22,
                  },
                ]}
              />
              <ChatBubble>
                <p>这是连续搜索的日志。帮我看看旧结果为什么会覆盖新结果，先给出建议。</p>
              </ChatBubble>
            </ChatMessage>
            <ChatMessage
              role="assistant"
              author="Assistant"
              surface="none"
              header={
                <>
                  <strong>Assistant</strong>
                  <span>排查记录 · 静态示例</span>
                </>
              }
              footer={<span>未执行真实请求；建议等待你确认。</span>}
              actions={
                <ChatMessageActions>
                  <Button variant="outline" size="small" data-message-choice="已保留修复建议">
                    保留建议
                  </Button>
                  <Button variant="quiet" size="small" data-message-choice="已标记需要进一步检查">
                    继续检查
                  </Button>
                </ChatMessageActions>
              }
            >
              <ChatBubble>
                <p>
                  <strong>旧请求较晚返回，写入时没有确认它是否仍是当前请求。</strong>
                  建议保留接口，在提交结果前核对请求身份。
                </p>
              </ChatBubble>
              <ChatProcess label="查看排查依据 · 2 项">
                <ChatToolCall
                  label="读取请求日志"
                  state="complete"
                  collapsible
                  detail="示例中第二次请求先完成。"
                >
                  <p>14:20:01 搜索“组件”；14:20:02 搜索“组件库”。</p>
                </ChatToolCall>
                <ChatToolCall
                  label="检查结果写入位置"
                  state="complete"
                  collapsible
                  detail="回调直接替换列表，没有身份核对。"
                >
                  <p>修复位置：结果提交回调。</p>
                </ChatToolCall>
              </ChatProcess>
              <ChatBubble variant="plain">
                <p>取消旧请求可以减少工作，但仍需要在写入前作最后一次确认：</p>
                <pre tabIndex={0} aria-label="建议代码">
                  <code>{`if (currentRequest === request) {
  renderResults(results);
}`}</code>
                </pre>
              </ChatBubble>
              <ChatSources items={[reference]} />
            </ChatMessage>
            <ChatMessage
              role="user"
              author="你"
              status="error"
              surface="none"
              footer={<span>发送失败，草稿仍在本地。</span>}
              actions={
                <ChatMessageActions>
                  <Button
                    variant="quiet"
                    size="small"
                    data-message-choice="已保留重试内容（本地示例）"
                  >
                    重试发送
                  </Button>
                </ChatMessageActions>
              }
            >
              <ChatBubble variant="filled">
                <p>按这个方案修改，顺便补一个乱序返回的测试。</p>
              </ChatBubble>
            </ChatMessage>
          </ChatMessageList>
        </ChatFrame>
        <p className="workshop-feedback" role="status" data-message-result>
          操作仅反馈到本地示例。
        </p>
      </Stack>
    </Container>
  ),
  setup({ root, onCleanup }) {
    const click = (event: Event) => {
      const button = (event.target as Element).closest<HTMLElement>("[data-message-choice]");
      if (button)
        root.querySelector("[data-message-result]")!.textContent = button.dataset.messageChoice!;
    };
    root.addEventListener("click", click);
    onCleanup(() => root.removeEventListener("click", click));
  },
});

export const ChatProcessDetailStory = defineStory({
  id: "chat-process-detail",
  title: "过程 · 摘要与执行细节",
  group: "对话组件",
  groupOrder: 60,
  component: "ChatProcess",
  variant: "折叠与展开",
  description: "过程摘要保留位置，执行细节按需展开；展开和关闭由原生details提供。",
  render: () => (
    <Container>
      <Stack>
        <ChatProcess label="检查请求顺序 · 已完成">
          <p>查询按输入顺序发出，但响应按网络完成顺序返回。</p>
          <p>只提交当前请求的结果，避免旧响应覆盖。</p>
        </ChatProcess>
        <ChatProcess label="等待验证 · 1 项" open>
          <ChatToolCall
            label="验证快速连续输入与清空搜索词后的列表恢复"
            state="waiting"
            detail="需要连接真实服务后执行。"
          />
        </ChatProcess>
      </Stack>
    </Container>
  ),
});

export const ChatSourcesDetailStory = defineStory({
  id: "chat-sources-detail",
  title: "来源 · 标题与说明",
  group: "对话组件",
  groupOrder: 60,
  component: "ChatSources",
  variant: "展开来源",
  description: "来源与回答分层；标题用于定位，说明帮助判断为什么需要打开它。",
  render: () => (
    <Container>
      <Stack>
        <p>核对请求取消和响应处理时，可以打开下面的参考。</p>
        <ChatSources
          open
          items={[
            reference,
            {
              title: "Fetch API：请求与响应的处理",
              url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API",
              description: "请求生命周期与返回结果的语义。",
            },
          ]}
        />
      </Stack>
    </Container>
  ),
});

const rows = (wrap: boolean): Child[] => {
  const shape = (item: Child): Child =>
    wrap ? <div style={{ display: "contents" }}>{item}</div> : item;
  return [
    shape(
      <ChatMessageListItem>
        <ChatMessage role="user" author="你" surface="none">
          <ChatBubble>连续回复不用隔那么远。</ChatBubble>
        </ChatMessage>
      </ChatMessageListItem>,
    ),
    shape(
      <ChatMessageListItem>
        <ChatMessage
          role="assistant"
          author="Assistant"
          avatar={<Icon name="brain" />}
          surface="none"
        >
          <ChatBubble>
            <p>连续消息会保持紧凑。</p>
          </ChatBubble>
        </ChatMessage>
      </ChatMessageListItem>,
    ),
    shape(
      <ChatMessageListItem continuation>
        <ChatMessage
          role="assistant"
          author="Assistant"
          avatar={<Icon name="brain" />}
          continuation
          surface="none"
        >
          <ChatBubble>
            <p>同一轮回答的下一段只隔一小步。</p>
          </ChatBubble>
        </ChatMessage>
      </ChatMessageListItem>,
    ),
    shape(
      <ChatMessageListItem>
        <ChatMessage role="tool" author="worker" surface="none">
          <ChatBubble variant="plain">
            <p>委托的行紧贴它报告的那次工作。</p>
          </ChatBubble>
        </ChatMessage>
      </ChatMessageListItem>,
    ),
  ];
};

export const ChatMessageRowsStory = defineStory({
  id: "chat-message-rows",
  title: "消息列表 · 行距与续接",
  group: "对话组件",
  groupOrder: 60,
  component: "ChatMessageList",
  variant: "两种挂载形状",
  description:
    "行距由列表列声明、由行自己读取，因此逐条挂载时插入的无布局容器不改变结果。用户消息开新一轮，续接回答靠近上一条，工具行靠近它报告的工作。",
  covers: [
    "ChatMessageListItem",
    "ChatMessageListContent",
    "continuation",
    "tool row pitch",
    "layout-neutral wrapper",
  ],
  render: () => (
    <Container>
      <Stack>
        <ChatFrame>
          <ChatMessageList ariaLabel="直接子项的消息列表">
            <ChatMessageListContent>{rows(false)}</ChatMessageListContent>
          </ChatMessageList>
        </ChatFrame>
        <ChatFrame>
          <ChatMessageList ariaLabel="逐条挂载的消息列表">
            <ChatMessageListContent>{rows(true)}</ChatMessageListContent>
          </ChatMessageList>
        </ChatFrame>
      </Stack>
    </Container>
  ),
});
