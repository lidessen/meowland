import { expect, test } from "bun:test";
import { h } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { Icon, iconNames, MeowlandMark } from "../../../src/icons";

test("Meowland mark preserves caller styling and inherits its foreground", () => {
  const html = renderToHtml(<MeowlandMark className="brand-mark" />);

  expect(html).toContain('<svg class="brand-mark"');
  expect(html).toContain('fill="currentColor"');
});

test("functional icons allow caller sizing and theme styling and are decorative by default", () => {
  for (const name of iconNames) {
    const html = renderToHtml(<Icon name={name} size={16} />);
    expect(html).toContain('width="16"');
    expect(html).toContain('stroke="currentColor"');
    // SVG presentation attributes provide standalone defaults; inline CSS would
    // prevent the active theme from setting optical weight and alignment.
    expect(html).not.toContain("style=");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('focusable="false"');
  }
});

test("meaningful standalone icons expose their accessible label", () => {
  const html = renderToHtml(<Icon name="file-text" label="文档" className="document-icon" />);
  expect(html).toContain('role="img"');
  expect(html).toContain('aria-label="文档"');
  expect(html).toContain('class="meow-icon document-icon"');
  expect(html).not.toContain("aria-hidden");
});
