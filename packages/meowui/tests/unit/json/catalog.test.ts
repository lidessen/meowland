import { expect, test } from "bun:test";
import { h, signal } from "meowjsx";
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

test("JSON Assistant is the public component with the same four message part renderers", () => {
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
