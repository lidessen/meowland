import { expect, test } from "bun:test";
import { h } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { FileTypeIcon, classifyFileType, fileExtension } from "../../../src/icons/file-type-icon";

test("file classification handles paths, case, extensionless names, and unknown files", () => {
  expect(classifyFileType("C:\\docs\\REPORT.PDF")).toBe("pdf");
  expect(classifyFileType("/docs/README")).toBe("markdown");
  expect(classifyFileType("component.tsx")).toBe("code");
  expect(classifyFileType("table.xlsx")).toBe("excel");
  expect(classifyFileType("unknown.bin")).toBe("other");
  expect(fileExtension("/folder.md/no-extension")).toBe("");
  expect(fileExtension("file.MD")).toBe("MD");
});

test("file glyph is decorative and respects caller sizing", () => {
  const html = renderToHtml(<FileTypeIcon path="components.md" size={20} />);
  expect(html).toContain('width="20"');
  expect(html).toContain('height="20"');
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain('focusable="false"');
});
