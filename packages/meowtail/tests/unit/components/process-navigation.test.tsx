import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { h, defaultRuntime, createRuntime } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createWebRenderer, renderToHtml } from "meowjsx/web";
import { ChatProcess } from "../../../src/chat/process";
import { AssistantView } from "../../../src/chat/assistant";
import { AssistantQuestionView } from "../../../src/chat/assistant-question";
import { ChatToolCall } from "../../../src/chat/tool-call";
import { IconRail } from "../../../src/components/icon-rail";
import { ProcessGroup } from "../../../src/components/process-group";
import { ProcessStep } from "../../../src/components/process-step";
import { RailItem } from "../../../src/components/rail-item";
import { RailSection } from "../../../src/components/rail-section";
import { StatusDot, statusDotOptions } from "../../../src/components/status-dot";
import { Tag } from "../../../src/components/tag";
import { WorkCard } from "../../../src/components/work-card";
import { installMeowUI, meowUIComponents } from "../../../src/registry";

installMeowUI({ components: meowUIComponents }, defaultRuntime);

test("status dots are decorative and carry exactly one state", () => {
  for (const state of statusDotOptions.axes.state) {
    const html = renderToHtml(<StatusDot state={state} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain(`data-option-status-dot-state="${state}"`);
  }
  const halo = renderToHtml(<StatusDot state="processing" halo size={10} />);
  expect(halo).toContain('data-halo="true"');
  expect(halo).toContain("--status-dot-size");
  expect(halo).toContain("10px");
});

test("tags are static spans; count and path are separate kinds", () => {
  const html = renderToHtml(
    <Tag kind="count" tone="warning">
      1
    </Tag>,
  );
  expect(html).toContain("<span");
  expect(html).toContain('data-option-tag-kind="count"');
  expect(html).toContain('data-option-tag-tone="warning"');
});

test("process group keeps native details and one row per step", () => {
  const html = renderToHtml(
    <ProcessGroup title="Process · 2 steps" status="Completed" trailing="4.2s" open>
      <ProcessStep meta="1.1s">Read file</ProcessStep>
    </ProcessGroup>,
  );
  expect(html).toContain("<details");
  expect(html).toContain("<summary");
  expect(html).toContain(" open");
  expect(html).toContain("Process · 2 steps");
  expect(html).toContain("1.1s");
  expect(html).toContain("4.2s");
});

test("work card is one native button with a status dot and an open affordance", () => {
  const html = renderToHtml(
    <WorkCard
      title="Organize records"
      state="returned"
      status="In progress"
      detail="1 outcome linked"
    />,
  );
  expect(html.startsWith("<button")).toBe(true);
  expect(html).toContain('type="button"');
  expect(html).toContain('data-option-status-dot-state="returned"');
  expect(html).toContain("1 outcome linked");
  expect(html).toContain("Details");
});

test("rail items are routes or actions and keep the current location semantic", () => {
  const route = renderToHtml(
    <RailItem href="/records" current icon="i" label="Memory and knowledge" />,
  );
  expect(route.startsWith("<a")).toBe(true);
  expect(route).toContain('aria-current="page"');
  const action = renderToHtml(<RailItem icon="i" label="Settings" />);
  expect(action.startsWith("<button")).toBe(true);
  expect(action).not.toContain("aria-current");
});

test("rail section folds into a shortcut while keeping all destinations in the document", () => {
  const html = renderToHtml(
    <IconRail label="Main navigation">
      <RailSection label="Extensions" icon="i" href="/extensions">
        <RailItem href="/extensions?view=channels" icon="i" label="Communication" />
      </RailSection>
    </IconRail>,
  );
  expect(html).toContain('aria-label="Main navigation"');
  expect(html).toContain('href="/extensions"');
  expect(html).toContain('href="/extensions?view=channels"');
  expect(html).toContain('role="group"');
});

test("process disclosures follow signal changes and retain native interaction when omitted", async () => {
  const dom = new Window();
  for (const key of ["document", "HTMLElement", "Element", "Node"]) {
    Object.defineProperty(globalThis, key, {
      value: (dom as unknown as Record<string, unknown>)[key],
      configurable: true,
      writable: true,
    });
  }
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const groupOpen = signal(false);
  const processOpen = signal(false);
  const host = document.createElement("div");
  document.body.append(host);
  const mounted = createWebRenderer(runtime).render(
    <div>
      <ProcessGroup title="Group" open={groupOpen}>
        Step
      </ProcessGroup>
      <ChatProcess label="Process" open={processOpen}>
        Step
      </ChatProcess>
      <ProcessGroup title="Native">Step</ProcessGroup>
    </div>,
    host,
  );
  const [group, process, native] = Array.from(host.querySelectorAll("details"));
  expect(group!.open).toBe(false);
  expect(process!.open).toBe(false);
  groupOpen.value = true;
  processOpen.value = true;
  await Promise.resolve();
  expect(group!.open).toBe(true);
  expect(process!.open).toBe(true);
  groupOpen.value = false;
  processOpen.value = false;
  await Promise.resolve();
  expect(group!.open).toBe(false);
  expect(process!.open).toBe(false);
  native!.open = true;
  expect(native!.open).toBe(true);
  mounted.unmount();
  host.remove();
});

test("tool call labels update after mount", async () => {
  const dom = new Window();
  for (const key of ["document", "HTMLElement", "Element", "Node"]) {
    Object.defineProperty(globalThis, key, {
      value: (dom as unknown as Record<string, unknown>)[key],
      configurable: true,
      writable: true,
    });
  }
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const labels = signal({ input: "Input one", emptyInput: "Empty one", retry: "Retry one" });
  const host = document.createElement("div");
  document.body.append(host);
  const mounted = createWebRenderer(runtime).render(
    <ChatToolCall label="Tool" input="" onRetry={() => {}} labels={labels} />,
    host,
  );
  expect(host.textContent).toContain("Empty one");
  labels.value = { input: "Input two", emptyInput: "Empty two", retry: "Retry two" };
  await Promise.resolve();
  expect(host.textContent).toContain("Input two");
  expect(host.textContent).toContain("Empty two");
  expect(host.textContent).toContain("Retry two");
  mounted.unmount();
  host.remove();
});

test("assistant history reports its open and closed states", async () => {
  const dom = new Window();
  for (const key of [
    "document",
    "HTMLElement",
    "Element",
    "Node",
    "ResizeObserver",
    "MutationObserver",
  ]) {
    Object.defineProperty(globalThis, key, {
      value: (dom as unknown as Record<string, unknown>)[key],
      configurable: true,
      writable: true,
    });
  }
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const host = document.createElement("div");
  document.body.append(host);
  const mounted = createWebRenderer(runtime).render(
    <AssistantView
      id="assistant-test"
      messages={[
        {
          id: "ask",
          role: "user",
          author: "You",
          parts: [{ id: "text", kind: "text", text: "Question" }],
        },
      ]}
    />,
    host,
  );
  const history = host.querySelector("nav[data-state]")!;
  expect(history.getAttribute("data-state")).toBe("closed");
  const trigger =
    host.querySelector<HTMLElement>("[aria-controls]") ??
    host.querySelector<HTMLElement>('[aria-label="History"]');
  expect(trigger).not.toBeNull();
  trigger!.click();
  await Promise.resolve();
  expect(history.getAttribute("data-state")).toBe("open");
  trigger!.click();
  await Promise.resolve();
  expect(history.getAttribute("data-state")).toBe("closed");
  mounted.unmount();
  host.remove();
});

test("assistant question labels update without replacing the answer", async () => {
  const dom = new Window();
  for (const key of ["document", "HTMLElement", "Element", "Node"]) {
    Object.defineProperty(globalThis, key, {
      value: (dom as unknown as Record<string, unknown>)[key],
      configurable: true,
      writable: true,
    });
  }
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const labels = signal({ answer: "Answer one", answerPlaceholder: "Write one" });
  const question = signal({ id: "q", title: "Question", state: "open" as const });
  const host = document.createElement("div");
  document.body.append(host);
  const mounted = createWebRenderer(runtime).render(
    <AssistantQuestionView value={question} labels={labels} onAnswer={() => {}} />,
    host,
  );
  const answer = host.querySelector("textarea")!;
  expect(answer.getAttribute("aria-label")).toBe("Answer one: Question");
  labels.value = { answer: "Answer two", answerPlaceholder: "Write two" };
  await Promise.resolve();
  expect(host.querySelector("textarea")).toBe(answer);
  expect(answer.getAttribute("aria-label")).toBe("Answer two: Question");
  expect(answer.placeholder).toBe("Write two");
  mounted.unmount();
  host.remove();
});
