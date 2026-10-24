/** Typed CSS values and deterministic declaration generation. */
type AxisChoices = readonly [string, ...string[]];
export type Axes = Readonly<Record<string, AxisChoices>>;
type Scheme = "light" | "dark" | "auto";
export type Choices<A extends Axes> = { [K in keyof A]?: A[K][number] } & {
  scheme?: Scheme;
};
type Values<C extends readonly string[]> =
  | { readonly [K in C[number]]: string }
  | { readonly [K in keyof C]: string };
interface Source {
  readonly name: string;
  readonly axis: string;
  readonly choices: readonly string[];
}
const conditional = Symbol("conditional value");
export interface ConditionalValue {
  readonly [conditional]: true;
  readonly source: Source;
  readonly values: Readonly<Record<string, string>>;
}
export interface Selection {
  readonly attributes: Readonly<Record<string, string>>;
  readonly sources: readonly Source[];
}
export interface Condition {
  readonly selection: Selection;
  toString(): string;
}
export interface Options<A extends Axes = Axes> {
  readonly name: string;
  readonly axes: A;
  readonly by: {
    readonly [K in keyof A]: (values: Values<A[K]>) => ConditionalValue;
  } & {
    readonly scheme: (values: Values<readonly ["light", "dark"]>) => ConditionalValue;
  };
  select(values: Choices<A>): Selection;
  when(values: Choices<A>): Condition;
  attribute(axis: keyof A | "scheme"): string;
}

const schemeSource: Source = Object.freeze({
  name: "builtin",
  axis: "scheme",
  choices: Object.freeze(["light", "dark"]),
});
function segment(value: string): string {
  if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(value)) throw new Error(`Invalid identifier: ${value}`);
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
function attribute(source: Source): string {
  return source === schemeSource || (source.axis === "scheme" && source.name === "builtin")
    ? "data-meowui-color-scheme"
    : `data-option-${segment(source.name)}-${segment(source.axis)}`;
}
function valueDescription(source: Source, input: unknown): ConditionalValue {
  if (!input || typeof input !== "object")
    throw new Error("Conditional values must be an object or tuple");
  const values: Record<string, string> = Object.create(null);
  if (Array.isArray(input)) {
    if (input.length !== source.choices.length)
      throw new Error(`Wrong tuple length for ${source.axis}`);
    source.choices.forEach((choice, index) => {
      values[choice] = input[index];
    });
  } else {
    if (Object.keys(input).length !== source.choices.length)
      throw new Error(`Incomplete or extra choices for ${source.axis}`);
    for (const choice of source.choices) {
      if (!Object.hasOwn(input, choice)) throw new Error(`Missing choice ${choice}`);
      values[choice] = (input as Record<string, string>)[choice];
    }
  }
  for (const value of Object.values(values)) {
    if (typeof value !== "string" || !value.trim())
      throw new Error("Branches must be nonempty CSS strings; nesting is unsupported");
  }
  return Object.freeze({
    [conditional]: true as const,
    source,
    values: Object.freeze(values),
  });
}

