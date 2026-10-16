import { isSignal, unwrap } from "./reactive";
import type {
  MaybeSignal,
  Props,
  ReadableSignal,
  RuntimePlugin,
  StyleObject,
  StyleValue,
  Theme,
  ThemeStyle,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function deriveMaybeValue<T>(
  values: readonly unknown[],
  derive: (resolved: readonly unknown[]) => T,
): T | ReadableSignal<T> {
  const sources = values.filter(isSignal) as ReadableSignal<unknown>[];
  if (sources.length === 0)
    return derive(values.map((value) => unwrap(value as MaybeSignal<unknown>)));

  const read = (): T => derive(values.map((value) => unwrap(value as MaybeSignal<unknown>)));
  return {
    get value(): T {
      return read();
    },
    subscribe(listener: (value: T) => void): () => void {
      let current = read();
      const update = (): void => {
        const next = read();
        if (Object.is(current, next)) return;
        current = next;
        listener(next);
      };
      const cleanups = sources.map((source) => source.subscribe(update));
      return () => cleanups.forEach((cleanup) => cleanup());
    },
  };
}

function mergeClassNames(
  first: MaybeSignal<string | null | undefined>,
  second: MaybeSignal<string | null | undefined>,
): MaybeSignal<string | undefined> {
  return deriveMaybeValue([first, second], (values) => {
    const classes = values.filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    );
    return classes.length > 0 ? classes.join(" ") : undefined;
  });
}

/**
 * The canonical text form of a theme style value. `ThemeStyle.style` accepts a
 * string or a property map; themes compose those values, and a target lands the
 * result in its own way. This is the only style serializer core owns — it holds
 * no style API, only the theme contract's value shape.
 */
export function styleText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return value == null || value === false ? "" : String(value);
  return Object.entries(value)
    .map(([property, propertyValue]) => {
      const resolved = unwrap(propertyValue as MaybeSignal<unknown>);
      if (resolved === null || resolved === undefined || resolved === false) return "";
      const cssProperty = property.startsWith("--")
        ? property
        : property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      return `${cssProperty}:${String(resolved)}`;
    })
    .filter(Boolean)
    .join(";");
}

function mergeStyles(
  first: MaybeSignal<StyleValue | null | undefined>,
  second: MaybeSignal<StyleValue | null | undefined>,
): MaybeSignal<StyleValue | undefined> {
  return deriveMaybeValue([first, second], (values) => {
    const [left, right] = values as [StyleValue | null | undefined, StyleValue | null | undefined];
    if (!left) return right ?? undefined;
    if (!right) return left;
    if (isRecord(left) && isRecord(right)) return { ...left, ...right } as StyleObject;
    return [styleText(left), styleText(right)].filter(Boolean).join(";");
  });
}

function applyThemeStyle(props: Props, style: ThemeStyle): Props {
  const themed: Props = { ...props, ...style.props };
  if (style.className !== undefined) {
    themed.className = mergeClassNames(
      props.className as MaybeSignal<string | null | undefined>,
      style.className,
    );
  }
  if (style.style !== undefined) {
    themed.style = mergeStyles(
      props.style as MaybeSignal<StyleValue | null | undefined>,
      style.style,
    );
  }
  return themed;
}

export function createThemePlugin(theme: Theme): RuntimePlugin {
  return {
    name: theme.name,
    render: (context, next) => {
      const identity = context.vnode.componentPart;
      if (!identity || !context.runtime.registry.has(identity.component))
        return next(context.vnode);
      const style = theme.resolve({
        component: identity,
        vnode: context.vnode,
        runtime: context.runtime,
      });
      if (!style) return next(context.vnode);
      return next({ ...context.vnode, props: applyThemeStyle(context.vnode.props, style) });
    },
  };
}
