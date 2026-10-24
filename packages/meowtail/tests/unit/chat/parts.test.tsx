import { expect, test } from "bun:test";
import { createRuntime, createThemePlugin, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import {
  ChatAttachments,
  ChatComposer,
  ChatFrame,
  ChatHeader,
  ChatMessage,
  ChatMessageActions,
  ChatMessageList,
  ChatStatus,
  ChatToolCall,
  installMeowUI,
  meowUIComponents,
} from "meowtail";

test("real chat parts expose stable selectors while retaining caller markup", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const web = createWebRenderer(runtime);
  const view = (
    <ChatFrame className="host">
      <ChatHeader
        eyebrow="Chat"
        title="Assistant"
        description="Description"
        status={<ChatStatus label="Online" />}
        actions={<button>Settings</button>}
      />
      <ChatMessageList>
        <ChatMessage
          role="assistant"
          author="Assistant"
          timestamp="12:00"
          status="streaming"
          avatar="A"
          actions={<ChatMessageActions>Copy</ChatMessageActions>}
        >
          Hello
          <ChatToolCall label="Read" detail="Details">
            Result
          </ChatToolCall>
          <ChatAttachments
            items={[
              { id: "image", name: "cat.png", url: "/cat.png", mediaType: "image/png" },
              {
                id: "file",
                name: "notes.txt",
                url: "/notes.txt",
                mediaType: "text/plain",
                sizeBytes: 1024,
              },
            ]}
          />
        </ChatMessage>
      </ChatMessageList>
      <ChatComposer hint="Enter to send" />
    </ChatFrame>
  );
  const html = web.renderToHtml(view);
  for (const part of [
    "chat-frame/root",
    "chat-header/root",
    "chat-header/identity",
    "chat-header/eyebrow",
    "chat-header/title",
    "chat-header/description",
    "chat-header/status",
    "chat-header/actions",
    "chat-status/root",
    "chat-status/dot",
    "chat-status/label",
    "chat-message-list/root",
    "chat-message/root",
    "chat-message/avatar",
    "chat-message/body",
    "chat-message/meta",
    "chat-message/author",
    "chat-message/time",
    "chat-message/status",
    "chat-message/content",
    "chat-message/actions",
    "chat-message-actions/root",
    "chat-tool-call/root",
    "chat-tool-call/header",
    "chat-tool-call/icon",
    "chat-tool-call/label",
    "chat-tool-call/status",
    "chat-tool-call/detail",
    "chat-tool-call/body",
    "chat-attachments/root",
    "chat-attachments/image",
    "chat-attachments/preview",
    "chat-attachments/file",
    "chat-attachments/icon",
    "chat-attachments/details",
    "chat-attachments/name",
    "chat-attachments/size",
    "chat-composer/root",
    "chat-composer/field",
    "chat-composer/input",
    "chat-composer/hint",
    "chat-composer/actions",
    "chat-composer/submit",
  ])
    expect(html).toContain(`data-meowui-part="${part}"`);
  expect(html).toContain('class="host"');
  expect(html).toContain('<h2 data-meowui-part="chat-header/title">Assistant</h2>');
  expect(html).toContain('role="status"');
  expect(html).toContain("data-chat-input");
  expect(html).toContain("Hello");
  expect(html).toContain("Result");
});

test("theme variants use original props while components retain semantic state", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const web = createWebRenderer(runtime);
  for (const role of ["user", "assistant", "system", "tool"] as const) {
    const html = web.renderToHtml(<ChatMessage role={role} author="Author" />);
    expect(html).toContain('data-chat-role="' + role + '"');
    expect(html).toContain('data-chat-status="complete"');
  }
  for (const tone of ["online", "busy", "waiting", "error", "idle"] as const) {
    const html = web.renderToHtml(<ChatStatus label="Status" tone={tone} />);
    expect(html).toContain('data-option-chat-status-tone="' + tone + '"');
  }
  for (const [state, label] of [
    ["running", "Running"],
    ["complete", "Completed"],
    ["waiting", "Waiting"],
    ["error", "Error"],
  ] as const) {
    const html = web.renderToHtml(<ChatToolCall label="Tool" state={state} />);
    expect(html).toContain('data-tool-state="' + state + '"');
    expect(html).toContain(label);
  }
});

test("individual metadata parts can be themed without touching nested caller content", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const web = createWebRenderer(runtime);
  runtime.use(
    createThemePlugin({
      name: "host-author",
      resolve({ component }) {
        return component.component === "chat-message" && component.part === "author"
          ? { className: "custom-author" }
          : null;
      },
    }),
  );
  const html = web.renderToHtml(
    <ChatMessage role="user" author="Me" timestamp="12:00">
      <strong>Nested content</strong>
    </ChatMessage>,
  );
  expect(html).toContain(
    '<strong data-meowui-part="chat-message/author" class="custom-author">Me</strong>',
  );
  expect(html).toContain('<time data-meowui-part="chat-message/time">12:00</time>');
  expect(html).toContain("<strong>Nested content</strong>");
});
