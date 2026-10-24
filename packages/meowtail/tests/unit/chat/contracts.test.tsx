import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import { createMeowUI } from "../../../src/registry";
import {
  ChatAttachments,
  ChatComposer,
  ChatConversationLatest,
  Card,
  ChatMessageListItem,
  ChatToolCall,
  meowUIComponents,
} from "../../../src/index";

const { renderToHtml } = createWebRenderer(
  createRuntime({ plugins: [createMeowUI({ components: meowUIComponents })] }),
);

test("composer uses a labelled icon action and accepts alternate visible content", () => {
  const html = renderToHtml(<ChatComposer submitLabel="Send message" />);
  expect(html).toContain('aria-label="Send message"');
  expect(html).toContain("<svg");
  expect(html).not.toContain(">Send message</button>");
  const stopped = renderToHtml(
    <ChatComposer submitLabel="Stop execution" submitContent={<span aria-hidden="true">■</span>} />,
  );
  expect(stopped).toContain('aria-label="Stop execution"');
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
  expect(html).toContain('aria-label="Open image Cat &amp; dog.png"');
  expect(html).toContain('src="/photo.png"');
  expect(html).toContain('alt="Cat &amp; dog.png"');
  expect(html).toContain('loading="lazy"');
  expect(html).toContain('href="/notes.txt"');
  expect(html).toContain('download="notes.txt"');
  expect(html).toContain(">notes.txt</strong>");
  expect(html).toContain(">TXT 1.5KB</small>");
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
    expect(html).toContain('aria-label="Message attachments"');
    if (expected === undefined) expect(html).not.toContain("<small");
    else expect(html).toContain(`>${expected}</small>`);
    expect(html).not.toContain("<img");
  }
});

test("unknown tool result is explicitly unconfirmed", () => {
  const html = renderToHtml(<ChatToolCall label="Run action" state="unknown" />);
  expect(html).toContain('data-tool-state="unknown"');
  expect(html).toContain("Unconfirmed result");
  for (const misleading of ["Waiting", "Error", "Completed"])
    expect(html).not.toContain(misleading);
});

test("tool target remains in its native disclosure summary while details stay outside", () => {
  const html = renderToHtml(
    <ChatToolCall label="Read" summary="src/request.ts" detail="Read range 1–20" collapsible>
      Complete result
    </ChatToolCall>,
  );
  const summary = html.slice(html.indexOf("<summary"), html.indexOf("</summary>"));
  expect(summary).toContain("src/request.ts");
  expect(summary).toContain("Completed");
  expect(summary).not.toContain("Read range");
  expect(summary).not.toContain("Complete result");
  expect(summary).toContain('aria-hidden="true"');
  expect(summary).toContain('focusable="false"');
  expect(html).toContain("<details");
});

test("explicit completion outcomes remain visible instead of using the quiet default", () => {
  const html = renderToHtml(<ChatToolCall label="Execute" statusLabel="Stopped" collapsible />);
  expect(html).toContain("Stopped");
  expect(html).not.toContain("data-tool-default-complete");
  expect(renderToHtml(<ChatToolCall label="Read" collapsible />)).toContain(
    'data-tool-default-complete="true"',
  );
});

test("an unnamed outcome stays quiet, and a running row still states its state", () => {
  const complete = renderToHtml(
    <ChatToolCall label="Read" state="complete" statusLabel="" collapsible />,
  );
  expect(complete).toContain('data-tool-default-complete="true"');
  expect(complete).not.toContain("Completed");
  const running = renderToHtml(
    <ChatToolCall label="Execute" state="running" statusLabel="" collapsible />,
  );
  expect(running).not.toContain("data-tool-default-complete");
});

test("empty attachments render a labelled group without links", () => {
  const html = renderToHtml(<ChatAttachments items={[]} />);
  expect(html).toContain('aria-label="Message attachments"');
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
  expect(html).toContain('aria-label="Message"');
  expect(html).toContain('aria-describedby="composer-hint"');
  expect(html).toContain('id="composer-hint">Hint</span>');
  expect(html).toContain('placeholder="Write here"');
  expect(html).toContain('aria-label="Send now"');
  expect(html.match(/ disabled/g)).toHaveLength(2);
  expect(html).toContain('<button type="button">Attach</button>');
});

test("an activating row is one button and never discloses, even when both modes are asked for", () => {
  const activating = renderToHtml(<ChatToolCall label="Run command" onActivate={() => {}} />);
  expect(activating).toContain('data-tool-interactive="true"');
  expect(activating).toContain('<button type="button" data-meowui-part="chat-tool-call/header">');
  expect(activating).not.toContain("data-tool-collapsible");
  expect(activating).not.toContain("<details");
  const both = renderToHtml(<ChatToolCall label="Read" collapsible onActivate={() => {}} />);
  expect(both).not.toContain("<details");
  expect(both).not.toContain("data-tool-collapsible");
});
