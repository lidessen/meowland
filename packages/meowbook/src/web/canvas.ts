import { createWebRenderer } from "meowjsx/web";
import {
  createComponentObservation,
  type Child,
  type MountResult,
  type RenderableChild,
} from "meowjsx";
import type { Story, StoryEntry, PreviewEnvironment, StoryContext, StoryContainer } from "../types";
import { cleanupScope } from "./lifecycle";
import { inspectCanvas } from "./inspect";
import { createMeasurements, isMeasurementMode } from "./measure";
import { createCaptureProjection } from "./capture";

export interface CanvasOptions {
  capture?: boolean;
  manifest: readonly StoryEntry[];
  loadStory(id: string): Promise<Story>;
  loadEnvironment(): Promise<PreviewEnvironment>;
}

export async function bootCanvas(options: CanvasOptions): Promise<() => void> {
  const root =
    document.getElementById("story-root") ??
    document.body.appendChild(document.createElement("main"));
  root.id = "story-root";
  const state =
    document.getElementById("story-state") ??
    document.body.insertBefore(document.createElement("div"), root);
  state.id = "story-state";
  state.setAttribute("role", "status");
  state.dataset.status = "loading";
  state.textContent = "Loading the scenario…";
  const id = new URL(location.href).searchParams.get("story") ?? options.manifest[0]?.id ?? "";
  const captureMode = options.capture === true;
  if (captureMode) document.documentElement.dataset.meowbookCapture = "true";
  state.dataset.story = id;
  const abort = new AbortController();
  let mounted: MountResult | undefined;
  let failed = false;
  let disposed = false;
  let uninstall: (() => void) | undefined;
  const send = (data: Record<string, unknown>) => {
    if (!disposed && parent !== window)
      parent.postMessage({ channel: "meowbook", story: id, ...data }, location.origin);
  };
  const fail = (error: unknown) => {
    if (disposed) return;
    failed = true;
    const message = error instanceof Error ? error.message : String(error);
    state.dataset.status = "error";
    const title = document.createElement("strong");
    title.textContent = "The scenario ran into a problem";
    const detail = document.createElement("div");
    detail.textContent = message;
    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "Reload scenario";
    retry.title = "Reloading resets input in this example";
    retry.onclick = () => location.reload();
    state.replaceChildren(title, detail, retry);
    send({ type: "error", message });
  };
  const resources = cleanupScope(fail);
  const environment = cleanupScope(fail);
  const listeners = cleanupScope(fail);
  let captureReplacements: NonNullable<import("../capture/types").CaptureSnapshot["replacements"]> =
    [];
  const entry = options.manifest.find((entry) => entry.id === id);
  let observationRoots: RenderableChild[] = [];
  const observation = createComponentObservation<Node>({
    get roots() {
      return observationRoots;
    },
    onError: fail,
  });
  const capture =
    captureMode && entry
      ? createCaptureProjection(entry, () => captureReplacements, observation)
      : undefined;
  if (capture) resources.add(capture.dispose);
  const measurements = createMeasurements(root, (detail) => send({ type: "measurement", detail }));
  listeners.add(measurements.dispose);
  const report = (message: string) => send({ type: "event", message });
  const inspect = () => {
    if (!failed && !disposed && state.dataset.status === "ready")
      send({ type: "inspection", issues: inspectCanvas(root, document), width: innerWidth });
  };
  const onError = (event: ErrorEvent) => fail(event.error ?? event.message);
  const onRejection = (event: PromiseRejectionEvent) => fail(event.reason);
  const onMessage = (event: MessageEvent) => {
    if (
      event.source === parent &&
      event.origin === location.origin &&
      event.data?.channel === "meowbook"
    ) {
      if (event.data.type === "inspect") inspect();
      if (
        !captureMode &&
        event.data.type === "measure" &&
        isMeasurementMode(event.data.mode) &&
        typeof event.data.placeholder === "boolean"
      )
        measurements.configure({ mode: event.data.mode, placeholder: event.data.placeholder });
    }
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  window.addEventListener("message", onMessage);
  window.addEventListener("resize", inspect);
  listeners.add(() => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    window.removeEventListener("message", onMessage);
    window.removeEventListener("resize", inspect);
  });
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    abort.abort();
    resources.dispose();
    try {
      mounted?.unmount();
    } catch (error) {
      fail(error);
    }
    observation.dispose();
    try {
      uninstall?.();
    } catch (error) {
      fail(error);
    }
    environment.dispose();
    listeners.dispose();
  };
  const onHide = (event: PageTransitionEvent) => {
    if (!event.persisted) dispose();
  };
  window.addEventListener("pagehide", onHide);
  listeners.add(() => window.removeEventListener("pagehide", onHide));
  try {
    if (!options.manifest.some((entry) => entry.id === id))
      throw new Error(`Scenario not found: ${id}`);
    const prepare = await options.loadEnvironment();
    if (disposed) return dispose;
    let defaultContainer: StoryContainer | undefined;
    const runtime = await prepare({
      root,
      signal: abort.signal,
      onCleanup: environment.add,
      setContainer(container) {
        defaultContainer = container;
      },
    });
    if (disposed) return dispose;
    const story = await options.loadStory(id);
    if (disposed) return dispose;
    if (story.id !== id)
      throw new Error(`Scenario index and runtime definition do not match: ${id}`);
    document.title = `${story.title ?? id} · Meowbook`;
    root.dataset.story = id;
    const replacements = story.replacements ?? [];
    const seen = new Set();
    for (const entry of replacements) {
      if (seen.has(entry.component)) throw new Error("Duplicate component replacement target");
      seen.add(entry.component);
    }
    const hits = replacements.map(() => 0);
    const disclosure = document.body.appendChild(document.createElement("details"));
    disclosure.id = "story-replacement-details";
    disclosure.hidden = captureMode || replacements.length === 0;
    const summary = disclosure.appendChild(document.createElement("summary"));
    const diagnostics = disclosure.appendChild(document.createElement("pre"));
    diagnostics.id = "story-replacements";
    diagnostics.hidden = replacements.length === 0;
    const showHits = () => {
      captureReplacements = replacements.map((entry, index) => ({
        component: entry.component.meta?.name || entry.component.name || "anonymous",
        replacement: entry.replacement.meta?.name || entry.replacement.name || "anonymous",
        hits: hits[index]!,
      }));
      summary.textContent = `Component replacement log · ${hits.reduce((sum, count) => sum + count, 0)} hits`;
      diagnostics.textContent = JSON.stringify(
        replacements.map((entry, index) => ({
          index,
          component: entry.component.meta?.name ?? entry.component.name ?? "anonymous",
          hits: hits[index],
        })),
      );
    };
    showHits();
    resources.add(() => disclosure.remove());
    uninstall = runtime.use({
      name: "meowbook-component-replacements",
      enforce: "pre",
      resolveComponent({ component }) {
        const index = replacements.findIndex((entry) => entry.component === component);
        if (index < 0) return;
        hits[index]++;
        showHits();
        return replacements[index]!.replacement;
      },
    });
    const context: StoryContext = {
      runtime,
      root,
      signal: abort.signal,
      onCleanup: resources.add,
      report,
    };
    send({
      type: "metadata",
      entry: {
        ...options.manifest.find((entry) => entry.id === id),
        group: story.group,
        description: story.description,
        covers: story.covers,
      },
    });
    const container = story.container === false ? undefined : (story.container ?? defaultContainer);
    const content = story.render(context);
    const collectRoots = (child: Child): RenderableChild[] =>
      Array.isArray(child) ? child.flatMap(collectRoots) : [child];
    observationRoots = collectRoots(content);
    mounted = createWebRenderer(runtime, { onError: fail, observation }).render(
      container ? container(content, context) : content,
      root,
    );
    await story.setup?.(context);
    if (disposed || failed) return dispose;
    await story.ready?.(context);
    await document.fonts.ready;
    if (disposed || failed) return dispose;
    state.dataset.status = "ready";
    state.textContent = replacements.length
      ? "Partial preview · Component replacements included"
      : "";
    send({ type: "ready" });
    inspect();
    const observer = new ResizeObserver(inspect);
    observer.observe(root);
    resources.add(() => observer.disconnect());
  } catch (error) {
    if (!disposed) fail(error);
  }
  return dispose;
}
