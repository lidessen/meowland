import {
  isAsyncIterable,
  isPromiseLike,
  isSignal,
  styleText,
  unwrap,
  type Child,
  type Component,
  type Props,
  type Runtime,
  type VNode,
  type ContextScope,
} from "../src/index";
import { ATTRIBUTE_NAMES, VOID_ELEMENTS, isRecord } from "./html-facts";
import { isKeyedChild, readKeyedEntries } from "../src/keyed";
import { signal } from "../src/reactive";
import { classText } from "../src/style";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderAttributes(props: Props): string {
  return Object.entries(props)
    .filter(([name]) => {
      return (
        name !== "children" &&
        name !== "key" &&
        name !== "ref" &&
        name !== "dangerouslySetInnerHTML" &&
        !name.startsWith("on")
      );
    })
    .map(([name, value]) => {
      const resolved = unwrap(value);
      if (resolved === false || resolved === null || resolved === undefined) return "";
      const attributeName = ATTRIBUTE_NAMES[name] ?? name;
      if (name === "className" || name === "class") {
        const serialized = classText(resolved);
        return serialized ? ` ${attributeName}="${escapeHtml(serialized)}"` : "";
      }
      if (name === "style") {
        const serialized = styleText(resolved);
        return serialized ? ` ${attributeName}="${escapeHtml(serialized)}"` : "";
      }
      if (resolved === true) return ` ${attributeName}`;
      if (typeof resolved === "object") return "";
      return ` ${attributeName}="${escapeHtml(String(resolved))}"`;
    })
    .join("");
}

function renderHostHtml(node: VNode, runtime: Runtime, contextScope?: ContextScope): string {
  const rendered = runtime.targetHooks.transformVNode(node);
  if (typeof rendered.type === "function") {
    return renderChild(rendered, runtime, contextScope);
  }

  const attributes = renderAttributes(rendered.props);
  const innerHtml = unwrap(rendered.props.dangerouslySetInnerHTML);
  const children =
    isRecord(innerHtml) && typeof innerHtml.__html === "string"
      ? innerHtml.__html
      : renderChild(rendered.props.children, runtime, contextScope);

  if (VOID_ELEMENTS.has(rendered.type as string)) return `<${rendered.type}${attributes}>`;
  return `<${rendered.type}${attributes}>${children}</${rendered.type}>`;
}

function renderComponentHtml(
  component: Component<any, any>,
  props: Props,
  runtime: Runtime,
  contextScope?: ContextScope,
): string {
  const invocation = runtime.targetHooks.invokeComponent(component, props, contextScope);
  try {
    return renderChild(invocation.child, runtime, invocation.contextScope ?? contextScope);
  } finally {
    invocation.dispose();
  }
}

function renderChild(node: Child, runtime: Runtime, contextScope?: ContextScope): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";

  if (isPromiseLike(node) || isAsyncIterable(node)) {
    throw new Error("meowjsx renderToHtml() cannot render async content");
  }

  if (isSignal(node)) return renderChild(unwrap(node) as Child, runtime, contextScope);
  if (isKeyedChild(node))
    return readKeyedEntries(node)
      .map(({ value }) => renderChild(node.render(signal(value)), runtime, contextScope))
      .join("");
  if (Array.isArray(node)) {
    return node.map((child) => renderChild(child, runtime, contextScope)).join("");
  }
  if (typeof node === "string" || typeof node === "number") return escapeHtml(String(node));

  if (typeof node.type === "function")
    return renderComponentHtml(node.type, node.props, runtime, contextScope);

  const replacement = runtime.targetHooks.replacementFor(node);
  if (replacement) return renderComponentHtml(replacement, node.props, runtime, contextScope);
  return renderHostHtml(node, runtime, contextScope);
}

/**
 * Static HTML output for content and site rendering. It reuses the runtime's
 * component, hook, and override semantics through `RuntimeTargetHooks` and adds
 * only the HTML facts; it never mounts into a document, so registered shadows
 * stay mount-only.
 */
export function renderToHtmlWithRuntime(runtime: Runtime, node: Child): string {
  return renderChild(node, runtime);
}
