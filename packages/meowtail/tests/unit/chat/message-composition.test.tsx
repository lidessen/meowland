import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { ChatBubble, ChatMessage, ChatProcess, ChatSources, installMeowUI } from "meowtail";

test("message role travels through wrappers to independent bubbles without leaking to siblings", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const web = createWebRenderer(runtime);
  const Wrapped = () => (
    <div>
      <ChatBubble>用户内容</ChatBubble>
      <ChatBubble variant="plain">补充内容</ChatBubble>
    </div>
  );
  const view = [
    <ChatMessage role="user" author="你" surface="none" footer="未送达">
      <Wrapped />
    </ChatMessage>,
    <ChatBubble>独立内容</ChatBubble>,
  ];
  const html = web.renderToHtml(view);
  const bubbles = html.match(/<div\b[^>]*data-meowui-part="chat-bubble\/root"[^>]*>/g) ?? [];
  expect(bubbles.map((bubble) => bubble.match(/data-chat-role="([^"]*)"/)?.[1])).toEqual([
    "user",
    "user",
    "assistant",
  ]);
  expect(html.match(/data-option-chat-bubble-variant="auto"/g)).toHaveLength(2);
  expect(html.match(/data-option-chat-bubble-variant="plain"/g)).toHaveLength(1);
  expect(html).toContain('data-meowui-part="chat-message/footer"');
  expect(html).toContain("未送达");
});

test("default messages retain a single automatic surface and datetime while custom header replaces metadata", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const web = createWebRenderer(runtime);
  const html = web.renderToHtml(
    <ChatMessage role="user" author="你" timestamp="14:20" dateTime="2026-09-21T14:20:00+08:00">
      内容
    </ChatMessage>,
  );
  expect(html.match(/data-meowui-part="chat-bubble\/root"/g)).toHaveLength(1);
  expect(html).toContain('data-chat-role="user"');
  expect(html).toContain('datetime="2026-09-21T14:20:00+08:00"');
  const custom = web.renderToHtml(
    <ChatMessage
      role="assistant"
      author="Assistant"
      header={<strong>自定义身份</strong>}
      surface="none"
    >
      独立内容
    </ChatMessage>,
  );
  expect(custom).toContain("自定义身份");
  expect(custom).not.toContain('data-meowui-part="chat-message/meta"');
  expect(custom).not.toContain('data-meowui-part="chat-bubble/root"');
});

test("process and sources retain native disclosures and reject unsafe source URLs", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const web = createWebRenderer(runtime);
  const html = web.renderToHtml([
    <ChatProcess label="排查过程" open>
      细节
    </ChatProcess>,
    <ChatSources
      items={[
        { title: "规范", url: "https://example.com/spec" },
        { title: "危险链接", url: "javascript:alert(1)" },
      ]}
    />,
  ]);
  expect((html.match(/<details/g) ?? []).length).toBe(2);
  expect(html).toContain("<summary");
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain('href="https://example.com/spec"');
  expect(html).toContain('rel="noreferrer"');
  expect(html).not.toContain("javascript:");
  expect(html).not.toContain("危险链接");
});