/* @__NO_SIDE_EFFECTS__ */
export function defineOptions<const A extends Axes>(
  name: string,
  input: A & { scheme?: never },
): Options<A> {
  segment(name);
  const axes: Record<string, AxisChoices> = Object.create(null);
  const sources: Record<string, Source> = Object.create(null);
  const by: Record<string, (values: unknown) => ConditionalValue> = Object.create(null);
  const names = new Set<string>();
  for (const [axis, choices] of Object.entries(input)) {
    const normalized = segment(axis);
    if (axis === "scheme" || names.has(normalized))
      throw new Error(`Reserved or conflicting axis: ${axis}`);
    names.add(normalized);
    if (
      !Array.isArray(choices) ||
      !choices.length ||
      choices.some(
        (value) => typeof value !== "string" || !/^[a-zA-Z][a-zA-Z0-9-]*$/.test(value),
      ) ||
      new Set(choices).size !== choices.length
    ) {
      throw new Error(`Invalid choices for ${axis}`);
    }
    axes[axis] = Object.freeze([...choices]) as unknown as AxisChoices;
    sources[axis] = Object.freeze({ name, axis, choices: axes[axis] });
  }
  sources.scheme = schemeSource;
  for (const [axis, source] of Object.entries(sources))
    by[axis] = (values) => valueDescription(source, values);
  const select = (values: Choices<A>): Selection => {
    if (!values || typeof values !== "object" || Array.isArray(values))
      throw new Error("Selection must be an object");
    const attributes: Record<string, string> = Object.create(null);
    const selectedSources: Source[] = [];
    for (const [axis, value] of Object.entries(values)) {
      const source = sources[axis];
      if (!source) throw new Error(`Unknown option: ${axis}`);
      if (
        typeof value !== "string" ||
        !(source.choices.includes(value) || (axis === "scheme" && value === "auto"))
      )
        throw new Error(`Invalid selection ${axis}=${value}`);
      attributes[attribute(source)] = value;
      selectedSources.push(source);
    }
    return Object.freeze({
      attributes: Object.freeze(attributes),
      sources: Object.freeze(selectedSources),
    });
  };
  return Object.freeze({
    name,
    axes: Object.freeze(axes) as A,
    by: Object.freeze(by) as Options<A>["by"],
    select,
    when(values: Choices<A>): Condition {
      const selection = select(values);
      if (!selection.sources.length) throw new Error("Empty when condition");
      return Object.freeze({
        selection,
        toString: () =>
          `&:where(${Object.entries(selection.attributes)
            .map(([key, value]) => `[${key}="${value}"]`)
            .join("")})`,
      });
    },
    attribute(axis: keyof A | "scheme"): string {
      const source = sources[String(axis)];
      if (!source) throw new Error(`Unknown option: ${String(axis)}`);
      return attribute(source);
    },
  });
}

export interface TokenRef {
  readonly name: string;
  toString(): string;
}
export interface TokenTree {
  readonly [key: string]: string | readonly [string, string] | ConditionalValue | TokenTree;
}
export type TokenRefs<T> = {
  readonly [K in keyof T]: T[K] extends string | readonly [string, string] | ConditionalValue
    ? TokenRef
    : TokenRefs<T[K]>;
};
declare const tokenSet: unique symbol;
/** Complete token definition, opaque to callers; nested reference groups are not definitions. */
export interface TokenSet {
  readonly [tokenSet]: true;
}
interface Declaration {
  readonly ref: TokenRef;
  readonly value: string | ConditionalValue;
}
const definitions = new WeakMap<object, readonly Declaration[]>();
export function isTokenSet(value: unknown): value is TokenSet {
  return typeof value === "object" && value !== null && definitions.has(value);
}
/* @__NO_SIDE_EFFECTS__ */
export function tokenRef(namespace: string, ...path: string[]): TokenRef {
  const name = `--${[namespace, ...path].map(segment).join("-")}`;
  return Object.freeze({ name, toString: () => `var(${name})` });
}
/* @__NO_SIDE_EFFECTS__ */
export function defineTokens<const T extends TokenTree>(
  namespace: string,
  input: T,
): TokenRefs<T> & TokenSet {
  segment(namespace);
  const declarations: Declaration[] = [];
  const names = new Set<string>();
  function walk(tree: TokenTree, path: string[]): object {
    if (!tree || typeof tree !== "object" || Array.isArray(tree))
      throw new Error("Token groups must be objects");
    const output: Record<string, unknown> = Object.create(null);
    for (const [key, value] of Object.entries(tree)) {
      segment(key);
      const parts = [...path, key];
      if (
        typeof value === "string" ||
        Array.isArray(value) ||
        (value && typeof value === "object" && conditional in value)
      ) {
        const ref = tokenRef(namespace, ...parts);
        if (names.has(ref.name)) throw new Error(`Token name collision: ${ref.name}`);
        names.add(ref.name);
        if (typeof value === "string" && !value.trim())
          throw new Error("Token values must be nonempty CSS strings");
        const normalized = Array.isArray(value)
          ? valueDescription(schemeSource, value)
          : (value as string | ConditionalValue);
        declarations.push({ ref, value: normalized });
        output[key] = ref;
      } else {
        output[key] = walk(value as TokenTree, parts);
      }
    }
    return Object.freeze(output);
  }
  const refs = walk(input, []) as TokenRefs<T> & TokenSet;
  definitions.set(refs, Object.freeze(declarations));
  return refs;
}

