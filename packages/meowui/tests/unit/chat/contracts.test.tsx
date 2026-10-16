import { expect, test } from "bun:test";
import { createRuntime, h, signal } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import {
  ChatAttachments,
  ChatComposer,
  ChatConversationLatest,
  Card,
  ChatMessageListItem,
  ChatToolCall,
} from "../../../src/index";

const { renderToHtml } = createWebRenderer(createRuntime());

test("composer uses a labelled icon action and accepts alternate visible content", () => {
  const html = renderToHtml(<ChatComposer submitLabel="发送消息" />);
  expect(html).toContain('aria-label="发送消息"');
  expect(html).toContain("<svg");
  expect(html).not.toContain(">发送消息</button>");
  const stopped = renderToHtml(
    <ChatComposer submitLabel="停止执行" submitContent={<span aria-hidden="true">■</span>} />,
  );
  expect(stopped).toContain('aria-label="停止执行"');
  expect(stopped).toContain("■</span>");
  expect(stopped).not.toContain("submitContent=");
});

test("presentation-only latest action and actionable card keep native button semantics", () => {
  const latest = renderToHtml(
    <ChatConversationLatest data-latest-message hidden>
      Latest
    </ChatConversationLatest>,
  );
  expect(latest).toContain('type="button"');
  expect(latest).toContain("data-latest-message");
  expect(latest).toContain("hidden");
  expect(renderToHtml(<Card as="button">Artifact</Card>)).toContain('type="button"');
});

test("message list continuity is an explicit string state for theme selectors", () => {
  expect(renderToHtml(<ChatMessageListItem continuation>Next</ChatMessageListItem>)).toContain(
    'data-chat-continuation="true"',
  );
  expect(renderToHtml(<ChatMessageListItem>First</ChatMessageListItem>)).toContain(
    'data-chat-continuation="false"',
  );
});

test("composer separates pending submission from editing and forwards reactive values", () => {
  const runtime = createRuntime();
  const web = createWebRenderer(runtime);
  const value = signal("Latest draft");
  const pending = signal(true);
  let inputDisabled: unknown;
  let submitDisabled: unknown;
  let inputValue: unknown;
  runtime.use({
    render: ({ vnode }, next) => {
      if (vnode.type === "textarea") {
        inputDisabled = vnode.props.disabled;
        inputValue = vnode.props.value;
      }
      if (vnode.type === "button") submitDisabled = vnode.props.disabled;
      return next(vnode);
    },
  });
  const html = web.renderToHtml(<ChatComposer value={value} submitDisabled={pending} />);
  expect(inputValue).toBe(value);
  expect(inputDisabled).toBe(false);
  expect(submitDisabled).toBe(pending);
  expect(html.match(/ disabled/g)).toHaveLength(1);
  pending.value = false;
  web.renderToHtml(<ChatComposer value={value} submitDisabled={pending} disabled />);
  expect(inputDisabled).toBe(true);
  expect(submitDisabled).toBe(true);
});

test("attachments preserve image accessibility and file download markup", () => {
  const html = renderToHtml(
    <ChatAttachments
      label="Shared files"
      className="custom"
      items={[
        { id: "photo", name: "Cat & dog.png", url: "/photo.png", mediaType: "image/png" },
        {
          id: "file",
          name: "notes.txt",
          url: "/notes.txt",
          mediaType: "text/plain",
          sizeBytes: 1536,
        },
      ]}
    />,
  );
  expect(html).toContain('class="custom"');
  expect(html).toContain('role="group"');
  expect(html).toContain('aria-label="Shared files"');
  expect(html).toContain('href="/photo.png"');
  expect(html).toContain('target="_blank"');
  expect(html).toContain('rel="noreferrer"');
  expect(html).toContain('aria-label="打开图片 Cat &amp; dog.png"');
  expect(html).toContain('src="/photo.png"');
  expect(html).toContain('alt="Cat &amp; dog.png"');
  expect(html).toContain('loading="lazy"');
  expect(html).toContain('href="/notes.txt"');
  expect(html).toContain('download="notes.txt"');
  expect(html).toContain("<strong>notes.txt</strong>");
  expect(html).toContain("<small>TXT 1.5KB</small>");
});

test("attachment sizes are optional and use compact reference formatting", () => {
  for (const [sizeBytes, expected] of [
    [undefined, undefined],
    [-1, undefined],
    [NaN, undefined],
    [Infinity, undefined],
    [0, "0B"],
    [1023, "1023B"],
    [1024, "1.0KB"],
    [1572864, "1.5MB"],
  ] as const) {
    const html = renderToHtml(
      <ChatAttachments
        items={[
          {
            id: "file",
            name: "file",
            url: "/file",
            mediaType: "application/octet-stream",
            sizeBytes,
          },
        ]}
      />,
    );
    expect(html).toContain('aria-label="消息附件"');
    if (expected === undefined) expect(html).not.toContain("<small");
    else expect(html).toContain(`<small>${expected}</small>`);
    expect(html).not.toContain("<img");
  }
});

