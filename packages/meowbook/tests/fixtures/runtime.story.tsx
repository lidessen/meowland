import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory, replaceComponent } from "meowbook";
import { Placeholder } from "../../src/web";

function ExpensiveChild(props: { label: string }) {
  document.body.dataset.childExecuted = "true";
  return <section>{props.label}</section>;
}
const prepared = <ExpensiveChild label="Real child component" />;
export const CustomContainer = defineStory({
  id: "runtime/custom-container",
  container: (children) => <section data-custom-container>{children}</section>,
  render: () => <input aria-label="Container draft" />,
});
export const BareContainer = defineStory({
  id: "runtime/bare-container",
  container: false,
  render: () => <input aria-label="Bare container draft" />,
});
function Complex() {
  return (
    <div>
      <h2>Complex components</h2>
      {prepared}
      <ExpensiveChild label="Second instance" />
    </div>
  );
}
export const Full = defineStory({
  id: "runtime/full",
  title: "Full preview",
  render: () => <Complex />,
});
export const Partial = defineStory({
  id: "runtime/partial",
  title: "Partial preview",
  replacements: [
    replaceComponent(ExpensiveChild, () => <Placeholder label="Child component" height={120} />),
  ],
  render: () => <Complex />,
});
export const Interactive = defineStory({
  id: "runtime/input",
  title: "Input and cleanup",
  render: () => <input aria-label="Draft" />,
  setup({ onCleanup }) {
    onCleanup(() =>
      localStorage.setItem(
        "meowbook-cleanups",
        String(Number(localStorage.getItem("meowbook-cleanups") ?? 0) + 1),
      ),
    );
  },
});
export const AsyncReady = defineStory({
  id: "runtime/async",
  title: "Explicit async readiness",
  render: () => <div id="async-content">Preparing</div>,
  async ready({ root }) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    root.querySelector("#async-content")!.textContent = "Async complete";
  },
});
export const LateError = defineStory({
  id: "runtime/late-error",
  title: "Late async error",
  render: () => {
    const content = signal<Promise<string> | string>("Initial content");
    return (
      <div>
        <button
          onclick={() => {
            content.value = Promise.reject(new Error("fixture late error"));
          }}
        >
          Trigger async error
        </button>
        {content}
      </div>
    );
  },
});
export const RenderError = defineStory({
  id: "runtime/render-error",
  title: "Render error",
  render() {
    throw new Error("fixture render error");
  },
});
