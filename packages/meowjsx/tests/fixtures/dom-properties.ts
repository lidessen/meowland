import { createRuntime, h, signal } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";

export interface DOMPropertyFixture {
  executionStrict: boolean;
  update(): void;
  counts(): { mounted: number; cleaned: number; clicks: number; inputs: number };
  unmount(): void;
  clickDetached(): void;
}

declare global {
  interface Window {
    domPropertyFixture: DOMPropertyFixture;
  }
}

const executionStrict = (function (this: unknown) {
  return this === undefined;
})();
const viewBox = signal("0 0 100 100");
const width = signal("24");
const fill = signal("navy");
const value = signal("initial");
const checked = signal(false);
const className = signal("initial-class");
let mounted = 0;
let cleaned = 0;
let clicks = 0;
let inputs = 0;
const runtime = createRuntime();
const host = document.querySelector("#app")!;
const rendered = createWebRenderer(runtime).render(
  h(
    "div",
    null,
    h(
      "svg",
      {
        viewBox,
        width,
        height: "24",
        fill,
        "aria-label": "Property vector",
        className: ["vector", [false, null, className]],
      },
      h("path", { d: "M10 10h80v80H10Z" }),
    ),
    h("input", {
      id: "text",
      className: ["field", className],
      value,
      ref: () => {
        mounted++;
        return () => {
          cleaned++;
        };
      },
      onInput: () => {
        inputs++;
      },
    }),
    h("input", { id: "check", type: "checkbox", checked }),
    h(
      "button",
      {
        type: "button",
        onClick: () => {
          clicks++;
        },
      },
      "Action",
    ),
  ),
  host,
);
const button = host.querySelector("button")!;
window.domPropertyFixture = {
  executionStrict,
  update() {
    viewBox.value = "0 0 200 150";
    width.value = "48";
    fill.value = "teal";
    value.value = "updated";
    checked.value = true;
    className.value = "updated-class";
  },
  counts: () => ({ mounted, cleaned, clicks, inputs }),
  unmount: () => rendered.unmount(),
  clickDetached: () => button.click(),
};
