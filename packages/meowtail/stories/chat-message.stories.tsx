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
  Icon,
  Stack,
} from "meowtail";
import { Measure, Note } from "./specimen";

const reference = {
  title: "AbortController",
  url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController",
  description: "Browser interface for canceling async requests.",
};

export const ChatToolSequenceStory = defineStory({
  id: "chat-tool-sequence",
  title: "Message · Tool call sequence",
  group: "Conversation components",
  groupOrder: 60,
  component: "ChatToolCall",
  description:
    "Tool actions and their target stay on one row; results expand on demand, and non-complete states always show clearly. The static example runs no tools.",
  render: () => (
    <Measure>
      <ChatFrame>
        <ChatMessageList ariaLabel="Tool call sequence">
          <ChatMessage role="user" author="You" surface="none">
            <ChatBubble>
              Check whether an old response still writes to the list after a request is canceled.
            </ChatBubble>
          </ChatMessage>
          <ChatMessage role="assistant" author="Assistant" surface="none">
            <ChatBubble>
              <p>I'll first look at where requests and results are submitted.</p>
            </ChatBubble>
            <ChatProcess label="Read, search · 3 calls" icon={<Icon name="search" />}>
              <ChatToolCall
                label="Read"
                summary="src/search/request.ts"
                icon={<Icon name="file" />}
                collapsible
              >
                <pre>
                  <code>const request = await fetch(url, options);</code>
                </pre>
              </ChatToolCall>
              <ChatToolCall
                label="Search"
                summary="currentRequest · src/search"
                icon={<Icon name="search" />}
                collapsible
              >
                <p>Found 2 request identity checks.</p>
              </ChatToolCall>
              <ChatToolCall
                label="Read"
                summary="src/search/results.ts"
                icon={<Icon name="file" />}
                collapsible
              >
                <p>The request identity is not checked before submitting results.</p>
              </ChatToolCall>
            </ChatProcess>
            <ChatBubble>
              <p>
                The result write path is missing an identity check; the verification states follow.
              </p>
            </ChatBubble>
            <ChatProcess label="Run verification · 4 items" open>
              <ChatToolCall
                label="Run"
                summary="bun test search/request.test.ts"
                state="running"
                collapsible
              >
                <p>Waiting for process output.</p>
              </ChatToolCall>
              <ChatToolCall
                label="Read"
                summary="Restricted workspace configuration"
                state="waiting"
                collapsible
              >
                <p>Waiting for permission confirmation.</p>
              </ChatToolCall>
              <ChatToolCall label="Run" summary="Remote connection check" state="error" collapsible>
                <p>The connection failed; nothing on the remote was changed.</p>
              </ChatToolCall>
              <ChatToolCall
                label="Run"
                summary="Previous interrupted verification"
                state="unknown"
                collapsible
              >
                <p>There is no final receipt, so the execution result cannot be confirmed.</p>
              </ChatToolCall>
            </ChatProcess>
          </ChatMessage>
        </ChatMessageList>
      </ChatFrame>
    </Measure>
  ),
});

export const ChatToolCallActionStory = defineStory({
  id: "chat-tool-call-action",
  title: "Tool row · Actions and expansion",
  group: "Conversation components",
  groupOrder: 60,
  component: "ChatToolCall",
  variant: "Host actions",
  description:
    "A row has two interactions: expand its own body, or let the host run an action. Both are the same focusable control, with consistent row metrics, state and hover glyph. The example only echoes local state and runs no command.",
  covers: ["onActivate", "button header", "collapsible body", "row geometry"],
  render: () => {
    const feedback = signal("Not activated yet");
    return (
      <Measure>
        <Stack>
          <ChatFrame>
            <ChatMessageList ariaLabel="The two interactions of a tool row">
              <ChatToolCall
                label="Run command"
                summary="bun test search/request.test.ts"
                icon={<Icon name="terminal" />}
                onActivate={() => {
                  feedback.value = "Activated: the host opens the record for this command.";
                }}
                data-tool-action="demo"
              />
              <ChatToolCall
                label="Read"
                summary="src/search/request.ts"
                icon={<Icon name="file" />}
                collapsible
              >
                <p>The expanded row leaves the result in place.</p>
              </ChatToolCall>
              <ChatToolCall
                label="Run"
                summary="Remote connection check"
                icon={<Icon name="terminal" />}
                state="error"
              />
            </ChatMessageList>
          </ChatFrame>
          <Note role="status" data-tool-action-result>
            {feedback}
          </Note>
        </Stack>
      </Measure>
    );
  },
});

