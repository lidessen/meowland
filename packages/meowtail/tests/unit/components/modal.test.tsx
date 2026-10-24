import { expect, test } from "bun:test";
import { createRuntime, h, signal, type MaybeSignal, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Button } from "../../../src/components/button";
import { Modal } from "../../../src/components/modal";
import { installMeowUI, meowUIComponents } from "../../../src/registry";
import { mountComponent } from "./mount";

function web() {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  return createWebRenderer(runtime);
}

test("modal renders a closed native dialog with the generated heading and description ids", () => {
  const html = web().renderToHtml(
    <Modal
      open={false}
      onOpenChange={() => {}}
      title="Rename workspace"
      description="The name appears in the sidebar and in shared links."
      actions={[<Button variant="quiet">Cancel</Button>, <Button>Save name</Button>]}
    >
      <p>Body copy stays inside the review.</p>
    </Modal>,
  );
  expect(html).toMatch(/^<div[^>]*><dialog[^>]*>/);
  expect(html).not.toMatch(/<dialog[^>]*\sopen[\s>]/);
  const labelledBy = /aria-labelledby="([^"]+)"/.exec(html)?.[1];
  const describedBy = /aria-describedby="([^"]+)"/.exec(html)?.[1];
  expect(labelledBy).toMatch(/^modal-\d+-title$/);
  expect(describedBy).toMatch(/^modal-\d+-description$/);
  expect(html).toContain(`id="${labelledBy}"`);
  expect(html).toContain(`id="${describedBy}"`);
  expect(html).toContain(">Rename workspace</h2>");
  expect(html).toContain("The name appears in the sidebar and in shared links.");
  expect(html).toContain("Body copy stays inside the review.");
  expect(html).toContain('data-meowui-part="dialog-actions/root"');
  expect(html).toContain("Save name");
  expect(html).toContain('aria-label="Close"');
});

test("a host id bases the generated ids and the wrapper keeps it", () => {
  const html = web().renderToHtml(
    <Modal id="rename-workspace" open={false} onOpenChange={() => {}} title="Rename workspace">
      Body copy
    </Modal>,
  );
  expect(html).toContain('id="rename-workspace"');
  expect(html).toContain('aria-labelledby="rename-workspace-title"');
  expect(html).toContain('id="rename-workspace-title"');
  expect(html).not.toContain("aria-describedby");
  expect(html).not.toContain('data-meowui-part="dialog-actions/root"');
});

test("generated bases are distinct per mounted modal", () => {
  const first = web().renderToHtml(
    <Modal open={false} onOpenChange={() => {}} title="First review">
      First body
    </Modal>,
  );
  const second = web().renderToHtml(
    <Modal open={false} onOpenChange={() => {}} title="Second review">
      Second body
    </Modal>,
  );
  const labelOf = (html: string) => /aria-labelledby="([^"]+)"/.exec(html)?.[1];
  expect(labelOf(first)).toMatch(/-title$/);
  expect(labelOf(second)).toMatch(/-title$/);
  expect(labelOf(first)).not.toBe(labelOf(second));
});

test("dismissible false removes the header close entry and keeps the dialog non-dismissible", () => {
  const html = web().renderToHtml(
    <Modal open={false} onOpenChange={() => {}} title="Final review" dismissible={false}>
      <p>Locked copy</p>
    </Modal>,
  );
  expect(html).not.toContain('aria-label="Close"');
  expect(html).not.toContain("<button");
  expect(html).toContain("Locked copy");
});

test("a custom close label names the default close entry", () => {
  const html = web().renderToHtml(
    <Modal open={false} onOpenChange={() => {}} title="Review" closeLabel="Dismiss review">
      Body copy
    </Modal>,
  );
  expect(html).toContain('aria-label="Dismiss review"');
  expect(html).not.toContain('aria-label="Close"');
});

function captureDialog(open: MaybeSignal<boolean>, dismissible = true) {
  const runtime = createRuntime();
  const dialogs: Props[] = [];
  const buttons: Props[] = [];
  runtime.use({
    render({ vnode }, next) {
      if (vnode.type === "dialog") dialogs.push(vnode.props);
      if (vnode.type === "button") buttons.push(vnode.props);
      return next(vnode);
    },
  });
  const changes: boolean[] = [];
  const view = mountComponent(
    <Modal
      open={open}
      onOpenChange={(next) => changes.push(next)}
      title="Review"
      actions={<Button>Keep</Button>}
      dismissible={dismissible}
    >
      <p>Body copy</p>
    </Modal>,
    runtime,
  );
  return { dialog: dialogs[0]!, buttons, changes, unmount: view.unmount };
}

test("close entry, Escape, backdrop and native close route through onOpenChange", () => {
  const open = signal(false);
  const { dialog, buttons, changes, unmount } = captureDialog(open);
  const close = buttons.find((button) => button["aria-label"] === "Close");
  expect(close).toBeDefined();
  (close!.onClick as () => void)();
  expect(changes).toEqual([false]);

  // Escape and the backdrop are prevented and reported, so the owner decides.
  let prevented = false;
  (dialog.onCancel as (event: Event) => void)({
    preventDefault: () => {
      prevented = true;
    },
  } as unknown as Event);
  expect(prevented).toBe(true);
  expect(changes).toEqual([false, false]);

  const backdrop = {};
  (dialog.onClick as (event: MouseEvent) => void)({
    target: backdrop,
    currentTarget: backdrop,
  } as unknown as MouseEvent);
  expect(changes).toEqual([false, false, false]);

  // A click on panel content is not a backdrop dismissal.
  (dialog.onClick as (event: MouseEvent) => void)({
    target: {},
    currentTarget: {},
  } as unknown as MouseEvent);
  expect(changes).toEqual([false, false, false]);

  // The owner already closed it: the closing event must not report twice.
  (dialog.onClose as () => void)();
  expect(changes).toEqual([false, false, false]);

  // A native close the owner did not initiate still reaches the open owner.
  open.value = true;
  (dialog.onClose as () => void)();
  expect(changes).toEqual([false, false, false, false]);
  unmount();
});

test("a non-dismissible modal ignores Escape and backdrop dismissal", () => {
  const { dialog, buttons, changes, unmount } = captureDialog(false, false);
  expect(buttons.find((button) => button["aria-label"] === "Close")).toBeUndefined();
  let prevented = false;
  (dialog.onCancel as (event: Event) => void)({
    preventDefault: () => {
      prevented = true;
    },
  } as unknown as Event);
  expect(prevented).toBe(true);
  const backdrop = {};
  (dialog.onClick as (event: MouseEvent) => void)({
    target: backdrop,
    currentTarget: backdrop,
  } as unknown as MouseEvent);
  expect(changes).toEqual([]);
  unmount();
});
