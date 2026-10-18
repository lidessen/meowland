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
      <ChatBubble>User content</ChatBubble>
      <ChatBubble variant="plain">Supplemental content</ChatBubble>
    </div>
  );
  const view = [
    <ChatMessage role="user" author="You" surface="none" footer="Not delivered">
      <Wrapped />
    </ChatMessage>,
    <ChatBubble>Standalone content</ChatBubble>,
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
  expect(html).toContain("Not delivered");
});

test("default messages retain a single automatic surface and datetime while custom header replaces metadata", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const web = createWebRenderer(runtime);
  const html = web.renderToHtml(
    <ChatMessage role="user" author="You" timestamp="14:20" dateTime="2026-09-21T14:20:00+08:00">
      Content
    </ChatMessage>,
  );
  expect(html.match(/data-meowui-part="chat-bubble\/root"/g)).toHaveLength(1);
  expect(html).toContain('data-chat-role="user"');
  expect(html).toContain('datetime="2026-09-21T14:20:00+08:00"');
  const custom = web.renderToHtml(
    <ChatMessage
      role="assistant"
      author="Assistant"
      header={<strong>Custom identity</strong>}
      surface="none"
    >
      Standalone content
    </ChatMessage>,
  );
  expect(custom).toContain("Custom identity");
  expect(custom).not.toContain('data-meowui-part="chat-message/meta"');
  expect(custom).not.toContain('data-meowui-part="chat-bubble/root"');
});

test("process and sources retain native disclosures and reject unsafe source URLs", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const web = createWebRenderer(runtime);
  const html = web.renderToHtml([
    <ChatProcess label="Investigation process" open>
      Details
    </ChatProcess>,
    <ChatSources
      items={[
        { title: "Specification", url: "https://example.com/spec" },
        { title: "Unsafe link", url: "javascript:alert(1)" },
      ]}
    />,
  ]);
  expect((html.match(/<details/g) ?? []).length).toBe(2);
  expect(html).toContain("<summary");
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain('href="https://example.com/spec"');
  expect(html).toContain('rel="noreferrer"');
  expect(html).not.toContain("javascript:");
  expect(html).not.toContain("Unsafe link");
});
