import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Alert,
  AppBar,
  Button,
  ChatConversation,
  ChatMessage,
  ChatMessageList,
  ChatMessageListDate,
  ChatStatus,
  ComposerPanel,
  Icon,
  IconButton,
  PageFrame,
} from "meowtail";

export const AppShellStory = defineStory({
  id: "app-shell",
  title: "App Shell · Header, notice, messages and composer",
  group: "Composition examples",
  groupOrder: 110,
  variant: "Mobile conversation page",
  description:
    "One public composition for a small conversation screen: PageFrame owns the header, notice, scroll body and footer; AppBar carries identity and actions; ComposerPanel owns the writing surface.",
  covers: [
    "PageFrame notice and footer",
    "AppBar title, status and actions",
    "Alert bar as a page notice",
    "ComposerPanel footer",
  ],
  render: () => (
    <div
      style={{
        height: "min(680px, calc(100dvh - 32px))",
        minHeight: 0,
        width: "min(100%, 430px)",
        margin: "0 auto",
        overflow: "hidden",
        border: "1px solid var(--ui-line-control)",
        borderRadius: "14px",
      }}
    >
      <PageFrame
        variant="workspace"
        header={
          <AppBar
            title="Studio MacBook"
            status={<ChatStatus label="Offline · Draft saved" tone="waiting" />}
            actions={[
              <Button variant="quiet" size="small">
                Reconnect
              </Button>,
              <IconButton label="Conversation actions">
                <Icon name="menu" />
              </IconButton>,
            ]}
          />
        }
        notice={
          <Alert
            layout="bar"
            tone="warning"
            actions={
              <Button variant="quiet" size="small">
                View receipt
              </Button>
            }
          >
            Last submission unverified; draft kept.
          </Alert>
        }
        footer={
          <ComposerPanel
            placeholder="Type a message"
            inputLabel="Message"
            submitLabel="Send message"
            submitContent={<Icon name="arrow-up" />}
          >
            <IconButton label="Add">
              <Icon name="plus" />
            </IconButton>
          </ComposerPanel>
        }
      >
        <ChatConversation ariaLabel="Conversation">
          <ChatMessageList ariaLabel="Messages">
            <ChatMessageListDate label="Today 20:40" />
            <ChatMessage role="assistant" author="Assistant" timestamp="20:40">
              <p>
                You do not have to clear the desk completely. Keep a small “in progress” area so
                things have a fixed home without having to dig them out every time.
              </p>
              <p>
                Leave a book-sized area on the other side of your dominant hand for the two or three
                books you are reading; keep the cable you are using in place and tuck the extra
                length behind the desk.
              </p>
            </ChatMessage>
            <ChatMessage role="user" author="You" timestamp="20:41">
              <p>
                A few more conditions: the desk is by the window and gets afternoon sun; I want my
                usual pen, headphones and two current books within reach.
              </p>
            </ChatMessage>
            <ChatMessage role="assistant" author="Assistant" timestamp="20:42">
              <p>
                That works. Keep the window side for the pen, headphones and those two books; split
                cables into “in use / spare / archive” in three places.
              </p>
            </ChatMessage>
          </ChatMessageList>
        </ChatConversation>
      </PageFrame>
    </div>
  ),
});
