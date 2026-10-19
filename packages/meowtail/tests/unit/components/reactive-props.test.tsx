import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { createRuntime, h, signal } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { AssistantComposer } from "../../../src/chat/assistant-composer";
import type { AssistantDraft } from "../../../src/chat/assistant-types";
import { ChatComposer } from "../../../src/chat/composer";
import { Checkbox } from "../../../src/components/checkbox";
import { ChoiceGroup } from "../../../src/components/choice-group";
import { ChoiceSelect } from "../../../src/components/choice-select";
import { CodeBlock } from "../../../src/components/code-block";
import { MetaRow } from "../../../src/components/meta-row";
import { NavItem } from "../../../src/components/nav-item";
import { NumberInput } from "../../../src/components/number-input";
import { Pill } from "../../../src/components/pill";
import { Popover } from "../../../src/components/popover";
import { RiskConfirmation } from "../../../src/components/risk-confirmation";
import { SegmentedControl } from "../../../src/components/segmented-control";
import { Slider } from "../../../src/components/slider";
import { TextShimmer } from "../../../src/components/text-shimmer";
import { installMeowUI } from "../../../src/registry";

const dom = new Window() as unknown as Record<string, unknown>;
for (const key of [
  "document",
  "HTMLElement",
  "HTMLInputElement",
  "HTMLTextAreaElement",
  "HTMLButtonElement",
  "Element",
  "Node",
  "ResizeObserver",
  "MutationObserver",
]) {
  Object.defineProperty(globalThis, key, {
    value: dom[key],
    configurable: true,
    writable: true,
  });
}

function mount(node: unknown) {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const host = document.createElement("div");
  document.body.append(host);
  const mounted = createWebRenderer(runtime).mount(node as never, host);
  return {
    host,
    unmount() {
      mounted.unmount();
      host.remove();
    },
  };
}

test("controlled false, zero, and empty string stay live after mount", async () => {
  const active = signal(false);
  const open = signal(false);
  const sliderValue = signal(0);
  const numberValue = signal<number | undefined>(0);
  const choice = signal("");
  const progress = signal<number | undefined>(0);
  const checked = signal(false);
  const acknowledged = signal(false);
  const view = mount(
    <div>
      <Pill active={active}>Fact</Pill>
      <Popover
        id="reactive-popover"
        open={open}
        defaultOpen
        trigger={(bindings) => <button {...bindings}>Open</button>}
      >
        Panel
      </Popover>
      <Slider label="Amount" value={sliderValue} />
      <NumberInput value={numberValue} />
      <ChoiceSelect
        options={[
          { value: "", label: "None" },
          { value: "alpha", label: "Alpha" },
        ]}
        value={choice}
      />
      <MetaRow items={[{ label: "Ready" }]} progress={progress} />
      <Checkbox label="Save" checked={checked} defaultChecked />
      <RiskConfirmation
        id="reactive-risk"
        open={false}
        title="Confirm"
        description="This cannot be undone."
        acknowledgeLabel="I understand"
        cancelLabel="Cancel"
        confirmLabel="Continue"
        acknowledged={acknowledged}
        onAcknowledgedChange={() => {}}
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    </div>,
  );

  const pill = view.host.querySelector("[data-meowui-part='pill/root']")!;
  const trigger = view.host.querySelector("#reactive-popover-trigger")!;
  const range = view.host.querySelector<HTMLInputElement>("input[type='range']")!;
  const number = view.host.querySelector<HTMLInputElement>(
    "[data-meowui-part='number-input/control']",
  )!;
  const caption = view.host.querySelector("[data-meowui-part='choice-select/value']")!;
  const checkbox = view.host.querySelector<HTMLInputElement>(
    "[data-meowui-part='checkbox/input']",
  )!;
  const confirm = [...view.host.querySelectorAll("button")].find(
    (button) => button.textContent === "Continue",
  )!;

  expect(pill.getAttribute("data-active")).toBe("false");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(range.value).toBe("0");
  expect(view.host.querySelector("[data-meowui-part='slider/value']")!.textContent).toBe("0");
  expect(number.value).toBe("0");
  expect(caption.textContent).toBe("None");
  expect(view.host.querySelector("[role='progressbar']")!.getAttribute("aria-valuenow")).toBe("0");
  expect(checkbox.checked).toBe(false);
  expect(confirm.disabled).toBe(true);

  active.value = true;
  sliderValue.value = 25;
  numberValue.value = undefined;
  choice.value = "alpha";
  progress.value = undefined;
  checked.value = true;
  acknowledged.value = true;
  await Promise.resolve();

  expect(pill.getAttribute("data-active")).toBe("true");
  expect(range.value).toBe("25");
  expect(view.host.querySelector("[data-meowui-part='slider/value']")!.textContent).toBe("25");
  expect(number.value).toBe("");
  expect(caption.textContent).toBe("Alpha");
  expect(view.host.querySelector("[role='progressbar']")).toBeNull();
  expect(checkbox.checked).toBe(true);
  expect(confirm.disabled).toBe(false);
  view.unmount();
});

