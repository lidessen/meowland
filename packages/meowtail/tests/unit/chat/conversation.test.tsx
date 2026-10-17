import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { ChatConversation } from "../../../src/chat/conversation";
import { createChatScroll } from "../../../src/chat/conversation-scroll";

test("conversation follows appended output until the reader scrolls away, then preserves position through growth and resize", () => {
  const viewport = { scrollTop: 0, scrollHeight: 1000, clientHeight: 300 };
  const scroll = createChatScroll(viewport);
  scroll.restore();
  expect(viewport.scrollTop).toBe(700);
  viewport.scrollHeight = 1200;
  scroll.restore();
  expect(viewport.scrollTop).toBe(900);
  viewport.scrollTop = 200;
  scroll.read();
  viewport.scrollHeight = 1400;
  scroll.restore();
  expect(viewport.scrollTop).toBe(200);
  viewport.clientHeight = 240;
  scroll.restore();
  expect(viewport.scrollTop).toBe(200);
  expect(scroll.atLatest()).toBe(false);
  scroll.latest();
  expect(viewport.scrollTop).toBe(1160);
  expect(scroll.atLatest()).toBe(true);
});

test("layout-generated scroll does not change follow intent; temporary hidden state preserves it", () => {
  const viewport = { scrollTop: 400, scrollHeight: 700, clientHeight: 300 };
  const scroll = createChatScroll(viewport);
  scroll.restore();
  viewport.scrollHeight = 900;
  scroll.read();
  expect(viewport.scrollTop).toBe(600);
  viewport.clientHeight = 0;
  scroll.restore();
  viewport.clientHeight = 200;
  scroll.restore();
  expect(viewport.scrollTop).toBe(700);
});

test("SSR emits a labelled focusable viewport without invoking browser lifecycle", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <ChatConversation ariaLabel="项目对话">
      <p>现有内容</p>
    </ChatConversation>,
  );
  expect(html).toContain('role="region" aria-label="项目对话" tabindex="0"');
  expect(html).toContain("现有内容");
  expect(html).toContain("回到最新消息");
  expect(html).not.toContain("ref=");
});
