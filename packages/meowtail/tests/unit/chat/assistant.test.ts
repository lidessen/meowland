import { describe, expect, test } from "bun:test";
import { consumeAssistantDraft, snapshotAssistantDraft } from "../../../src/chat/assistant-draft";
import { assistantMarkdown } from "../../../src/chat/assistant-markdown";
import { AssistantView } from "../../../src/chat/assistant";
import { createRuntime, h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import { installMeowUI, meowUIComponents } from "meowtail";

describe("Assistant draft acceptance", () => {
  const sent = { id: "a", name: "sent.txt", url: "https://example.com/a", mediaType: "text/plain" };
  const later = {
    id: "b",
    name: "later.txt",
    url: "https://example.com/b",
    mediaType: "text/plain",
  };
  test("acceptance consumes submitted attachments while retaining newer text and attachments", () => {
    expect(
      consumeAssistantDraft(
        { text: "next message", attachments: [sent, later] },
        { text: "submitted", attachments: [sent] },
        false,
      ),
    ).toEqual({ text: "next message", attachments: [later] });
  });
  test("an unchanged text can clear without dropping a newly added attachment", () => {
    expect(
      consumeAssistantDraft(
        { text: "submitted", attachments: [sent, later] },
        { text: "submitted", attachments: [sent] },
        true,
      ),
    ).toEqual({ text: "", attachments: [later] });
  });
  test("an edited-back text and a replacement attachment with the same id survive", () => {
    const replacement = { ...sent, url: "https://example.com/new" };
    expect(
      consumeAssistantDraft(
        { text: "submitted", attachments: [replacement] },
        { text: "submitted", attachments: [sent] },
        false,
      ),
    ).toEqual({ text: "submitted", attachments: [replacement] });
  });
  test("immutable host copies of the same submitted attachment are consumed", () => {
    expect(
      consumeAssistantDraft(
        { text: "submitted", attachments: [{ ...sent }] },
        { text: "submitted", attachments: [sent] },
        true,
      ),
    ).toEqual({ text: "", attachments: [] });
  });
  test("in-place edits during submission cannot alter the captured attachment metadata", () => {
    const current = { ...sent };
    const submitted = snapshotAssistantDraft({ text: "submitted", attachments: [current] });
    current.url = "https://example.com/replaced";
    expect(submitted.attachments[0]!.url).toBe("https://example.com/a");
    expect(
      consumeAssistantDraft({ text: "submitted", attachments: [current] }, submitted, true)
        .attachments,
    ).toEqual([current]);
  });
});

describe("Assistant safe rich text", () => {
  test("renders ordinary rich text and code while displaying raw HTML as text", () => {
    const result = assistantMarkdown(
      "**Hello**\n\n<script>alert(1)</script>\n\n```js\nconst x = '<x>';\n```",
    );
    expect(result).toContain("<strong>Hello</strong>");
    expect(result).toContain("&lt;script&gt;");
    expect(result).not.toContain("<script>");
    expect(result).toContain("<pre><code");
  });
  test("does not turn script links, raw image HTML or Markdown images into active content", () => {
    const result = assistantMarkdown(
      "[unsafe](javascript:alert(1)) ![label](https://example.com/image.png) <img src=x onerror=alert(1)> [safe](https://example.com/)",
    );
    expect(result).not.toContain('href="javascript:');
    expect(result).not.toContain("<img");
    expect(result).toContain('href="https://example.com/"');
    expect(result).toContain('rel="noreferrer"');
  });
});

describe("Assistant public composition", () => {
  const render = (props: Parameters<typeof AssistantView>[0]) => {
    const runtime = createRuntime();
    installMeowUI({ components: meowUIComponents }, runtime);
    return createWebRenderer(runtime).renderToHtml(h(AssistantView, props));
  };
  test("a controlled draft requires its host change callback or explicit read-only mode", () => {
    expect(() => render({ messages: [], draft: { text: "Host draft", attachments: [] } })).toThrow(
      "requires onDraftChange or readOnly",
    );
    expect(
      render({ messages: [], draft: { text: "Host draft", attachments: [] }, readOnly: true }),
    ).toContain("Host draft");
  });
  test("read failure retains messages and finite copy overrides use the same default surface", () => {
    const html = render({
      messages: signal([
        {
          id: "kept",
          role: "assistant" as const,
          author: "Helper",
          parts: [{ id: "text", kind: "text" as const, text: "Previously read content" }],
        },
      ]),
      readState: "error",
      labels: { title: "Shared helper", latest: "Latest message" },
    });
    expect(html).toContain("Previously read content");
    expect(html).toContain("Previously read messages are retained");
    expect(html).toContain("Shared helper");
    expect(html).toContain("Latest message");
  });
  test("a user's text sits in a bubble while the reply stays on the page", () => {
    const html = render({
      messages: signal([
        {
          id: "ask",
          role: "user" as const,
          author: "You",
          parts: [{ id: "text", kind: "text" as const, text: "Question text" }],
        },
        {
          id: "reply",
          role: "assistant" as const,
          author: "Helper",
          parts: [{ id: "text", kind: "text" as const, text: "Reply text" }],
        },
      ]),
    });
    const bubbles = html.match(/data-meowui-part="chat-bubble\/root"/g) ?? [];
    expect(bubbles).toHaveLength(1);
    expect(html.indexOf('data-meowui-part="chat-bubble/root"')).toBeLessThan(
      html.indexOf("Question text"),
    );
    expect(html.indexOf("Question text")).toBeLessThan(html.indexOf("Reply text"));
  });

  test("Assistant steps keep one title and questions place actions in the shared action row", () => {
    const html = render({
      messages: [],
      activity: {
        title: "Reviewing",
        statusText: "Reading source files",
        steps: [{ id: "read", title: "Read source", tone: "processing" }],
      },
      questions: [{ id: "scope", title: "Review scope", state: "open" }],
      onAnswer: () => undefined,
    });
    expect(html.split(">Read source<")).toHaveLength(2);
    expect(html).toContain('data-meowui-part="status-dot/root"');
    expect(html).toContain('aria-hidden="true"');
    const questionRoot = html.indexOf('data-meowui-part="assistant-question/root"');
    const actionRow = html.indexOf('data-meowui-part="chat-question/actions"');
    const answerButton = html.indexOf(">Answer</button>");
    expect(questionRoot).toBeGreaterThanOrEqual(0);
    expect(actionRow).toBeGreaterThan(questionRoot);
    expect(answerButton).toBeGreaterThan(actionRow);
  });

  test("normalized attachments remain usable when local file selection is unavailable", () => {
    const html = render({
      messages: [],
      allowAttachments: false,
      defaultDraft: {
        text: "Readable draft",
        attachments: [
          {
            id: "existing",
            name: "existing.txt",
            url: "https://example.com/file",
            mediaType: "text/plain",
          },
        ],
      },
    });
    expect(html).toContain("existing.txt");
    expect(html).toContain("Readable draft");
    expect(html).not.toContain('type="file"');
    expect(html).not.toContain('aria-label="Attach files"');
  });
  test("tool action availability requires an explicit host handler and does not imply an outcome", () => {
    const messages = [
      {
        id: "m",
        role: "assistant" as const,
        author: "Assistant",
        parts: [
          {
            id: "t",
            kind: "tool" as const,
            label: "Read source",
            state: "waiting" as const,
            statusLabel: "Waiting for access",
            canRetry: true,
            canCancel: false,
            defaultOpen: true,
          },
        ],
      },
    ];
    const passive = render({ messages, readOnly: true });
    expect(passive).toContain("Waiting for access");
    expect(passive).not.toContain("Retry");
    const actionable = render({ messages, readOnly: true, onToolAction: () => undefined });
    expect(actionable).toContain("Retry");
    expect(actionable).toContain('data-tool-state="waiting"');
  });
  test("a tool with no execution state is unknown rather than completed", () => {
    const html = render({
      readOnly: true,
      messages: [
        {
          id: "m",
          role: "assistant",
          author: "Assistant",
          parts: [
            {
              id: "t",
              kind: "tool",
              label: "Waiting for a report",
            },
          ],
        },
      ],
    });
    expect(html).toContain('data-tool-state="unknown"');
    expect(html).toContain("Unconfirmed result");
  });
});
