import { Window } from "happy-dom";
import { createRuntime, type Child, type Runtime } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";

export function mountComponent(node: Child, runtime: Runtime = createRuntime()) {
  const dom = new Window() as unknown as Record<string, unknown>;
  for (const key of [
    "document",
    "HTMLElement",
    "HTMLInputElement",
    "Element",
    "Node",
    "MutationObserver",
  ]) {
    Object.defineProperty(globalThis, key, {
      value: dom[key],
      configurable: true,
      writable: true,
    });
  }
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
