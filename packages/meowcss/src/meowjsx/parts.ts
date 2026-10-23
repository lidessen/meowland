import {
  isSignal,
  type ComponentContract,
  type MaybeSignal,
  type Props,
  type ReadableSignal,
  type RuntimePlugin,
} from "meowjsx";
import type { Options } from "../values";
import type { CSSFragment } from "../fragments";

export type ThemedProps<O extends Options<any>> = {
  [K in keyof O["axes"]]?: MaybeSignal<O["axes"][K][number] | undefined>;
};

type Selected<O extends Options<any>> = { [K in keyof O["axes"]]: O["axes"][K][number] };
export interface StylePropsBinding<O extends Options<any> = Options<any>> {
  readonly options: O;
  readonly defaults: Selected<O>;
  readonly parts: readonly string[];
}
/** Web styling metadata on the platform-neutral component identity. */
export interface StyledComponentContract<
  Name extends string = string,
  Part extends string = string,
> extends ComponentContract<Name, Part> {
  readonly styleProps: StylePropsBinding;
}
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

export interface PartSelector extends CSSFragment<ComponentContract> {
  readonly contract: ComponentContract;
  readonly part: string;
  toString(): string;
}
export function partSelector<Part extends string>(
  contract: ComponentContract<string, Part>,
  part: NoInfer<Part>,
): PartSelector {
  if (!contract.parts.includes(part)) throw new Error(`Unknown part: ${part}`);
  const text = `:where([data-meowui-part=${JSON.stringify(`${contract.name}/${part}`)}])`;
  return Object.freeze({
    contract,
    part,
    text,
    dependencies: Object.freeze([contract]),
    toString: () => text,
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

/** Reads contracts already registered by components; no second component registry. */
export function createStylePropsPlugin(): RuntimePlugin {
  const checked = new WeakSet<object>();
  return {
    name: "meowui-style-props",
    enforce: "pre",
    render({ vnode, runtime }, next) {
      const identity = vnode.componentPart;
      if (!identity) return next(vnode);
      // A second installed copy must not overwrite what the first already resolved:
      // the first removed the option prop, so a rerun would only see the default.
      if (vnode.props?.["data-meowui-part"] !== undefined) return next(vnode);
      const contract = runtime.registry.get(identity.component) as
        | (ComponentContract & { styleProps?: StylePropsBinding })
        | undefined;
      const binding = contract?.styleProps;
      if (!contract) return next(vnode);
      const props = {
        ...vnode.props,
        "data-meowui-part": `${identity.component}/${identity.part}`,
      } as Props;
      if (!binding) return next({ ...vnode, props });
      if (!checked.has(contract)) {
        for (const part of binding.parts)
          if (!contract.parts.includes(part)) throw new Error(`Unknown bound part: ${part}`);
        checked.add(contract);
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
