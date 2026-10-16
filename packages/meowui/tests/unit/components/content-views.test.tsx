import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { WebBlock, webSourceHref } from "../../../src/components/web-block";
import { JsonTree } from "../../../src/components/json-tree";
import { JsonBlock } from "../../../src/components/json-block";
import { ImageLightbox } from "../../../src/components/image-lightbox";

test("web source links allow only retrieval URLs and preserve citation identity", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,test", "file:///tmp/file", "not a url"])
    expect(webSourceHref(url)).toBeUndefined();
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <WebBlock
      kind="search"
      truncated
      sources={[
        { url: "https://example.com", title: "<source>" },
        { url: "javascript:alert(1)", title: "unsafe" },
      ]}
    />,
  );
  expect(html).toContain('href="https://example.com"');
  expect(html).not.toContain('href="javascript:');
  expect(html).toContain("&lt;source&gt;");
  expect(html).toContain('value="2"');
  expect(html).toContain("来源列表已截断");
});
test("JSON creates only the expanded branch and invalid input remains visible", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <JsonTree data={{ nested: { secretLeaf: "not mounted" } }} />,
  );
  expect(html).toContain("nested</span>");
  expect(html).toContain("Object(1)</span>");
  expect(html).not.toContain("secretLeaf");
  const invalid = createWebRenderer(createRuntime()).renderToHtml(
    <JsonBlock text={'{"broken": <script>'} defaultOpen />,
  );
  expect(invalid).toContain("JSON 格式无效");
  expect(invalid).toContain("&lt;script&gt;");
});
test("lightbox uses a closed native dialog with accessible image and trigger", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <ImageLightbox src="/sample.png" alt="sample" caption="caption" />,
  );
  expect(html).toContain("<dialog");
  expect(html).not.toContain(" open");
  expect(html).toContain('alt="sample"');
  expect(html).toContain("关闭图片预览");
});