export const ChatMessageCompositionStory = defineStory({
  id: "chat-message-composition",
  title: "Message · Text, files and evidence",
  group: "Conversation components",
  groupOrder: 60,
  component: "ChatMessage",
  variant: "Composition and surface",
  description:
    "The message owns identity and arrangement; the Bubble owns the reading surface. Attachments and process can sit outside the bubble, and actions only echo local state.",
  covers: [
    "ChatMessage header/footer/surface",
    "ChatBubble auto/plain/filled",
    "ChatMessageActions",
    "mixed content",
  ],
  render: () => (
    <Measure>
      <Stack>
        <ChatFrame>
          <ChatMessageList ariaLabel="Message composition example">
            <ChatMessage
              role="user"
              author="You"
              timestamp="14:20"
              surface="none"
              footer={<span>Delivered</span>}
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
                <p>
                  This is the log from continuous searches. Help me understand why an old result
                  overwrote a new one; give me a suggestion first.
                </p>
              </ChatBubble>
            </ChatMessage>
            <ChatMessage
              role="assistant"
              author="Assistant"
              surface="none"
              header={
                <>
                  <strong>Assistant</strong>
                  <span>Investigation record · Static example</span>
                </>
              }
              footer={<span>No real request ran; the suggestion waits for your confirmation.</span>}
              actions={
                <ChatMessageActions>
                  <Button
                    variant="outline"
                    size="small"
                    data-message-choice="Kept the fix suggestion"
                  >
                    Keep suggestion
                  </Button>
                  <Button
                    variant="quiet"
                    size="small"
                    data-message-choice="Marked for further checking"
                  >
                    Keep checking
                  </Button>
                </ChatMessageActions>
              }
            >
              <ChatBubble>
                <p>
                  <strong>
                    The old request returned later, and the write did not confirm that it was still
                    the current request.
                  </strong>
                  Keep the interface and check the request identity before submitting results.
                </p>
              </ChatBubble>
              <ChatProcess label="View investigation evidence · 2 items">
                <ChatToolCall
                  label="Read request log"
                  state="complete"
                  collapsible
                  detail="In this example the second request finished first."
                >
                  <p>
                    14:20:01 searched for “components”; 14:20:02 searched for “component library”.
                  </p>
                </ChatToolCall>
                <ChatToolCall
                  label="Check the result write path"
                  state="complete"
                  collapsible
                  detail="The callback replaces the list directly, without an identity check."
                >
                  <p>Fix location: the result submission callback.</p>
                </ChatToolCall>
              </ChatProcess>
              <ChatBubble variant="plain">
                <p>
                  Canceling the old request can reduce work, but a final check before writing is
                  still needed:
                </p>
                <pre tabIndex={0} aria-label="Suggested code">
                  <code>{`if (currentRequest === request) {
  renderResults(results);
}`}</code>
                </pre>
              </ChatBubble>
              <ChatSources items={[reference]} />
            </ChatMessage>
            <ChatMessage
              role="user"
              author="You"
              status="error"
              surface="none"
              footer={<span>Send failed; the draft is still local.</span>}
              actions={
                <ChatMessageActions>
                  <Button
                    variant="quiet"
                    size="small"
                    data-message-choice="Kept the retry content (local example)"
                  >
                    Retry send
                  </Button>
                </ChatMessageActions>
              }
            >
              <ChatBubble variant="filled">
                <p>Apply this fix, and add a test for out-of-order responses while you're at it.</p>
              </ChatBubble>
            </ChatMessage>
          </ChatMessageList>
        </ChatFrame>
        <Note role="status" data-message-result>
          Actions only report back to the local example.
        </Note>
      </Stack>
    </Measure>
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
  title: "Process · Summary and execution detail",
  group: "Conversation components",
  groupOrder: 60,
  component: "ChatProcess",
  variant: "Collapse and expand",
  description:
    "The process summary keeps its position and execution details expand on demand; expansion and collapse come from native details.",
  render: () => (
    <Measure>
      <Stack>
        <ChatProcess label="Check request order · Completed">
          <p>Queries are sent in input order, but responses return in network completion order.</p>
          <p>Submit only the current request's results to avoid overwrites from old responses.</p>
        </ChatProcess>
        <ChatProcess label="Waiting for verification · 1 item" open>
          <ChatToolCall
            label="Verify quick successive input and list recovery after clearing the search term"
            state="waiting"
            detail="Requires a connection to the real service."
          />
        </ChatProcess>
      </Stack>
    </Measure>
  ),
});

export const ChatSourcesDetailStory = defineStory({
  id: "chat-sources-detail",
  title: "Sources · Titles and descriptions",
  group: "Conversation components",
  groupOrder: 60,
  component: "ChatSources",
  variant: "Expanded sources",
  description:
    "Sources are layered away from the answer; the title locates the source and the description helps judge why to open it.",
  render: () => (
    <Measure>
      <Stack>
        <p>
          When checking request cancellation and response handling, you can open the references
          below.
        </p>
        <ChatSources
          open
          items={[
            reference,
            {
              title: "Fetch API: Handling requests and responses",
              url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API",
              description: "The request lifecycle and the meaning of returned results.",
            },
          ]}
        />
      </Stack>
    </Measure>
  ),
});

const rows = (wrap: boolean): Child[] => {
  const shape = (item: Child): Child =>
    wrap ? <div style={{ display: "contents" }}>{item}</div> : item;
  return [
    shape(
      <ChatMessageListItem>
        <ChatMessage role="user" author="You" surface="none">
          <ChatBubble>Consecutive replies don't need that much space.</ChatBubble>
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
            <p>Consecutive messages stay compact.</p>
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
            <p>The next part of the same answer is only a small step away.</p>
          </ChatBubble>
        </ChatMessage>
      </ChatMessageListItem>,
    ),
    shape(
      <ChatMessageListItem>
        <ChatMessage role="tool" author="worker" surface="none">
          <ChatBubble variant="plain">
            <p>A delegated row sits close to the work it reports.</p>
          </ChatBubble>
        </ChatMessage>
      </ChatMessageListItem>,
    ),
  ];
};

export const ChatMessageRowsStory = defineStory({
  id: "chat-message-rows",
  title: "Message list · Row spacing and continuation",
  group: "Conversation components",
  groupOrder: 60,
  component: "ChatMessageList",
  variant: "Two mounting shapes",
  description:
    "The list column declares the row pitch and each row reads it, so layout-neutral wrappers inserted when mounting row by row do not change the result. A user message starts a new round, a continuation answer sits close to the previous one, and a tool row sits close to the work it reports.",
  covers: [
    "ChatMessageListItem",
    "ChatMessageListContent",
    "continuation",
    "tool row pitch",
    "layout-neutral wrapper",
  ],
  render: () => (
    <Measure>
      <Stack>
        <ChatFrame>
          <ChatMessageList ariaLabel="Message list with direct children">
            <ChatMessageListContent>{rows(false)}</ChatMessageListContent>
          </ChatMessageList>
        </ChatFrame>
        <ChatFrame>
          <ChatMessageList ariaLabel="Message list mounted row by row">
            <ChatMessageListContent>{rows(true)}</ChatMessageListContent>
          </ChatMessageList>
        </ChatFrame>
      </Stack>
    </Measure>
  ),
});
