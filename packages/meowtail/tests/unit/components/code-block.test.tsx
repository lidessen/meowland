import { expect, test } from "bun:test";
import { createRuntime, h, unwrap, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { CodeBlock } from "../../../src/components/code-block";

test("code blocks escape executable markup and retain exact whitespace", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <CodeBlock language="html" code={"<script>x()</script>\n  trailing  "} />,
  );
  expect(html).toContain("&lt;script&gt;x()&lt;/script&gt;\n  trailing  ");
  expect(html).not.toContain("<script>");
  expect(html).toContain("html");
  expect(html).toContain('aria-label="代码内容"');
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
    const runtime = createRuntime();
    const buttons: Props[] = [];
    let status: unknown;
    let pre: Props = {};
    runtime.use({
      render({ vnode }, next) {
        if (vnode.type === "button") buttons.push(vnode.props);
        if (vnode.type === "pre") pre = vnode.props;
        if (vnode.props.role === "status")
          status = Array.isArray(vnode.props.children)
            ? vnode.props.children[0]
            : vnode.props.children;
        return next(vnode);
      },
    });
    const copied: string[] = [];
    const code = "  raw\nline  ";
    createWebRenderer(runtime).renderToHtml(
      CodeBlock({
        code,
        onCopy: async (value) => {
          copied.push(value);
          if (fail) throw new Error("denied");
        },
      }),
    );
    (buttons[0].onClick as () => void)();
    expect(unwrap(pre["data-wrap"])).toBe("true");
    expect(unwrap(buttons[0]["aria-pressed"])).toBe("true");
    (buttons[0].onClick as () => void)();
    expect(unwrap(pre["data-wrap"])).toBe("false");
    expect(unwrap(buttons[0]["aria-pressed"])).toBe("false");
    const copy = buttons[1].onClick as () => Promise<void>;
    const pending = copy();
    await copy();
    await pending;
    expect(copied).toEqual([code]);
    expect(unwrap(status)).toBe(fail ? "复制失败，请选择代码后手动复制。" : "已复制");
    expect(unwrap(buttons[1].disabled)).toBe(false);
  }
});
