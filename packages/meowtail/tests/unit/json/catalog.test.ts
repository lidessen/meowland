import { expect, test } from "bun:test";
import { h, signal, type VNode } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { createJsonView, describeJsonCatalog, parseJsonView } from "meowjsx/json";
import { AssistantView } from "../../../src/chat/assistant";
import { Button } from "../../../src/components/button";
import { createMeowUICatalog } from "../../../src/json/index";

const messages = [
  {
    id: "m1",
    role: "assistant" as const,
    author: "Assistant",
    parts: [
      { id: "text", kind: "text" as const, text: "Hello **reader**" },
      { id: "code", kind: "code" as const, code: "const answer = 42;", language: "js" },
      {
        id: "process",
        kind: "process" as const,
        title: "Reading sources",
        steps: [{ id: "s1", title: "Read", tone: "success" as const }],
      },
      {
        id: "files",
        kind: "attachments" as const,
        items: [
          {
            id: "a1",
            name: "notes.txt",
            url: "https://example.com/notes",
            mediaType: "text/plain",
          },
        ],
      },
    ],
  },
];

test("JSON Assistant is the public component with the same message part renderers", () => {
  const catalog = createMeowUICatalog();
  expect(catalog.get("AssistantView")!.component).toBe(AssistantView);
  expect(catalog.get("Button")!.component).toBe(Button);
  const props = {
    messages,
    title: "Project assistant",
    readOnly: true,
    allowAttachments: false,
    work: [{ id: "w1", title: "Review", statusText: "Returned", tone: "returned" as const }],
  };
  const child = createJsonView(parseJsonView({ component: "AssistantView", props }, catalog), {
    catalog,
  });
  const jsonHtml = renderToHtml(child);
  const jsxHtml = renderToHtml(h(AssistantView, props));
  expect(jsonHtml).toBe(jsxHtml);
  expect(jsonHtml).toContain("Project assistant");
  expect(jsonHtml).toContain("<strong>reader</strong>");
  expect(jsonHtml).toContain("const answer = 42;");
  expect(jsonHtml).toContain("Reading sources");
  expect(jsonHtml).toContain("notes.txt");
  expect(
    renderToHtml(
      createJsonView(
        parseJsonView({ component: "AssistantView", props: { messages: [] } }, catalog),
        { catalog },
      ),
    ),
  ).not.toContain('type="file"');
});

test("agent parts render the same escaped tool data and independent task facts in JSON and JSX", () => {
  const catalog = createMeowUICatalog();
  const props = {
    messages: [
      {
        id: "agent-message",
        role: "assistant" as const,
        author: "Assistant",
        parts: [
          {
            id: "tool",
            kind: "tool" as const,
            label: "Read files",
            state: "running" as const,
            input: "<script>not executable</script>",
            output: "",
            defaultOpen: true,
            canRetry: true,
            retryDisabled: true,
          },
          {
            id: "task",
            kind: "task" as const,
            title: "Review files",
            state: "success" as const,
            executionText: "Execution completed",
            replyText: "Awaiting a public reply",
            progress: { value: 2, max: 2, label: "Reviewed two files" },
            steps: [{ id: "step", title: "Read source", statusText: "Reviewed" }],
          },
        ],
      },
    ],
    readOnly: true,
    allowAttachments: false,
  };
  const jsonHtml = renderToHtml(
    createJsonView(parseJsonView({ component: "AssistantView", props }, catalog), { catalog }),
  );
  expect(jsonHtml).toBe(renderToHtml(h(AssistantView, props)));
  expect(jsonHtml).toContain("&lt;script&gt;not executable&lt;/script&gt;");
  expect(jsonHtml).not.toContain("<script>");
  expect(jsonHtml).toContain("Execution completed");
  expect(jsonHtml).toContain("Awaiting a public reply");
  expect(jsonHtml).toContain("Reviewed two files");
});

