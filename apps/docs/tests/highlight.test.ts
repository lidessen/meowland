import { describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { highlightMarkup, highlightStaticCode } from "../highlight";

describe("build-time highlighting", () => {
  test("highlighted markup keeps the code's text and escapes it", async () => {
    const markup = (await highlightMarkup("const a = &quot;&lt;b&gt;&quot;;", "ts")) ?? "";
    expect(markup).toContain('style="color:var(--meowui-code-');
    expect(markup.replace(/<[^>]+>/g, "")).toBe('const a = "&lt;b&gt;";');
  });

  test("an unknown language keeps the plain text", async () => {
    expect(await highlightMarkup("plain", "not-a-language")).toBeUndefined();
  });

  test("markdown fences become the library code surface with colors", async () => {
    const directory = await mkdtemp(join(tmpdir(), "docs-highlight-"));
    try {
      await Bun.write(
        join(directory, "page.html"),
        '<main><pre><code class="language-ts">const answer = 42;</code></pre></main>',
      );
      expect(await highlightStaticCode(directory)).toBe(1);
      const html = await Bun.file(join(directory, "page.html")).text();
      expect(html).toContain('data-meowui-part="code-block/root"');
      expect(html).toContain('style="color:var(--meowui-code-');
      expect(html).not.toContain('class="language-ts"');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
