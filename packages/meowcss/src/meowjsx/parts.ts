import {
  createPartDescriptor,
  isSignal,
  type Component,
  type ComponentMeta,
  type MaybeSignal,
  type PartDescriptor,
  type Props,
  type ReadableSignal,
  type RuntimePlugin,
} from "meowjsx";
import type { Options } from "../values";

export type ThemedProps<O extends Options<any>> = {
  [K in keyof O["axes"]]?: MaybeSignal<O["axes"][K][number] | undefined>;
};

type Selected<O extends Options<any>> = {
  [K in keyof O["axes"]]: O["axes"][K][number];
};
export interface StylePropsBinding<O extends Options<any> = Options<any>> {
  readonly options: O;
  readonly defaults: Selected<O>;
  readonly parts: readonly string[];
}

/* @__NO_SIDE_EFFECTS__ */
export function defineStyleProps<O extends Options<any>>(
  options: O,
  config: {
    defaults: Selected<NoInfer<O>>;
    parts?: readonly string[];
  },
): StylePropsBinding<O> {
  const fields = Object.keys(options.axes);
  if (Object.keys(config.defaults).some((field) => !fields.includes(field)))
    throw new Error("Unknown style default");
  for (const field of fields) {
    if (!options.axes[field].includes(config.defaults[field]))
      throw new Error(`Missing or invalid default: ${field}`);
  }
  return Object.freeze({
    options,
    defaults: Object.freeze({ ...config.defaults }),
    parts: Object.freeze([...(config.parts ?? ["root"])]),
  });
}

type ComponentWithMeta = Component<any, any> & {
  readonly meta: ComponentMeta;
};
type ComponentName<C> = C extends {
  readonly meta: { readonly name: infer Name extends string };
}
  ? Name
  : never;
type ComponentParts<C> = C extends {
  readonly meta: { readonly parts: readonly (infer Part extends string)[] };
}
  ? Part
  : never;
export type Parts<C> = {
  readonly [Part in ComponentParts<C>]: PartDescriptor<ComponentName<C>, Part>;
};

/** Creates type-checked, runtime-lazy descriptors for a component's declared parts. */
/* @__NO_SIDE_EFFECTS__ */
export function parts<C extends ComponentWithMeta>(componentName: ComponentName<C>): Parts<C> {
  return new Proxy(Object.create(null) as Parts<C>, {
    get(_target, property) {
      if (typeof property !== "string") return undefined;
      return createPartDescriptor(componentName, property);
    },
  });
}

function derived<T>(sources: readonly unknown[], read: () => T): MaybeSignal<T> {
  const signals = [...new Set(sources.filter(isSignal))];
  if (!signals.length) return read();
  return {
    get value() {
      return read();
    },
    subscribe(listener) {
      let previous = read();
      const update = () => {
        const value = read();
        if (value !== previous) {
          previous = value;
          listener(value);
        }
      };
      const cleanups = signals.map((source) => source.subscribe(update));
      return () => cleanups.forEach((cleanup) => cleanup());
    },
  } as ReadableSignal<T>;
}

function selectedValue(
  explicit: unknown,
  original: unknown,
  fallback: string,
  choices: readonly string[],
  field: string,
): MaybeSignal<string> {
  return derived([explicit, original], () => {
    const local = isSignal(explicit) ? explicit.value : explicit;
    const input = isSignal(original) ? original.value : original;
    const value = local !== undefined ? local : input !== undefined ? input : fallback;
    if (typeof value !== "string" || !choices.includes(value))
      throw new Error(`Invalid style option ${field}: ${String(value)}`);
    return value;
  });
}

/** Reads component metadata registered by MeowJSX; no second component registry. */
export function createStylePropsPlugin(): RuntimePlugin {
  const checked = new WeakSet<Function>();
  return {
    name: "meowui-style-props",
    enforce: "pre",
    render({ vnode, runtime }, next) {
      const identity = vnode.componentPart;
      if (!identity) return next(vnode);
      if (vnode.props?.["data-meowui-part"] !== undefined) return next(vnode);
      const component = runtime.registry.get(identity.component);
      const metadata = component?.meta;
      if (!component || !metadata) return next(vnode);
      const binding = metadata.style as StylePropsBinding | undefined;
      const props = {
        ...vnode.props,
        "data-meowui-part": `${identity.component}/${identity.part}`,
      } as Props;
      if (!binding) return next({ ...vnode, props });
      if (!checked.has(component)) {
        const declared = new Set(metadata.parts);
        for (const part of binding.parts)
          if (!declared.has(part)) throw new Error(`Unknown bound part: ${part}`);
        checked.add(component);
      }
      const bound = binding.parts.includes(identity.part);
      for (const [field, choices] of Object.entries(binding.options.axes)) {
        const explicit = props[field];
        delete props[field];
        if (bound)
          props[binding.options.attribute(field)] = selectedValue(
            explicit,
            identity.state?.[field],
            binding.defaults[field],
            choices as readonly string[],
            field,
          );
      }
      return next({ ...vnode, props });
    },
  };
}

export type { PartDescriptor };