test("a process state renders the same badge in JSON and JSX and stays optional", () => {
  const catalog = createMeowUICatalog();
  const withState = (state?: "running") => ({
    readOnly: true,
    allowAttachments: false,
    messages: [
      {
        id: "reply",
        role: "assistant" as const,
        author: "Assistant",
        parts: [
          {
            id: "process",
            kind: "process" as const,
            title: "Review process",
            ...(state ? { state } : {}),
            statusText: "1 of 3",
            steps: [],
          },
        ],
      },
    ],
  });
  const json = (props: object) =>
    renderToHtml(
      createJsonView(parseJsonView({ component: "AssistantView", props }, catalog), { catalog }),
    );
  const badged = withState("running");
  expect(json(badged)).toBe(renderToHtml(h(AssistantView, badged)));
  expect(json(badged)).toContain('data-tone="processing"');
  expect(json(badged)).toContain("Running");
  const plain = withState();
  expect(json(plain)).toBe(renderToHtml(h(AssistantView, plain)));
  expect(json(plain)).not.toContain('data-tone="processing"');
  expect(json(plain)).toContain("1 of 3");
});

test("agent JSON fields and intents remain a finite data contract", () => {
  const catalog = createMeowUICatalog();
  const view = (part: unknown) => ({
    component: "AssistantView",
    props: {
      messages: [{ id: "m", role: "assistant", author: "Assistant", parts: [part] }],
    },
  });
  for (const invalid of [
    { id: "t", kind: "tool", label: "Read", state: "not-replied" },
    { id: "t", kind: "tool", label: "Read", input: { html: "<b>data</b>" } },
    { id: "t", kind: "tool", label: "Read", onRetry: "execute" },
    { id: "t", kind: "task", title: "Review", state: "running", children: [] },
    { id: "t", kind: "task", title: "Review", state: "running", progress: { value: 1, max: 2 } },
  ])
    expect(() => parseJsonView(view(invalid), catalog)).toThrow("union");
  const parsed = parseJsonView(
    {
      component: "AssistantView",
      props: {
        messages: [],
        onToolAction: { $action: "tool.intent" },
      },
    },
    catalog,
  );
  const intents: unknown[][] = [];
  const child = createJsonView(parsed, {
    catalog,
    actions: new Map([["tool.intent", (...args: unknown[]) => intents.push(args)]]),
  }) as VNode;
  const intent = child.props.onToolAction as (...args: unknown[]) => void;
  intent("m", "t", "retry");
  expect(intents).toEqual([["m", "t", "retry"]]);
  expect(() => intent("m", "t", "execute")).toThrow("enum");
  expect(() => intent("m", "t", "cancel", { event: true })).toThrow("argument count");
  expect(intents).toHaveLength(1);
  expect(JSON.stringify(describeJsonCatalog(catalog))).toContain('"onToolAction"');
});

test("Assistant catalog validates real data unions and describes only its supported finite properties", () => {
  const catalog = createMeowUICatalog();
  expect(() =>
    parseJsonView(
      {
        component: "AssistantView",
        props: {
          messages: [{ ...messages[0], parts: [{ id: "x", kind: "text", code: "wrong" }] }],
        },
      },
      catalog,
    ),
  ).toThrow("union");
  expect(() =>
    parseJsonView(
      { component: "AssistantView", props: { messages: [], renderPart: "code" } },
      catalog,
    ),
  ).toThrow("finite catalog");
  expect(() =>
    parseJsonView(
      { component: "AssistantView", props: { messages: [], onAttach: { $action: "upload" } } },
      catalog,
    ),
  ).toThrow("finite catalog");
  const description = JSON.stringify(describeJsonCatalog(catalog));
  expect(description).toContain('"AssistantView"');
  expect(description).toContain('"anyOf"');
  expect(description).not.toContain('"renderPart"');
  expect(() =>
    parseJsonView(
      { component: "AssistantView", props: { messages: [], allowAttachments: true } },
      catalog,
    ),
  ).toThrow("enum");
});

test("primitive JSON bindings and actions stay explicit host references", () => {
  const catalog = createMeowUICatalog();
  const value = signal("hello");
  const view = parseJsonView(
    {
      component: "Stack",
      props: { gap: "compact" },
      children: [
        {
          component: "Input",
          props: { value: { $binding: "draft" }, onInput: { $action: "draft.change" } },
        },
        {
          component: "Button",
          props: { variant: "outline", onClick: { $action: "send" } },
          children: "Send",
        },
      ],
    },
    catalog,
  );
  let invoked = 0;
  const child = createJsonView(view, {
    catalog,
    bindings: new Map([["draft", value]]),
    actions: new Map([
      [
        "draft.change",
        (next: string) => {
          value.value = next;
        },
      ],
      ["send", () => invoked++],
    ]),
  });
  expect(renderToHtml(child)).toContain('value="hello"');
  expect(invoked).toBe(0);
  value.value = "later";
  expect(renderToHtml(child)).toContain('value="later"');
});
