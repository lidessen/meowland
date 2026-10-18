import { expect, test } from "bun:test";
import { createRuntime, h, signal } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { ChatTask } from "../../../src/chat/task";

const html = (props: Parameters<typeof ChatTask>[0]) =>
  createWebRenderer(createRuntime()).renderToHtml(<ChatTask {...props} />);

test("a task is a named record with no inferred execution or reply outcome", () => {
  const output = html({ title: "Inspect an attachment" });
  expect(output).toContain('<section aria-label="Inspect an attachment"');
  expect(output).toContain('data-execution-state="unknown"');
  expect(output).not.toContain("<button");
  expect(output).not.toContain("No reply");
  expect(output).not.toContain("Failed");
});

test("execution success and a missing public reply remain independent", () => {
  const output = html({
    title: "Review a source",
    state: "success",
    executionText: "The reader returned successfully.",
    replyText: "The author has not published a reply yet.",
    footer: <button type="button">Open result</button>,
    children: <p>Existing result content</p>,
  });
  expect(output).toContain('data-execution-state="success"');
  expect(output).toContain("The reader returned successfully.");
  expect(output).toContain("The author has not published a reply yet.");
  expect(output).toContain("Existing result content");
  expect(output).toContain('<button type="button">Open result</button>');
});

test("task facts remain text and explicit progress uses native semantics", () => {
  const output = html({
    title: signal("<script>title</script>"),
    state: signal("waiting" as const),
    statusLabel: signal("Waiting for the author"),
    description: "<img src=x onerror=alert(1)>",
    progress: signal({ value: 0, max: 4, label: "Reviewed 0 of 4 files" }),
  });
  expect(output).toContain("&lt;script&gt;title&lt;/script&gt;");
  expect(output).toContain("&lt;img src=x onerror=alert(1)&gt;");
  expect(output).not.toContain("<script>");
  expect(output).not.toContain("<img");
  expect(output).toContain('<progress value="0" max="4" aria-label="Reviewed 0 of 4 files"');
});

test("invalid progress is rejected rather than reported as an invented percentage", () => {
  for (const [value, max] of [
    [-1, 4],
    [5, 4],
    [1, 0],
    [NaN, 4],
    [1, Infinity],
  ]) {
    expect(() =>
      html({ title: "Review", progress: { value: value!, max: max!, label: "Review" } }),
    ).toThrow(RangeError);
  }
});