export interface TokenBinding {
  /** Constants are emitted here. A component selector gives per-instance reset. */
  readonly constants: string;
  /** Explicit per-group constant scope; conditional declarations still follow their source. */
  readonly constantScopes?: ReadonlyMap<TokenSet, string>;
  /** Scheme is explicitly regional even for a component-namespaced token. */
  readonly sources: readonly {
    readonly options: Options<any> | "scheme";
    readonly selector: string;
  }[];
  /** Optional selector resolver used by component adapters for otherwise-unbound sources. */
  readonly resolveSource?: (attribute: string) => string | undefined;
}
/* @__NO_SIDE_EFFECTS__ */
export function compileTokens(
  tokens: TokenSet | readonly TokenSet[],
  binding: TokenBinding,
): string {
  const declarations: (Declaration & { constants: string })[] = [];
  const names = new Set<string>();
  for (const group of Array.isArray(tokens) ? tokens : [tokens]) {
    const entries = definitions.get(group);
    if (!entries) throw new Error("Expected a complete defineTokens result");
    const constants = binding.constantScopes?.get(group) ?? binding.constants;
    if (!constants.trim()) throw new Error("Missing constants selector");
    for (const declaration of entries) {
      if (names.has(declaration.ref.name))
        throw new Error(`Token name collision: ${declaration.ref.name}`);
      names.add(declaration.ref.name);
      declarations.push({ ...declaration, constants });
    }
  }
  if (!binding.constants.trim()) throw new Error("Missing constants selector");
  const installed = new Map<string, { source: Source; selector: string }>();
  function register(source: Source, selector: string): void {
    if (!selector.trim()) throw new Error("Missing source selector");
    const key = attribute(source);
    const existing = installed.get(key);
    if (
      existing &&
      (JSON.stringify(existing.source) !== JSON.stringify(source) || existing.selector !== selector)
    )
      throw new Error(`Conflicting source binding: ${key}`);
    installed.set(key, { source, selector });
  }
  for (const entry of binding.sources) {
    if (entry.options === "scheme") register(schemeSource, entry.selector);
    else
      for (const [axis, choices] of Object.entries(entry.options.axes))
        register(
          {
            name: entry.options.name,
            axis,
            choices: choices as readonly string[],
          },
          entry.selector,
        );
  }
  const rules = new Map<string, string[]>();
  const darkAuto = new Map<string, string[]>();
  function append(
    target: Map<string, string[]>,
    selector: string,
    name: string,
    value: string,
  ): void {
    const values = target.get(selector) ?? [];
    values.push(`${name}: ${value};`);
    target.set(selector, values);
  }
  for (const { ref, value, constants } of declarations) {
    if (typeof value === "string") {
      append(rules, constants, ref.name, value);
      continue;
    }
    const key = attribute(value.source);
    let host = installed.get(key);
    if (!host && binding.resolveSource) {
      const selector = binding.resolveSource(key);
      if (selector !== undefined) {
        host = { source: value.source, selector };
        installed.set(key, host);
      }
    }
    if (!host) throw new Error(`Missing source binding: ${key}`);
    if (JSON.stringify(host.source) !== JSON.stringify(value.source))
      throw new Error(`Conflicting source definition: ${key}`);
    for (const [choice, branch] of Object.entries(value.values))
      append(rules, `${host.selector}:where([${key}="${choice}"])`, ref.name, branch);
    if (value.source === schemeSource) {
      const selector = `${host.selector}:where([${key}="auto"])`;
      append(rules, selector, ref.name, value.values.light!);
      append(darkAuto, selector, ref.name, value.values.dark!);
    }
  }
  const schemeHost = installed.get(attribute(schemeSource));
  if (schemeHost) {
    for (const mode of ["light", "dark", "auto"])
      append(
        rules,
        `${schemeHost.selector}:where([data-meowui-color-scheme="${mode}"])`,
        "color-scheme",
        mode === "auto" ? "light dark" : mode,
      );
  }
  const print = (entries: Map<string, string[]>) =>
    [...entries]
      .map(([selector, values]) => `${selector} {\n  ${values.join("\n  ")}\n}`)
      .join("\n");
  return (
    print(rules) +
    (darkAuto.size ? `\n@media (prefers-color-scheme: dark) {\n${print(darkAuto)}\n}` : "")
  );
}
