import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { ImagePreview } from "../../../src/components/image-preview";

test("image preview is a passive image with localized loading and failure labels", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <ImagePreview
      src="/authorized-image"
      alt="示例"
      loadingLabel="加载中"
      failedLabel="无法显示"
    />,
  );
  expect(html).toContain('src="/authorized-image"');
  expect(html).toContain('alt="示例"');
  expect(html).toContain('data-image-state="loading"');
  expect(html).toContain('role="status"');
  expect(html).toContain("加载中");
  expect(html).not.toContain("<button");
  expect(html).not.toContain("<a ");
});
