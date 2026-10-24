import { expect, test } from "bun:test";
import { createRuntime, h, signal, unwrap, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { CodeBlock } from "../../../src/components/code-block";
import { installMeowUI, meowUIComponents } from "../../../src/registry";
import { mountComponent } from "./mount";

test("code blocks escape executable markup and retain exact whitespace", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <CodeBlock language="html" code={"<script>x()</script>\n  trailing  "} />,
  );
  expect(html).toContain("&lt;script&gt;x()&lt;/script&gt;\n  trailing  ");
  expect(html).not.toContain("<script>");
  expect(html).toContain("html");
  expect(html).toContain('aria-label="Code content"');
  expect(html).toContain('data-wrap="false"');
  expect(html).toContain('aria-pressed="false"');
  const wrapped = createWebRenderer(createRuntime()).renderToHtml(
    <CodeBlock code="long line" defaultWrap />,
  );
  expect(wrapped).toContain('data-wrap="true"');
  expect(wrapped).toContain('aria-pressed="true"');
});

test("copy preserves raw code, prevents concurrent requests and exposes failures", async () => {
  for (const fail of [false, true]) {
    const copied: string[] = [];
    const code = "  raw\nline  ";
    const view = mountComponent(
      <CodeBlock
        code={code}
        onCopy={async (value) => {
          copied.push(value);
          if (fail) throw new Error("denied");
        }}
      />,
    );
    try {
      const [wrapButton, copyButton] = view.host.querySelectorAll("button");
      const pre = view.host.querySelector("pre")!;
      wrapButton!.click();
      await Promise.resolve();
      expect(pre.getAttribute("data-wrap")).toBe("true");
      expect(wrapButton!.getAttribute("aria-pressed")).toBe("true");
      wrapButton!.click();
      await Promise.resolve();
      expect(pre.getAttribute("data-wrap")).toBe("false");
      expect(wrapButton!.getAttribute("aria-pressed")).toBe("false");
      const copy = copyButton!.onclick as () => Promise<void>;
      const pending = copy();
      await copy();
      await pending;
      expect(copied).toEqual([code]);
      expect(view.host.querySelector('[role="status"]')!.textContent).toBe(
        fail ? "Copy failed; select the code and copy it manually." : "Copied",
      );
      expect(copyButton!.disabled).toBe(false);
    } finally {
      view.unmount();
    }
  }
});

test("title and caption parts appear in the header only when provided", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const renderer = createWebRenderer(runtime);
  const plain = renderer.renderToHtml(<CodeBlock language="typescript" code="const value = 1;" />);
  expect(plain).not.toContain('data-meowui-part="code-block/title"');
  expect(plain).not.toContain('data-meowui-part="code-block/caption"');
  expect(plain).toContain('data-meowui-part="code-block/language">typescript</span>');

  const caption = signal("examples/authoring · TypeScript");
  const titled = renderer.renderToHtml(
    <CodeBlock
      language="typescript"
      code="const value = 1;"
      title="connection.ts"
      caption={caption}
    />,
  );
  expect(titled).toContain('data-meowui-part="code-block/title">connection.ts</span>');
  expect(titled).toContain(
    'data-meowui-part="code-block/caption">examples/authoring · TypeScript</span>',
  );
  expect(titled).toContain('data-meowui-part="code-block/language">typescript</span>');
  const headerAt = titled.indexOf('data-meowui-part="code-block/header"');
  const titleAt = titled.indexOf('data-meowui-part="code-block/title"');
  const captionAt = titled.indexOf('data-meowui-part="code-block/caption"');
  const languageAt = titled.indexOf('data-meowui-part="code-block/language"');
  expect(headerAt).toBeGreaterThan(-1);
  expect(titleAt).toBeGreaterThan(headerAt);
  expect(captionAt).toBeGreaterThan(titleAt);
  expect(languageAt).toBeGreaterThan(captionAt);
  expect(languageAt).toBeLessThan(titled.indexOf("</figcaption>"));

  const titleOnly = renderer.renderToHtml(
    <CodeBlock code="const value = 1;" title="Single part" />,
  );
  expect(titleOnly).toContain('data-meowui-part="code-block/title">Single part</span>');
  expect(titleOnly).not.toContain('data-meowui-part="code-block/caption"');

  const captionOnly = renderer.renderToHtml(
    <CodeBlock code="bun add meowtail" caption="A quiet supporting note" />,
  );
  expect(captionOnly).toContain(
    'data-meowui-part="code-block/caption">A quiet supporting note</span>',
  );
  expect(captionOnly).not.toContain('data-meowui-part="code-block/title"');
});

test("host actions render before the built-in controls and leave wrap and copy unchanged", async () => {
  const runtime = createRuntime();
  const buttons: Props[] = [];
  let pre: Props = {};
  runtime.use({
    render({ vnode }, next) {
      if (vnode.type === "button") buttons.push(vnode.props);
      if (vnode.type === "pre") pre = vnode.props;
      return next(vnode);
    },
  });
  const copied: string[] = [];
  createWebRenderer(runtime).renderToHtml(
    <CodeBlock
      code={"  raw\nline  "}
      title="connection.ts"
      caption="examples/authoring"
      actions={<button type="button">Open in workbench</button>}
      onCopy={async (value) => {
        copied.push(value);
      }}
    />,
  );
  expect(buttons.length).toBe(3);
  expect(buttons[0].children).toBe("Open in workbench");
  expect(buttons[1].children).toBe("Soft wrap");
  expect(buttons[2].children).toBe("Copy code");
  expect(unwrap(pre["data-wrap"])).toBe("false");
  (buttons[1].onClick as () => void)();
  expect(unwrap(pre["data-wrap"])).toBe("true");
  expect(unwrap(buttons[1]["aria-pressed"])).toBe("true");
  (buttons[1].onClick as () => void)();
  expect(unwrap(pre["data-wrap"])).toBe("false");
  await (buttons[2].onClick as () => Promise<void>)();
  expect(copied).toEqual(["  raw\nline  "]);
});
