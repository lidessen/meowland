import { h, type Child, type ThemeRules } from "meowjsx";
import {
  ChatComposer,
  ChatAttachments,
  type ChatAttachmentItem,
  ChatFrame,
  ChatHeader,
  ChatMessage,
  ChatMessageActions,
  ChatMessageList,
  ChatStatus,
  ChatToolCall,
  ChatSources,
} from "../../src/index";

const chat: JSX.Element = (
  <ChatFrame>
    <ChatHeader
      title="Assistant"
      description="Optional description"
      status={<ChatStatus label="Online" tone="online" />}
      actions={<button type="button">Run</button>}
    />
    <ChatMessageList>
      <ChatMessage
        role="assistant"
        author="Assistant"
        timestamp="Just now"
        actions={
          <ChatMessageActions>
            <button type="button">Copy</button>
          </ChatMessageActions>
        }
      >
        <p>One message</p>
        <ChatToolCall label="search" state="complete" detail="Completed" />
      </ChatMessage>
    </ChatMessageList>
    <ChatComposer
      placeholder="Input"
      onSubmit={(event) => event.preventDefault()}
      hint="Enter to send"
    />
  </ChatFrame>
);

// @ts-expect-error ChatHeader needs a title.
const missingTitle = <ChatHeader />;

// @ts-expect-error ChatStatus needs a label.
const missingStatusLabel = <ChatStatus />;

// @ts-expect-error ChatMessage needs a role and an author.
const missingMessageIdentity = <ChatMessage>Content</ChatMessage>;

const children: Child = chat;
const sources = <ChatSources items={[{ title: "Document", url: "https://example.com" }]} />;
const tool = <ChatToolCall label="Read" state="running" collapsible />;
const unconfirmedTool = <ChatToolCall label="Unconfirmed result" state="unknown" />;
const sourceRules = { "chat-sources": { summary: { className: "summary" } } } satisfies ThemeRules;
// @ts-expect-error A source must have a URL.
const invalidSource = <ChatSources items={[{ title: "Missing address" }]} />;
// @ts-expect-error Tool state is a finite lifecycle.
const invalidTool = <ChatToolCall label="Read" state="magic" />;
void sources;
void tool;
void unconfirmedTool;
void sourceRules;
void invalidSource;
void invalidTool;
void children;
void missingTitle;
void missingStatusLabel;
void missingMessageIdentity;

const attachments: readonly ChatAttachmentItem[] = [
  { id: "image", name: "cat.png", url: "/cat.png", mediaType: "image/png" },
  { id: "file", name: "notes.txt", url: "/notes.txt", mediaType: "text/plain", sizeBytes: 1024 },
];
const attachmentView: JSX.Element = <ChatAttachments items={attachments} label="Files" />;
const attachmentRules = {
  "chat-attachments": {
    root: {},
    image: {},
    preview: {},
    file: {},
    icon: {},
    details: {},
    name: {},
    size: {},
  },
} satisfies ThemeRules;
// @ts-expect-error Items are required.
const missingItems = <ChatAttachments />;
// @ts-expect-error Each item needs a URL.
const missingURL = <ChatAttachments items={[{ id: "x", name: "x", mediaType: "text/plain" }]} />;
// @ts-expect-error Byte sizes must be numbers.
const invalidSize = <ChatAttachments items={[{ ...attachments[0], sizeBytes: "1024" }]} />;
const invalidAttachmentRules = {
  "chat-attachments": {
    // @ts-expect-error Only registered attachment parts are available.
    unknown: {},
  },
} satisfies ThemeRules;
void attachmentView;
void attachmentRules;
void missingItems;
void missingURL;
void invalidSize;
void invalidAttachmentRules;
