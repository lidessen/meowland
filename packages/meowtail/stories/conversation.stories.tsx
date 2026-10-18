import { uiTokens } from "meowtail/theme";
import { h, signal, type Child } from "meowjsx";
import { defineStory } from "meowbook";
import { ChatConversation, ChatMessageList, ChatMessage, Button, Stack, Inline } from "meowtail";

export const ConversationReading = defineStory({
  id: "chat-conversation",
  title: "Conversation reading · Live updates and review",
  component: "ChatConversation",
  variant: "Reading continuity",
  group: "Conversation components",
  groupOrder: 50,
  description:
    "Read upward first, then add replies; the reading position stays put. The return action sits after the body viewport and does not cover earlier text; after returning to the latest message it follows new content again. The buttons only update the local example, and collapsing then expanding remounts the reading region.",
  covers: [
    "ChatConversation",
    "ChatMessageList",
    "streaming",
    "scroll",
    "normal-flow latest",
    "cleanup",
  ],
  render: () => {
    let count = 8;
    const renderMessages = (): Child =>
      Array.from({ length: count }, (_, index) => (
        <ChatMessage
          role={index % 2 ? "assistant" : "user"}
          author={index % 2 ? "Assistant" : "You"}
        >
          <p>
            {index % 2
              ? `Reply ${index + 1}: I checked the narrow-screen layout of the page. Long file names must keep their full name, and tool feedback should stay next to its message.`
              : `Message ${index + 1}: Continue checking the reading experience and list the items that need my decision.`}
          </p>
          {index % 2 ? (
            <p>
              This paragraph is local content for observing scrolling. While you review earlier
              messages, a new reply does not force you away from your current reading position;
              return to the latest message when you are ready.
            </p>
          ) : null}
        </ChatMessage>
      ));
    const messages = signal<Child>(renderMessages());
    const latestText = signal("");
    const makeView = () => (
      <ChatConversation
        ariaLabel="Example conversation reading area"
        style={{
          height: "360px",
          border: `1px solid ${uiTokens.border}`,
          borderRadius: `${uiTokens.controlRadius}`,
        }}
      >
        <ChatMessageList>
          {messages}
          <p>{latestText}</p>
        </ChatMessageList>
      </ChatConversation>
    );
    const view = signal<Child>(makeView());
    let mounted = true;
    return (
      <Stack>
        <Inline wrap>
          <Button
            variant="outline"
            onClick={() => {
              count += 1;
              messages.value = renderMessages();
            }}
          >
            Add a reply
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              latestText.value +=
                "Continuing the current reply: check the reading position while content changes.";
            }}
          >
            Continue the current reply
          </Button>
          <Button
            variant="quiet"
            onClick={() => {
              mounted = !mounted;
              view.value = mounted ? makeView() : <p>The reading region is collapsed.</p>;
            }}
          >
            Collapse / expand reading region
          </Button>
        </Inline>
        {view}
      </Stack>
    );
  },
});
