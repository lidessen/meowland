import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { ChatComposer } from "../../../src/chat/composer";
import { ChatAttachments } from "../../../src/chat/attachments";

test("composer places supplied attachments within the form without owning uploads", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <ChatComposer inputLabel="Work draft" attachments={<span>Materials to send</span>}>
      <button type="button">Add materials</button>
    </ChatComposer>,
  );
  expect(html).toContain('aria-label="Work draft"');
  expect(html.indexOf("Materials to send")).toBeLessThan(html.indexOf("<textarea"));
  expect(html).not.toContain('type="file"');
});

test("draft images expose distinct preview and removal callbacks while sent images stay links", () => {
  const runtime = createRuntime();
  const actions = new Map<string, () => void>();
  runtime.use({
    render: ({ vnode }, next) => {
      if (vnode.type === "button")
        actions.set(String(vnode.props["aria-label"]), vnode.props.onClick as () => void);
      return next(vnode);
    },
  });
  const calls: string[] = [];
  const file = { id: "draft", name: "canvas.svg", mediaType: "image/svg+xml", url: "/canvas.svg" };
  const web = createWebRenderer(runtime);
  const draft = web.renderToHtml(
    <ChatAttachments
      items={[
        { ...file, onPreview: () => calls.push("preview"), onRemove: () => calls.push("remove") },
      ]}
    />,
  );
  expect(draft).toContain('aria-label="Preview canvas.svg"');
  expect(draft).toContain('aria-label="Remove canvas.svg"');
  expect(draft).not.toContain('href="/canvas.svg"');
  actions.get("Preview canvas.svg")!();
  actions.get("Remove canvas.svg")!();
  expect(calls).toEqual(["preview", "remove"]);
  const sent = web.renderToHtml(<ChatAttachments items={[file]} />);
  expect(sent).toContain('href="/canvas.svg"');
  expect(sent).not.toContain("Remove");
  expect(sent).not.toContain("<button");
});
