import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { Button, Inline, Stack } from "meowtail";
import {
  ChatConversation,
  ChatConversationLatest,
  ChatMessageList,
  ChatMessageListContent,
} from "meowtail/chat";
import { defineStory } from "meowbook";

const sentence =
  "Read this confirmed result carefully. Long prose keeps the historical reading view on real text lines instead of replacing the text with a whole block frame. ";

function conversationFixture(complete: boolean, latestLabel = "Return to latest") {
  const appended = signal("");
  const hidden = signal(true);
  let viewport: HTMLElement | undefined;
  const read = () => {
    if (viewport)
      hidden.value = viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop <= 24;
  };
  const contents = (
    <ChatMessageList>
      <ChatMessageListContent>
        <p data-latest-reading style={{ margin: 0 }}>
          {sentence.repeat(70)}
        </p>
        <p data-latest-reading style={{ margin: 0 }}>
          {appended}
        </p>
      </ChatMessageListContent>
    </ChatMessageList>
  );
  return (
    <Stack>
      <Inline>
        <Button
          onClick={() => {
            appended.value += sentence.repeat(4);
          }}
        >
          Append output
        </Button>
      </Inline>
      {complete ? (
        <ChatConversation
          data-latest-frame
          ariaLabel="Latest reading viewport"
          latestLabel={latestLabel}
          style={{ height: "420px" }}
        >
          {contents}
        </ChatConversation>
      ) : (
        <section
          data-latest-frame
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            height: "420px",
          }}
        >
          <div
            role="region"
            aria-label="Latest reading viewport"
            tabIndex={0}
            style={{ overflowY: "auto", flex: "1 1 0", minHeight: 0 }}
            onScroll={read}
            ref={(element: HTMLElement) => {
              viewport = element;
              queueMicrotask(() => {
                if (viewport) {
                  viewport.scrollTop = viewport.scrollHeight;
                  read();
                }
              });
              return () => {
                viewport = undefined;
              };
            }}
          >
            {contents}
          </div>
          <ChatConversationLatest
            hidden={hidden}
            onClick={() => {
              if (viewport) {
                viewport.focus({ preventScroll: true });
                viewport.scrollTop = viewport.scrollHeight;
                read();
              }
            }}
          >
            {latestLabel}
          </ChatConversationLatest>
        </section>
      )}
    </Stack>
  );
}

export const LatestFragmentFixture = defineStory({
  id: "conversation-latest-fragment",
  title: "Latest fragment with host-owned scrolling",
  render: () => conversationFixture(false),
});

export const LatestCompleteFixture = defineStory({
  id: "conversation-latest-complete",
  title: "Complete conversation with internal scrolling",
  render: () => conversationFixture(true),
});

export const LatestLongLabelFixture = defineStory({
  id: "conversation-latest-long-label",
  title: "Complete conversation with a descriptive latest action",
  render: () =>
    conversationFixture(true, "Return to the latest confirmed response and continue reading"),
});