test("unknown tool result is explicitly unconfirmed", () => {
  const html = renderToHtml(<ChatToolCall label="执行操作" state="unknown" />);
  expect(html).toContain('data-tool-state="unknown"');
  expect(html).toContain("结果未确认");
  for (const misleading of ["等待中", "出错", "已完成"]) expect(html).not.toContain(misleading);
});

test("tool target remains in its native disclosure summary while details stay outside", () => {
  const html = renderToHtml(
    <ChatToolCall label="读取" summary="src/request.ts" detail="读取范围 1–20" collapsible>
      完整结果
    </ChatToolCall>,
  );
  const summary = html.slice(html.indexOf("<summary"), html.indexOf("</summary>"));
  expect(summary).toContain("src/request.ts");
  expect(summary).toContain("已完成");
  expect(summary).not.toContain("读取范围");
  expect(summary).not.toContain("完整结果");
  expect(summary).toContain('aria-hidden="true"');
  expect(summary).toContain('focusable="false"');
  expect(html).toContain("<details");
});

test("explicit completion outcomes remain visible instead of using the quiet default", () => {
  const html = renderToHtml(<ChatToolCall label="执行" statusLabel="已停止" collapsible />);
  expect(html).toContain("已停止");
  expect(html).not.toContain("data-tool-default-complete");
  expect(renderToHtml(<ChatToolCall label="读取" collapsible />)).toContain(
    'data-tool-default-complete="true"',
  );
});

test("an unnamed outcome stays quiet, and a running row still states its state", () => {
  const complete = renderToHtml(
    <ChatToolCall label="读取" state="complete" statusLabel="" collapsible />,
  );
  expect(complete).toContain('data-tool-default-complete="true"');
  expect(complete).not.toContain("已完成");
  const running = renderToHtml(
    <ChatToolCall label="执行" state="running" statusLabel="" collapsible />,
  );
  expect(running).not.toContain("data-tool-default-complete");
});

test("empty attachments render a labelled group without links", () => {
  const html = renderToHtml(<ChatAttachments items={[]} />);
  expect(html).toContain('aria-label="消息附件"');
  expect(html).not.toContain("<a ");
  expect(html).toContain('role="group"');
});

test("unthemed composer preserves caller events, input semantics and disabled controls", () => {
  const runtime = createRuntime();
  const web = createWebRenderer(runtime);
  const onSubmit = (_event: SubmitEvent) => {};
  const onInput = (_event: Event) => {};
  let renderedSubmit: unknown;
  let renderedInput: unknown;
  runtime.use({
    render: ({ vnode }, next) => {
      if (vnode.type === "form") renderedSubmit = vnode.props.onSubmit;
      if (vnode.type === "textarea") renderedInput = vnode.props.onInput;
      return next(vnode);
    },
  });
  const html = web.renderToHtml(
    <ChatComposer
      className="host"
      value="Draft"
      placeholder="Write here"
      hint="Hint"
      hintId="composer-hint"
      submitLabel="Send now"
      disabled
      onSubmit={onSubmit}
      onInput={onInput}
    >
      <button type="button">Attach</button>
    </ChatComposer>,
  );
  expect(renderedSubmit).toBe(onSubmit);
  expect(renderedInput).toBe(onInput);
  expect(html).toContain('class="host"');
  expect(html).toContain('name="message"');
  expect(html).toContain('aria-label="消息"');
  expect(html).toContain('aria-describedby="composer-hint"');
  expect(html).toContain('id="composer-hint">Hint</span>');
  expect(html).toContain('placeholder="Write here"');
  expect(html).toContain('aria-label="Send now"');
  expect(html.match(/ disabled/g)).toHaveLength(2);
  expect(html).toContain('<button type="button">Attach</button>');
});

test("an activating row is one button and never discloses, even when both modes are asked for", () => {
  const activating = renderToHtml(<ChatToolCall label="执行命令" onActivate={() => {}} />);
  expect(activating).toContain('data-tool-interactive="true"');
  expect(activating).toContain('<button type="button">');
  expect(activating).not.toContain("data-tool-collapsible");
  expect(activating).not.toContain("<details");
  const both = renderToHtml(<ChatToolCall label="读取" collapsible onActivate={() => {}} />);
  expect(both).not.toContain("<details");
  expect(both).not.toContain("data-tool-collapsible");
});
