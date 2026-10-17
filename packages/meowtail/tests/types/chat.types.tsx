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
      description="可选说明"
      status={<ChatStatus label="在线" tone="online" />}
      actions={<button type="button">运行</button>}
    />
    <ChatMessageList>
      <ChatMessage
        role="assistant"
        author="Assistant"
        timestamp="刚刚"
        actions={
          <ChatMessageActions>
            <button type="button">复制</button>
          </ChatMessageActions>
        }
      >
        <p>一条消息</p>
        <ChatToolCall label="search" state="complete" detail="已完成" />
      </ChatMessage>
    </ChatMessageList>
    <ChatComposer
      placeholder="输入"
      onSubmit={(event) => event.preventDefault()}
      hint="Enter 发送"
    />
  </ChatFrame>
);

// @ts-expect-error ChatHeader needs a title.
const missingTitle = <ChatHeader />;

// @ts-expect-error ChatStatus needs a label.
const missingStatusLabel = <ChatStatus />;

// @ts-expect-error ChatMessage needs a role and an author.
const missingMessageIdentity = <ChatMessage>内容</ChatMessage>;

const children: Child = chat;
const sources = <ChatSources items={[{ title: "文档", url: "https://example.com" }]} />;
const tool = <ChatToolCall label="读取" state="running" collapsible />;
const unconfirmedTool = <ChatToolCall label="结果未确认" state="unknown" />;
const sourceRules = { "chat-sources": { summary: { className: "summary" } } } satisfies ThemeRules;
// @ts-expect-error A source must have a URL.
const invalidSource = <ChatSources items={[{ title: "缺地址" }]} />;
// @ts-expect-error Tool state is a finite lifecycle.
const invalidTool = <ChatToolCall label="读取" state="magic" />;
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
