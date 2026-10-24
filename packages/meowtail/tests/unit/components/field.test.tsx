import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { createRuntime, h, type Child } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import { Field, Input, installMeowUI, meowUIComponents } from "../../../src/index";

const dom = new Window() as unknown as Record<string, unknown>;
for (const key of ["document", "HTMLElement", "HTMLInputElement", "Element", "Node"]) {
  Object.defineProperty(globalThis, key, {
    value: dom[key],
    configurable: true,
    writable: true,
  });
}

function mount(node: Child) {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const host = document.createElement("div");
  document.body.append(host);
  const mounted = createWebRenderer(runtime).render(node, host);
  return {
    host,
    unmount() {
      mounted.unmount();
      host.remove();
    },
  };
}

test("live messages appear, change and clear without replacing the control or its message parts", async () => {
  const description = signal<Child>(undefined);
  const error = signal<Child>(undefined);
  const hostDescription = signal<string | undefined>("host-help");
  const view = mount(
    <Field label="Title" htmlFor="title" description={description} error={error}>
      <Input id="title" aria-describedby={hostDescription} />
    </Field>,
  );
  try {
    const input = view.host.querySelector("input")!;
    const root = view.host.querySelector("[data-meowui-part='field/root']")!;
    const hint = view.host.querySelector<HTMLElement>("[data-meowui-part='field/description']")!;
    const feedback = view.host.querySelector<HTMLElement>("[data-meowui-part='field/error']")!;
    input.value = "Unsaved title";
    input.focus();
    input.setSelectionRange(2, 7);

    expect(hint.hidden).toBe(true);
    expect(feedback.hidden).toBe(true);
    expect(input.getAttribute("aria-describedby")).toBe("host-help");
    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(view.host.querySelector("label")!.htmlFor).toBe(input.id);

    description.value = "A public title";
    error.value = "Title is required";
    await Promise.resolve();
    expect(hint.hidden).toBe(false);
    expect(hint.textContent).toBe("A public title");
    expect(feedback.hidden).toBe(false);
    expect(feedback.textContent).toBe("Title is required");
    expect(input.getAttribute("aria-describedby")).toBe("host-help title-description title-error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(root.getAttribute("data-invalid")).toBe("true");

    hostDescription.value = "host-details title-error";
    description.value = "Shown beside the preview";
    error.value = "Choose a different title";
    await Promise.resolve();
    expect(hint.textContent).toBe("Shown beside the preview");
    expect(feedback.textContent).toBe("Choose a different title");
    expect(input.getAttribute("aria-describedby")).toBe(
      "host-details title-error title-description",
    );

    description.value = "";
    error.value = null;
    await Promise.resolve();
    expect(hint.hidden).toBe(true);
    expect(feedback.hidden).toBe(true);
    expect(input.getAttribute("aria-describedby")).toBe("host-details title-error");
    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(root.hasAttribute("data-invalid")).toBe(false);

    hostDescription.value = undefined;
    await Promise.resolve();
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(view.host.querySelector("input")).toBe(input);
    expect(view.host.querySelector("[data-meowui-part='field/description']")).toBe(hint);
    expect(view.host.querySelector("[data-meowui-part='field/error']")).toBe(feedback);
    expect(input.value).toBe("Unsaved title");
    expect(document.activeElement).toBe(input);
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 7]);
  } finally {
    view.unmount();
  }
});

test("explicit invalid state wins and an omitted Field state preserves the host attribute", async () => {
  const invalid = signal(false);
  const error = signal<Child>("Review the value");
  const hostInvalid = signal("grammar");
  const view = mount(
    <div>
      <Field label="Explicit false" invalid={false} error={error}>
        <Input id="explicit" aria-invalid="true" />
      </Field>
      <Field label="Controlled" invalid={invalid} error={error}>
        <Input id="controlled" />
      </Field>
      <Field label="Host state">
        <Input id="host-state" aria-invalid={hostInvalid} />
      </Field>
    </div>,
  );
  try {
    const explicit = view.host.querySelector("#explicit")!;
    const controlled = view.host.querySelector("#controlled")!;
    const host = view.host.querySelector("#host-state")!;
    expect(explicit.getAttribute("aria-invalid")).toBe("false");
    expect(controlled.getAttribute("aria-invalid")).toBe("false");
    expect(host.getAttribute("aria-invalid")).toBe("grammar");
    invalid.value = true;
    hostInvalid.value = "spelling";
    error.value = "";
    await Promise.resolve();
    expect(explicit.getAttribute("aria-invalid")).toBe("false");
    expect(controlled.getAttribute("aria-invalid")).toBe("true");
    expect(host.getAttribute("aria-invalid")).toBe("spelling");
    invalid.value = false;
    await Promise.resolve();
    expect(controlled.getAttribute("aria-invalid")).toBe("false");
  } finally {
    view.unmount();
  }
});

test("empty top-level messages hide and remove their ids while zero remains content", async () => {
  const message = signal<Child>(0);
  const view = mount(
    <Field
      label="Count"
      description={message}
      descriptionId="count-help"
      error={message}
      errorId="count-error"
    >
      <input />
    </Field>,
  );
  try {
    const input = view.host.querySelector("input")!;
    const hint = view.host.querySelector<HTMLElement>("#count-help")!;
    expect(hint.hidden).toBe(false);
    expect(hint.textContent).toBe("0");
    expect(input.getAttribute("aria-describedby")).toBe("count-help count-error");
    for (const value of [null, undefined, false, ""]) {
      message.value = value;
      await Promise.resolve();
      expect(hint.hidden).toBe(true);
      expect(input.hasAttribute("aria-describedby")).toBe(false);
      expect(input.getAttribute("aria-invalid")).toBe("false");
    }
    message.value = 0;
    await Promise.resolve();
    expect(hint.hidden).toBe(false);
    expect(hint.textContent).toBe("0");
    expect(input.getAttribute("aria-describedby")).toBe("count-help count-error");
  } finally {
    view.unmount();
  }
});

test("multiple controls keep the caller's manual associations", async () => {
  const error = signal<Child>(undefined);
  const view = mount(
    <Field label="Range" error={error} errorId="range-error">
      <input id="start" aria-describedby="range-error" aria-invalid="grammar" />
      <input id="end" aria-describedby="range-error" />
    </Field>,
  );
  try {
    error.value = "End must follow start";
    await Promise.resolve();
    expect(view.host.querySelector("#start")!.getAttribute("aria-invalid")).toBe("grammar");
    expect(view.host.querySelector("#end")!.hasAttribute("aria-invalid")).toBe(false);
    for (const input of view.host.querySelectorAll("input"))
      expect(input.getAttribute("aria-describedby")).toBe("range-error");
  } finally {
    view.unmount();
  }
});
