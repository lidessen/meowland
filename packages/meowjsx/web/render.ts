import {
  defaultRuntime,
  h,
  type ComponentObservation,
  type Child,
  type MountResult,
  type Runtime,
  type VNode,
} from "../src/index";
import type { RenderableChild, RendererOptions } from "../src/renderer";
import { renderToHtmlWithRuntime } from "./html";
import { createDomStrategy, setDOMProperty, type DomNode } from "./strategy";
import { runShadows } from "./shadows";
import { WebObservationContext } from "./observation";

/**
 * The Web target API: a DOM mount entry and static HTML output bound to one
 * runtime, so a runtime that installed components, themes, or plugin overrides
 * renders its own tree.
 */
export interface WebRenderer {
  readonly runtime: Runtime;
  readonly render: (node: Child, container: Element) => MountResult;
  readonly mount: (node: Child, container: Element) => MountResult;
  readonly renderToHtml: (node: Child) => string;
}

export type WebRendererOptions = Pick<RendererOptions<DomNode>, "onError" | "observer"> & {
  observation?: ComponentObservation<DomNode>;
};

export function createWebRenderer(
  runtime: Runtime = defaultRuntime,
  options: WebRendererOptions = {},
): WebRenderer {
  if (options.observation && options.observer)
    throw new Error("Web renderer accepts observation or observer, not both");
  const renderer = runtime.createRenderer<DomNode>(createDomStrategy(), {
    observer: options.observation?.observer ?? options.observer,
    onMount(vnode, node) {
      // A native select cannot resolve its value until its options exist.
      // The normal property subscription still handles subsequent Signal updates.
      if (vnode.type === "select" && Object.hasOwn(vnode.props, "value")) {
        setDOMProperty(node as Element, "value", vnode.props.value);
      }
      return runShadows(runtime, vnode as unknown as VNode, node as unknown as Element);
    },
    onError:
      options.onError ??
      ((error) => {
        console.error("[meowjsx] async render failed", error);
      }),
  });

  const render = (node: Child, container: Element): MountResult => {
    const child = options.observation
      ? h(WebObservationContext.Provider, { value: options.observation }, node)
      : node;
    const mounted = renderer.mount(
      child as unknown as RenderableChild,
      container as unknown as DomNode,
      null,
    );
    return { unmount: () => mounted.unmount() };
  };

  return {
    runtime,
    render,
    mount: render,
    renderToHtml: (node) => renderToHtmlWithRuntime(runtime, node),
  };
}

/** The default runtime's Web renderer; apps that install into it use this one. */
export const defaultWebRenderer = /* @__PURE__ */ createWebRenderer();

// A pure read lets bundlers drop the default renderer when none of these members is used.
/* @__NO_SIDE_EFFECTS__ */
function defaultMember<Key extends keyof WebRenderer>(key: Key): WebRenderer[Key] {
  return defaultWebRenderer[key];
}

export const render = /* @__PURE__ */ defaultMember("render");
export const mount = /* @__PURE__ */ defaultMember("mount");
export const renderToHtml = /* @__PURE__ */ defaultMember("renderToHtml");
