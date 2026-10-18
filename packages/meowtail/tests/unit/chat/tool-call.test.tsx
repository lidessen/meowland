import { expect, test } from "bun:test";
import { createRuntime, h, signal } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { ChatToolCall } from "../../../src/chat/tool-call";
import {
  executionStateLabel,
  executionStateTone,
  type ChatExecutionState,
} from "../../../src/shared/execution-state";
import { installMeowUI } from "../../../src/registry";

const render = (props: Parameters<typeof ChatToolCall>[0]) => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  return createWebRenderer(runtime).renderToHtml(<ChatToolCall {...props} />);
};

test("tool execution states distinguish queued, waiting, cancelled and unknown from failure", () => {
  for (const state of [
    "queued",
    "running",
    "waiting",
    "success",
    "error",
    "cancelled",
    "unknown",
    "complete",
  ] as const satisfies readonly ChatExecutionState[]) {
    const html = render({ label: "Read", state });
    expect(html).toContain(`data-tool-state="${state}"`);
    expect(html).toContain(executionStateLabel(state));
  }
  expect(executionStateTone("queued")).toBe("idle");
  expect(executionStateTone("cancelled")).toBe("idle");
  expect(executionStateTone("unknown")).toBe("unknown");
  expect(
    render({ label: "Read", state: "waiting", statusLabel: "Waiting for approval" }),
  ).toContain("Waiting for approval");
});

test("tool payloads are inert text, with explicit empty output and optional missing output", () => {
  const empty = render({
    label: "Read",
    input: "<script>alert('x')</script>\n<script>",
    output: "",
    collapsible: true,
  });
  expect(empty).toContain("&lt;script&gt;");
  expect(empty).not.toContain("<script>");
  expect(empty).toContain("Empty output");
  expect(empty).toContain('data-output-wrap="true"');
  expect(render({ label: "Read" })).not.toContain('data-meowui-part="chat-tool-call/output"');
  const absent = render({ label: "Read", output: signal<string | undefined>(undefined) });
  expect(absent).toContain('hidden data-meowui-part="chat-tool-call/output"');
});

test("tool intents remain native buttons outside the disclosure summary", () => {
  const html = render({
    label: "Read",
    state: "error",
    collapsible: true,
    onRetry: () => {},
    onCancel: () => {},
    canCancel: false,
    labels: { retry: "Try again" },
  });
  const summary = html.slice(html.indexOf("<summary"), html.indexOf("</summary>"));
  expect(summary).not.toContain("<button");
  expect(summary).not.toContain("Try again");
  expect(html).toContain("Try again");
  expect(html).toContain("hidden disabled");
  expect(html).toContain('data-meowui-part="chat-tool-call/actions"');
});