test("segmented control, navigation, and shimmer follow later signal values", async () => {
  const selected = signal("left");
  const active = signal(false);
  const view = mount(
    <div>
      <SegmentedControl
        id="reactive-segment"
        label="Side"
        value={selected}
        options={[
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ]}
        onValueChange={() => {}}
      />
      <NavItem label="Inbox" active={active} />
      <TextShimmer active={active}>Working</TextShimmer>
      <ChoiceGroup
        label="Mode"
        value={selected}
        options={[
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ]}
      />
    </div>,
  );
  const radios = [...view.host.querySelectorAll<HTMLInputElement>("input[type='radio']")];
  expect(radios.map((radio) => radio.checked)).toEqual([true, false, true, false]);
  expect(
    view.host.querySelector("[data-meowui-part='nav-item/root']")!.getAttribute("aria-current"),
  ).toBeNull();
  expect(
    view.host.querySelector("[data-meowui-part='text-shimmer/root']")!.getAttribute("data-active"),
  ).toBe("false");

  selected.value = "right";
  active.value = true;
  await Promise.resolve();

  expect(radios.map((radio) => radio.checked)).toEqual([false, true, false, true]);
  expect(
    view.host.querySelector("[data-meowui-part='nav-item/root']")!.getAttribute("aria-current"),
  ).toBe("page");
  expect(
    view.host.querySelector("[data-meowui-part='text-shimmer/root']")!.getAttribute("data-active"),
  ).toBe("true");
  view.unmount();
});

test("composer keeps the same field, draft, and caret while surrounding signals change", async () => {
  const draft = signal<AssistantDraft>({ text: "hello", attachments: [] });
  const models = signal([{ value: "alpha", label: "Alpha" }]);
  const disabled = signal(false);
  const view = mount(
    <div>
      <ChatComposer value={draft.value.text} disabled={disabled} inputLabel="Plain draft" />
      <AssistantComposer
        options={{
          messages: [],
          draft,
          onDraftChange: (next) => {
            draft.value = next;
          },
          models,
          disabled,
        }}
      />
    </div>,
  );
  const fields = [...view.host.querySelectorAll<HTMLTextAreaElement>("textarea")];
  expect(fields).toHaveLength(2);
  const [plain, assistant] = fields as [HTMLTextAreaElement, HTMLTextAreaElement];
  plain.focus();
  plain.setSelectionRange(1, 4);
  assistant.focus();
  assistant.setSelectionRange(1, 4);

  models.value = [
    { value: "alpha", label: "Alpha" },
    { value: "beta", label: "Beta" },
  ];
  await Promise.resolve();

  expect(view.host.querySelectorAll("textarea")[1]).toBe(assistant);
  expect(assistant.value).toBe("hello");
  expect(document.activeElement).toBe(assistant);
  expect(assistant.selectionStart).toBe(1);
  expect(assistant.selectionEnd).toBe(4);

  disabled.value = true;
  await Promise.resolve();
  expect(view.host.querySelectorAll("textarea")[0]).toBe(plain);
  expect(view.host.querySelectorAll("textarea")[1]).toBe(assistant);
  expect(plain.value).toBe("hello");
  expect(assistant.value).toBe("hello");
  expect(plain.disabled).toBe(true);
  expect(assistant.disabled).toBe(true);
  expect(view.host.querySelector<HTMLButtonElement>("button[type='submit']")!.disabled).toBe(true);

  disabled.value = false;
  draft.value = { text: "", attachments: [] };
  await Promise.resolve();
  expect(assistant.value).toBe("");
  expect(assistant.disabled).toBe(false);
  expect(plain.value).toBe("hello");
  view.unmount();
});

test("code block keeps wrap state when its code signal changes", async () => {
  const code = signal("const value = 1;");
  const view = mount(<CodeBlock code={code} language="typescript" />);
  const root = view.host.querySelector("figure")!;
  const wrap = [...view.host.querySelectorAll("button")].find((button) =>
    button.textContent?.includes("Soft wrap"),
  )!;
  wrap.click();
  await Promise.resolve();
  expect(wrap.getAttribute("aria-pressed")).toBe("true");

  code.value = "const value = 2;";
  await Promise.resolve();
  expect(view.host.querySelector("figure")).toBe(root);
  expect(wrap.getAttribute("aria-pressed")).toBe("true");
  expect(view.host.textContent).toContain("const value = 2;");
  view.unmount();
});
