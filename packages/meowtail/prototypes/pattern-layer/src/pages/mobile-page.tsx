import { h, type Child } from "meowjsx";
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

/**
 * Author scene: the page is a PageFrame with slots. No style/className is used
 * here; the bar, alert, scroll body, composer panel and primitives own layout.
 */
export function MobilePage(): Child {
  return (
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
          hint="Enter for a new line · Use Send to submit"
          hintId="mobile-composer-hint"
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
              books you are reading; keep the cable you are using in place and tuck the extra length
              behind the desk.
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
  );
}
