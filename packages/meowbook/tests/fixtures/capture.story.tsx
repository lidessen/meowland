import { createContext, h, signal, useContext } from "meowjsx";
import { defineStory, replaceComponent, type ComponentMetadata } from "meowbook";
import { readCaptureFacts } from "../../src/web/capture-facts";
import {
  Button,
  Dialog,
  DialogPanel,
  DialogHeader,
  Menu,
  PageFrame,
  mountRegionLayout,
  installMeowUI,
} from "meowtail";

const LabelContext = createContext("missing-context");
function CaptureButton({ label }: { label?: string }) {
  return (
    <button
      style="margin:4px;padding:8px;box-shadow:0 0 3px #333"
      aria-label={label ?? useContext(LabelContext)}
    >
      {label ?? useContext(LabelContext)}
    </button>
  );
}
function TransparentLayout({ children }: { children?: import("meowjsx").Child }) {
  return <div style="padding:12px">{children}</div>;
}
TransparentLayout.metadata = { capture: { transparent: true } } satisfies ComponentMetadata;
function VisibleLayout({ children }: { children?: import("meowjsx").Child }) {
  return <section style="padding:10px;background:#edf2f5">{children}</section>;
}
function TextOutput() {
  return "Text output";
}
function MultiRoot() {
  return [<span>First root</span>, <span style="margin-left:16px">Second root</span>];
}
function EmptyOutput() {
  return null;
}
function CaptureApp() {
  return (
    <LabelContext.Provider value="Inherited label">
      <TransparentLayout>
        <CaptureButton />
        <CaptureButton label="Second instance" />
        <VisibleLayout>
          <CaptureButton label="Nested" />
        </VisibleLayout>
        <TextOutput />
        <MultiRoot />
        <EmptyOutput />
      </TransparentLayout>
    </LabelContext.Provider>
  );
}
export const Tree = defineStory({ id: "capture/tree", render: () => <CaptureApp /> });
function ErrorPanel({ children }: { children?: import("meowjsx").Child }) {
  return (
    <aside>
      {children}
      <p>Replacement</p>
    </aside>
  );
}
export const Replaced = defineStory({
  id: "capture/replaced",
  replacements: [replaceComponent(TransparentLayout, ErrorPanel)],
  render: () => <CaptureApp />,
});
function HiddenOutput() {
  return <button style="display:none">Hidden</button>;
}
function OffscreenOutput() {
  return <button style="position:absolute;left:2000px">Offscreen</button>;
}
function ClippedOutput() {
  return <button style="position:absolute;top:200px">Clipped</button>;
}
function GeometryApp() {
  return (
    <div>
      <HiddenOutput />
      <OffscreenOutput />
      <div style="position:relative;overflow:hidden;width:100px;height:40px">
        <ClippedOutput />
      </div>
      <CaptureButton label="Visible" />
      <span style="overflow:hidden">
        <CaptureButton label="Inline visible" />
      </span>
    </div>
  );
}
export const Geometry = defineStory({ id: "capture/geometry", render: () => <GeometryApp /> });
function DynamicApp() {
  const child = signal<import("meowjsx").Child>(<CaptureButton label="Initial" />);
  return (
    <div>
      <button
        onclick={() => {
          child.value = Promise.resolve(<CaptureButton label="Deferred" />);
        }}
      >
        Replace
      </button>
      {child}
      <input aria-label="Draft" />
    </div>
  );
}
export const Dynamic = defineStory({ id: "capture/dynamic", render: () => <DynamicApp /> });
export const Timeout = defineStory({
  id: "capture/timeout",
  render: () => <CaptureButton />,
  ready: () => new Promise<void>(() => {}),
});
export const HiddenImages = defineStory({
  id: "capture/hidden-images",
  render: () => (
    <div>
      <CaptureButton label="Visible image fallback" />
      <img hidden src="data:image/png,invalid" alt="Hidden failed image" />
      <dialog>
        <img loading="lazy" src="/never-loaded.png" alt="Closed dialog image" />
      </dialog>
    </div>
  ),
});

function InspectorApp() {
  let dialog: HTMLDialogElement | undefined;
  const rows = Array.from({ length: 30 }, (_, index) => <p>Reading row {index + 1}</p>);
  return (
    <div>
      <Button onClick={() => dialog?.showModal()}>Open short dialog</Button>
      <Dialog
        labelledBy="inspector-dialog-title"
        ref={(node: HTMLDialogElement) => {
          dialog = node;
        }}
      >
        <DialogPanel
          style={{ height: "220px", width: "400px" }}
          header={
            <DialogHeader
              title="Inspector reading"
              titleId="inspector-dialog-title"
              actions={<Button onClick={() => dialog?.close()}>Close dialog</Button>}
            />
          }
        >
          {rows}
          <input aria-label="Inspector draft" />
        </DialogPanel>
      </Dialog>
      <PageFrame scrollOwner="content" style={{ height: "200px", width: "400px" }}>
        <div style="overflow:auto" data-inspector-scroll>
          {rows}
        </div>
      </PageFrame>
      <Menu
        id="inspector-menu"
        trigger={(bindings) => <Button {...bindings}>Open long menu</Button>}
        items={Array.from({ length: 40 }, (_, index) => ({
          id: String(index),
          label: `Action ${index + 1}`,
        }))}
      />
      <select aria-label="Native inspector choice">
        <option>First</option>
        <option>Second</option>
      </select>
      <div data-inspector-shadow style="height:100px;width:240px" />
      <iframe title="Opaque inspector frame" srcdoc={'<input aria-label="Frame draft">'} />
    </div>
  );
}
export const Inspector = defineStory({
  id: "capture/inspector",
  render: () => <InspectorApp />,
  setup({ root, onCleanup }) {
    onCleanup(installMeowUI());
    const host = root.querySelector<HTMLElement>("[data-inspector-shadow]")!;
    const layout = mountRegionLayout(
      host,
      {
        areas: [["reader"]],
        columns: ["fill"],
        rows: ["fill"],
        regions: { reader: { scrollOwner: "layout" } },
      },
      { isolateContent: true },
    );
    onCleanup(() => layout.dispose());
    const viewport = layout.regions.reader!;
    const input = document.createElement("input");
    input.setAttribute("aria-label", "Shadow draft");
    const content = document.createElement("div");
    content.style.cssText = "height:200px;flex-shrink:0";
    const nested = document.createElement("div");
    nested.style.cssText = "height:60px;overflow:auto";
    const long = document.createElement("div");
    long.style.height = "180px";
    nested.append(long);
    content.append(nested);
    viewport.append(input, content);
    const component = () => null;
    root.dataset.ambiguousFacts = JSON.stringify(
      readCaptureFacts(
        root.ownerDocument,
        [1, 2].map((id) => ({
          id,
          parent: null,
          component,
          originalComponent: component,
          nodes: new Set<Node>([viewport]),
        })),
      ),
    );
  },
});
