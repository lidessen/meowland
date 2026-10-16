import { h, isSignal, type Child, type MaybeSignal, type StyleValue } from "meowjsx";
import { themeAttributes, type ThemeDefinition } from "../assembly";
import type { Selection } from "../values";

/** Explicit host binding; disposal restores attributes owned before this binding. */
export function applyTheme(
  element: Element,
  theme?: ThemeDefinition,
  config?: MaybeSignal<Selection>,
): () => void {
  const original = new Map<string, string | null>();
  let previous: Record<string, string> = {};
  const restore = (key: string) => {
    const value = original.get(key);
    if (value == null) element.removeAttribute(key);
    else element.setAttribute(key, value);
  };
  const apply = () => {
    const next = themeAttributes(theme, isSignal(config) ? config.value : config);
    for (const key of Object.keys(previous)) if (!(key in next)) restore(key);
    for (const [key, value] of Object.entries(next)) {
      if (!original.has(key)) original.set(key, element.getAttribute(key));
      element.setAttribute(key, value);
    }
    previous = next;
  };
  apply();
  const unsubscribe = isSignal(config) ? config.subscribe(apply) : undefined;
  return () => {
    unsubscribe?.();
    for (const key of original.keys()) restore(key);
  };
}

/** Dynamic hosts own the returned stylesheet lifetime; static hosts emit cssText directly. */
export function mountStyles(document: Document, cssText: string): () => void {
  const style = document.createElement("style");
  style.textContent = cssText;
  document.head.append(style);
  return () => style.remove();
}

export interface ThemeProps {
  /** Explicit root binding applies this theme's defaults; omitted on inheriting local scopes. */
  theme?: ThemeDefinition;
  config?: MaybeSignal<Selection>;
  as?: "div" | "section" | "main" | "article";
  id?: string;
  className?: MaybeSignal<string | undefined>;
  style?: MaybeSignal<StyleValue | undefined>;
  children?: Child;
}

/** CSS delivery is explicit; this component only owns scope attributes. */
export function Theme({ theme, config, as = "div", children, ...props }: ThemeProps): Child {
  const initial = themeAttributes(theme, isSignal(config) ? config.value : config);
  return h(
    as,
    {
      ...props,
      ...initial,
      ref(element: Element) {
        // Initial JSX attributes belong to this scope, not to a prior host binding.
        for (const key of Object.keys(initial)) element.removeAttribute(key);
        return applyTheme(element, theme, config);
      },
    },
    children,
  );
}
