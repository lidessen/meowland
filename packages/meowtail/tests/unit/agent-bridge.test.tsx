import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { createMeowUI } from "../../src/registry";
import { Button } from "../../src/components/button";
import { Input } from "../../src/components/input";
import { createAgentBridge, type AgentActionReceipt } from "../../src/agent";

function setup(shadow = false) {
  const dom = new Window();
  for (const key of [
    "window",
    "document",
    "HTMLElement",
    "HTMLInputElement",
    "Element",
    "Node",
    "MutationObserver",
  ] as const) {
    Object.defineProperty(globalThis, key, { value: dom[key], configurable: true, writable: true });
  }
  const host = dom.document.createElement("div");
  dom.document.body.append(host);
  const root = dom.document.createElement("main");
  (shadow ? host.attachShadow({ mode: "open" }) : host).append(root);
  return { root: root as unknown as HTMLElement, host };
}

for (const shadow of [false, true]) {
  test(`snapshot filters and labels nodes in ${shadow ? "shadow root" : "document"}`, () => {
    const { root, host } = setup(shadow);
    root.innerHTML =
      '<span id="name">Task title</span><input data-meowui-part="input/root" aria-labelledby="name" value="Hello"><div data-agent-secret><input aria-label="Token" value="private"><div contenteditable>private text</div></div><div data-agent-hidden><button>Hidden task</button></div><div hidden><button>Hidden button</button></div><div inert><button>Inert button</button></div>';
    const bridge = createAgentBridge({ root });
    expect(
      bridge.query({ part: "input/root", role: "textbox", label: "Task title" })[0]?.value,
    ).toBe("Hello");
    expect(bridge.query({ label: "Token" })[0]?.value).toBe("[REDACTED]");
    expect(JSON.stringify(bridge.snapshot())).not.toContain("private");
    expect(bridge.snapshot().map((node) => node.label)).not.toContain("Hidden task");
    expect(bridge.query({ role: "button" })).toHaveLength(0);
    expect(bridge.query({ label: "Task title" })[0]?.ref).toBe(
      bridge.query({ label: "Task title" })[0]?.ref,
    );
    host.remove();
  });
}

test("permission hooks guard mutations and receipts record approved actions", async () => {
  const { root, host } = setup();
  root.innerHTML =
    '<div data-agent-confirm><input aria-label="Title"></div><button disabled>Disabled</button><button>Later hidden</button>';
  const receipts: AgentActionReceipt[] = [];
  let approved = false;
  const bridge = createAgentBridge({
    root,
    confirm: () => approved,
    onAction: (receipt) => receipts.push(receipt),
  });
  const title = bridge.query({ label: "Title" })[0]!;
  const action = { targetRef: title.ref, type: "input" as const, value: "Draft" };
  await expect(bridge.act(action)).rejects.toThrow("permission");
  expect(root.querySelector("input")!.value).toBe("");
  approved = true;
  expect(await bridge.act(action)).toEqual({
    source: "agent",
    type: "input",
    targetRef: title.ref,
    part: null,
  });
  expect(receipts).toHaveLength(1);
  expect(root.querySelector("input")!.value).toBe("Draft");
  const disabled = bridge.query({ label: "Disabled" })[0]!;
  await expect(bridge.act({ targetRef: disabled.ref, type: "click" })).rejects.toThrow("disabled");
  const hidden = bridge.query({ label: "Later hidden" })[0]!;
  root.querySelectorAll("button")[1]!.setAttribute("data-agent-hidden", "");
  await expect(bridge.act({ targetRef: hidden.ref, type: "click" })).rejects.toThrow("unavailable");
  const noHook = createAgentBridge({ root });
  await expect(
    noHook.act({ ...action, targetRef: noHook.query({ label: "Title" })[0]!.ref }),
  ).rejects.toThrow("permission");
  host.remove();
});

test("rechecks the target after asynchronous permission", async () => {
  const { root, host } = setup();
  root.innerHTML = '<input aria-label="Title">';
  let finish!: (allowed: boolean) => void;
  const bridge = createAgentBridge({
    root,
    confirm: () =>
      new Promise<boolean>((resolve) => {
        finish = resolve;
      }),
  });
  const ref = bridge.query({ label: "Title" })[0]!.ref;
  const pending = bridge.act({ targetRef: ref, type: "input", value: "Draft" });
  root.querySelector("input")!.disabled = true;
  finish(true);
  await expect(pending).rejects.toThrow("disabled");
  expect(root.querySelector("input")!.value).toBe("");
  host.remove();
});

test("creates and dispatches a task through mounted components", async () => {
  const { root, host } = setup();
  const events: string[] = [];
  const tasks: { title: string; queue: string }[] = [];
  let title = "";
  let queue = "local";
  const runtime = createRuntime({ plugins: [createMeowUI({ components: [Input, Button] })] });
  const mounted = createWebRenderer(runtime).render(
    <div>
      <Input
        aria-label="Task title"
        onInput={(event: Event) => {
          title = (event.currentTarget as HTMLInputElement).value;
          events.push("input");
        }}
        onChange={() => events.push("change")}
      />
      <select
        aria-label="Queue"
        onChange={(event: Event) => {
          queue = (event.currentTarget as HTMLSelectElement).value;
        }}
      >
        <option value="local">Local</option>
        <option value="remote">Remote</option>
      </select>
      <Button data-agent-confirm="" onClick={() => tasks.push({ title, queue })}>
        Dispatch
      </Button>
    </div>,
    root,
  );
  const receipts: AgentActionReceipt[] = [];
  const bridge = createAgentBridge({
    root,
    confirm: () => true,
    onAction: (receipt) => receipts.push(receipt),
  });
  const input = bridge.query({ part: "input/root", label: "Task title" })[0]!;
  await bridge.act({ targetRef: input.ref, type: "focus" });
  expect(root.ownerDocument.activeElement).toBe(root.querySelector("input"));
  await bridge.act({ targetRef: input.ref, type: "input", value: "Review task" });
  await bridge.act({
    targetRef: bridge.query({ role: "combobox", label: "Queue" })[0]!.ref,
    type: "select",
    value: "remote",
  });
  await bridge.act({
    targetRef: bridge.query({ part: "button/root", label: "Dispatch" })[0]!.ref,
    type: "click",
  });
  expect(tasks).toEqual([{ title: "Review task", queue: "remote" }]);
  expect(events).toEqual(["input", "change"]);
  expect(receipts.map((receipt) => receipt.source)).toEqual(["agent", "agent", "agent", "agent"]);
  mounted.unmount();
  host.remove();
});
