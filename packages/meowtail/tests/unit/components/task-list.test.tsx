import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { createRuntime, h, signal } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { ChatReasoning } from "../../../src/chat/reasoning";
import { TaskList, type TaskListEntry } from "../../../src/components/task-list";
import { installMeowUI, meowUIComponents } from "../../../src/registry";

const dom = new Window() as unknown as Record<string, unknown>;
for (const key of ["document", "HTMLElement", "Element", "Node", "MutationObserver"]) {
  Object.defineProperty(globalThis, key, { value: dom[key], configurable: true, writable: true });
}

function mount(node: unknown) {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
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

const plan = (current: number): TaskListEntry[] =>
  ["Scaffold", "Registry", "Gating"].map((label, index) => ({
    id: label.toLowerCase(),
    label,
    state: index < current ? "success" : index === current ? "running" : "queued",
  }));

test("a task list counts done steps, keeps rows by id and states them in text", async () => {
  const items = signal(plan(1));
  const view = mount(<TaskList items={items} />);
  const root = view.host.querySelector("details")!;
  const count = view.host.querySelector("[data-meowui-part='task-list/count']")!;
  const rows = () => [...view.host.querySelectorAll("li")];
  expect(root.open).toBe(true);
  expect(root.getAttribute("data-execution-state")).toBe("running");
  expect(count.textContent).toBe("1/3");
  expect(count.getAttribute("aria-label")).toBe("1 of 3 done");
  expect(rows().map((row) => row.getAttribute("data-execution-state"))).toEqual([
    "success",
    "running",
    "queued",
  ]);
  expect(rows()[1]!.querySelector("[data-meowui-part='task-list/state']")!.textContent).toBe(
    "Running",
  );
  const registry = rows()[1];

  items.value = plan(3);
  await Promise.resolve();
  expect(count.textContent).toBe("3/3");
  expect(root.getAttribute("data-execution-state")).toBe("success");
  expect(rows()[1]).toBe(registry!);
  view.unmount();
});

test("task progress shows a percent only for checked host values", async () => {
  const items = signal<TaskListEntry[]>([
    { id: "a", label: "Registry", state: "running", progress: { value: 1, max: 25 } },
  ]);
  const view = mount(<TaskList items={items} />);
  expect(view.host.querySelector("[data-meowui-part='task-list/progress']")!.textContent).toBe(
    "4%",
  );
  view.unmount();
  expect(() =>
    mount(
      <TaskList
        items={[{ id: "b", label: "Bad", state: "running", progress: { value: 2, max: 1 } }]}
      />,
    ),
  ).toThrow(RangeError);
});

test("reasoning stays open while active and folds to its done label afterwards", async () => {
  const active = signal(true);
  const text = signal("Reading the timeline.");
  const view = mount(
    <ChatReasoning
      label="Drafting the rollout policy"
      doneLabel="Thought for 12s"
      text={text}
      active={active}
    />,
  );
  const root = view.host.querySelector("details")!;
  expect(root.open).toBe(true);
  expect(root.getAttribute("data-active")).toBe("true");
  expect(root.getAttribute("aria-busy")).toBe("true");
  expect(root.querySelector("summary")!.textContent).toContain("Drafting the rollout policy");

  text.value = "Reading the timeline.\nChecking the deploy policy.";
  active.value = false;
  await Promise.resolve();
  expect(root.open).toBe(false);
  expect(root.hasAttribute("aria-busy")).toBe(false);
  expect(root.querySelector("summary")!.textContent).toContain("Thought for 12s");
  expect(root.querySelector("p")!.textContent).toContain("Checking the deploy policy.");
  view.unmount();
});
