import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { PresentationImage } from "../../../src/presentation/image";

const render = (ratio?: number | "fill") =>
  createWebRenderer(createRuntime()).renderToHtml(
    <PresentationImage
      src="/authorized-image"
      alt="All four document corners"
      ratio={ratio}
      caption={<span>Source and an explicit crop description.</span>}
      failedLabel="Use the written description."
    />,
  );

test("presentation image composes one passive preview and a separate semantic caption", () => {
  const html = render();
  expect(html).toStartWith("<figure");
  expect(html.match(/<img\b/g)).toHaveLength(1);
  expect(html).toContain('alt="All four document corners"');
  expect(html).toContain('data-image-state="loading"');
  expect(html).toContain('role="status"');
  expect(html).toContain("<figcaption");
  expect(html).toContain("Source and an explicit crop description.");
  expect(html).not.toContain("<button");
  expect(html).not.toContain("<a ");
  expect(html).not.toContain(" ratio=");
  expect(html).not.toContain(" fit=");
});

test("presentation image has one bounded frame-sizing owner", () => {
  expect(render(3 / 2)).toContain('data-sizing="ratio"');
  const fill = render("fill");
  expect(fill).toContain('data-sizing="fill"');
  expect(fill).not.toContain("aspect-ratio");
  for (const ratio of [0, -1, Number.NaN, Number.POSITIVE_INFINITY])
    expect(() => render(ratio)).toThrow("finite positive ratio or fill");
});
