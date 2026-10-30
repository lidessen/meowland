import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  ChatBubble,
  ChatComposer,
  ChatFrame,
  ChatHeader,
  ChatMessage,
  ChatMessageActions,
  ChatMessageList,
  ChatStatus,
  Icon,
  IconButton,
  Inline,
} from "meowtail";
import { Measure, Specimen, Specimens } from "./specimen";

export const ChatFrameStory = defineStory({
  id: "chat-frame",
  title: "Chat Frame · Header, messages and composer",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "ChatFrame",
  variant: "One conversation surface",
  description:
    "The frame is the conversation's outer surface: the header names it, the messages take the remaining height, and the composer keeps its own inset at the bottom.",
  render: () => (
    <Measure>
      <div style={{ height: "460px" }}>
        <ChatFrame>
          <ChatHeader
            title="Release checklist"
            status={<ChatStatus tone="online" label="Connected" />}
          />
          <ChatMessageList ariaLabel="Release checklist conversation">
            <ChatMessage role="user" author="You">
              <p>What is left before we can tag the release?</p>
            </ChatMessage>
            <ChatMessage role="assistant" author="Assistant">
              <p>
                Two things: the changelog entry for the composer fix, and a final run of the browser
                tests on the release branch.
              </p>
            </ChatMessage>
          </ChatMessageList>
          <ChatComposer placeholder="Ask about the release…" />
        </ChatFrame>
      </div>
    </Measure>
  ),
});

export const ChatBubbleStory = defineStory({
  id: "chat-bubble",
  title: "Chat Bubble · Automatic, plain and filled surfaces",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "ChatBubble",
  variant: "Surfaces",
  description:
    "A bubble is only the reading surface of a message. Automatic follows the message role, plain reads like a document, and filled marks a message that stands apart.",
  render: () => (
    <Measure>
      <Specimens>
        <Specimen label="Automatic" note="The surface follows the role of the message around it.">
          <ChatMessageList ariaLabel="Automatic bubbles">
            <ChatMessage role="user" author="You" surface="none">
              <ChatBubble>
                <p>Can you shorten the onboarding email?</p>
              </ChatBubble>
            </ChatMessage>
            <ChatMessage role="assistant" author="Assistant" surface="none">
              <ChatBubble>
                <p>Here is a version at half the length, keeping the three setup steps.</p>
              </ChatBubble>
            </ChatMessage>
          </ChatMessageList>
        </Specimen>
        <Specimen label="Plain and filled" note="Chosen explicitly, whatever the role.">
          <ChatMessageList ariaLabel="Plain and filled bubbles">
            <ChatMessage role="assistant" author="Assistant" surface="none">
              <ChatBubble variant="plain">
                <p>A plain bubble reads like part of the page.</p>
              </ChatBubble>
              <ChatBubble variant="filled">
                <p>A filled bubble sets one passage apart, such as a quoted draft.</p>
              </ChatBubble>
            </ChatMessage>
          </ChatMessageList>
        </Specimen>
      </Specimens>
    </Measure>
  ),
});

export const ChatMessageActionsStory = defineStory({
  id: "chat-message-actions",
  title: "Chat Message Actions · Copy, retry and feedback",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "ChatMessageActions",
  variant: "Actions under a reply",
  description:
    "The actions that belong to one message sit under it as a quiet row of icon buttons, each named for what it does to that message. They appear when the pointer rests on the message or focus enters it, and stay visible on touch screens.",
  render: () => (
    <Measure>
      <Specimen label="Under a reply" note="Point at the reply, or press Tab, to show its actions.">
        <ChatMessageList ariaLabel="Message with actions">
          <ChatMessage
            role="assistant"
            author="Assistant"
            actions={
              <ChatMessageActions>
                <IconButton label="Copy reply">
                  <Icon name="copy" />
                </IconButton>
                <IconButton label="Regenerate reply">
                  <Icon name="refresh-cw" />
                </IconButton>
                <IconButton label="Good reply">
                  <Icon name="thumbs-up" />
                </IconButton>
                <IconButton label="Bad reply">
                  <Icon name="thumbs-down" />
                </IconButton>
              </ChatMessageActions>
            }
          >
            <p>
              The import fails because the package exports only its built files. Run the build once,
              then start the dev server again.
            </p>
          </ChatMessage>
        </ChatMessageList>
      </Specimen>
    </Measure>
  ),
});

export const ChatStatusStory = defineStory({
  id: "chat-status",
  title: "Chat Status · Connection and activity tones",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "ChatStatus",
  variant: "Tones",
  description:
    "A dot and a word say what the conversation is doing now. The host decides the state; the tone only paints it.",
  render: () => (
    <Specimens>
      <Specimen label="Tones">
        <Inline gap="compact">
          <ChatStatus tone="online" label="Connected" />
          <ChatStatus tone="busy" label="Working" />
          <ChatStatus tone="waiting" label="Waiting for your answer" />
          <ChatStatus tone="error" label="Connection lost" />
          <ChatStatus tone="idle" label="Idle" />
        </Inline>
      </Specimen>
      <Specimen label="In a header" width="content">
        <ChatHeader
          title="Data import"
          status={<ChatStatus tone="busy" label="Importing 3 of 12 files" />}
        />
      </Specimen>
    </Specimens>
  ),
});
