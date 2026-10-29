import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { derived, signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import {
  Markdown,
  installMeowUI,
  markdownBlocks,
  meowUIComponents,
  repairMarkdownTail,
} from "../../../src/index";
import { mountComponent } from "./mount";

test("the streaming tail closes open emphasis and code and hides a half-typed link target", () => {
  expect(repairMarkdownTail("This is **bol")).toBe("This is **bol**");
  expect(repairMarkdownTail("a *b")).toBe("a *b*");
  expect(repairMarkdownTail("**bold *ital")).toBe("**bold *ital***");
  expect(repairMarkdownTail("para\n\n~~old")).toBe("para\n\n~~old~~");
  expect(repairMarkdownTail("run `npm i")).toBe("run `npm i`");
  expect(repairMarkdownTail("see [docs](https://exa")).toBe("see docs");
  // An opener with nothing after it yet is dropped rather than closed around nothing.
  expect(repairMarkdownTail("This is **")).toBe("This is");
});

test("the repair leaves ordinary text, code and finished syntax alone", () => {
  for (const text of [
    "5 * 3 = 15",
    "a ** b",
    "* item one\n* item tw",
    "snake_case_name",
    "array[0",
    "see [1] and [ ]",
    "a \\* b",
    "https://example.com/a*b",
    "<https://example.com/*>",
    "done **bold** and *x*",
    "```js\nconst a = **",
    "    indented *code",
    "``",
  ])
    expect(repairMarkdownTail(text)).toBe(text);
  // Markers inside a closed code span are code.
  expect(repairMarkdownTail("use `a*b` here")).toBe("use `a*b` here");
});

test("blocks take their element from the token, skip empty tokens and resolve late links", () => {
  const blocks = markdownBlocks(
    "# Title\n\nSee [x][ref].\n\n3. a\n4. b\n\n<script>alert(1)</script>\n\n```ts\nlet a\n```\n\n---\n\n[ref]: https://example.com",
  );
  expect(blocks.map((block) => block.key)).toEqual([
    "0:h1",
    "1:p",
    "2:ol:3",
    "3:p",
    "4:pre",
    "5:hr",
  ]);
  expect(blocks[1]!.html).toContain(
    '<a href="https://example.com/" target="_blank" rel="noreferrer">x</a>',
  );
  expect(blocks[2]!.start).toBe(3);
  // Raw HTML is text, wrapped in a paragraph of its own.
  expect(blocks[3]!.html).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  expect(blocks[4]!.code).toEqual({ code: "let a", language: "ts" });
  expect(markdownBlocks("[x](javascript:alert(1))")[0]!.html).toBe("x");
});

function runtime() {
  const value = createRuntime();
  installMeowUI({ components: meowUIComponents }, value);
  return value;
}

test("blocks are direct children of the root and finished blocks keep their element", async () => {
  const text = signal("First paragraph.\n\nSecond");
  const streaming = signal(true);
  const mounted = mountComponent(<Markdown text={text} streaming={streaming} />, runtime());
  const root = mounted.host.querySelector('[data-meowui-part="markdown/root"]')!;
  expect(root.getAttribute("aria-busy")).toBe("true");
  const first = root.children[0]!;
  const firstText = first.firstChild;
  expect(first.tagName).toBe("P");
  expect(first.getAttribute("data-meowui-part")).toBe("markdown/block");

  text.value = "First paragraph.\n\nSecond **bold";
  await Promise.resolve();
  expect(root.children[0]).toBe(first);
  // Not rewritten: a selection inside the finished paragraph keeps its nodes.
  expect(first.firstChild).toBe(firstText);
  expect(root.children[1]!.innerHTML).toBe("Second <strong>bold</strong>");

  // A paragraph that becomes a list is a new element; the finished paragraph is untouched.
  text.value = "First paragraph.\n\n- one\n- two";
  streaming.value = false;
  await Promise.resolve();
  expect(root.children[0]).toBe(first);
  expect(root.children[1]!.tagName).toBe("UL");
  expect(root.hasAttribute("aria-busy")).toBe(false);
  mounted.unmount();
});

test("renderCode draws fences once per mount and follows the streaming code", async () => {
  const text = signal("```js\nlet a");
  let mounts = 0;
  const mounted = mountComponent(
    <Markdown
      text={text}
      renderCode={(block) => {
        mounts += 1;
        return h(
          "output",
          {},
          derived(() => `${block.value.language}:${block.value.code}`),
        );
      }}
    />,
    runtime(),
  );
  text.value = "```js\nlet a = 1\n```";
  await Promise.resolve();
  expect(mounts).toBe(1);
  expect(mounted.host.querySelector("output")!.textContent).toBe("js:let a = 1");
  mounted.unmount();
});

test("static output keeps the Assistant content policy", () => {
  const output = createWebRenderer(runtime()).renderToHtml(
    <Markdown
      text={"<img src=x onerror=alert(1)> ![a](https://x/y.png) [ok](https://example.com)"}
    />,
  );
  expect(output).not.toContain("<img");
  expect(output).toContain('href="https://example.com/"');
});
