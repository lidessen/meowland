import { defaultRuntime, isSignal, mapSignal } from "../runtime";
import type { Child, Component, ReadableSignal, Runtime } from "../runtime";
import { cloneJsonValue, describeJsonSchema, JsonViewError, validateJsonValue } from "./schema";
import type { JsonSchema, JsonValue } from "./schema";

type KnownKeys<T> = keyof {
  [
    K in keyof T as string extends K
      ? never
      : number extends K
        ? never
        : symbol extends K
          ? never
          : K
  ]: T[K];
};
type Unwrap<T> = T extends ReadableSignal<infer V> ? V : T;
type Callback = (...args: any[]) => unknown;

export interface JsonValueProperty<T> {
  readonly kind: "value";
  readonly schema: JsonSchema<Unwrap<Exclude<T, undefined>>>;
  readonly bindable?: Extract<T, ReadableSignal<unknown>> extends never ? false : boolean;
  readonly required?: boolean;
  readonly default?: Unwrap<Exclude<T, undefined>>;
}
type ArgumentSchemas<A extends readonly unknown[]> = { readonly [K in keyof A]: JsonSchema<A[K]> };
export type JsonActionProperty<T extends Callback> = {
  readonly kind: "action";
  readonly required?: boolean;
} & (
  | { readonly args: ArgumentSchemas<Parameters<T>>; readonly mapArgs?: never }
  | {
      readonly args: readonly JsonSchema<unknown>[];
      /** Trusted projection of the original component's exact argument types. */
      readonly mapArgs: (...args: Parameters<T>) => readonly unknown[];
    }
);
export type JsonPropsDefinition<P> = {
  readonly [K in Exclude<KnownKeys<P>, "children">]?: NonNullable<P[K]> extends Callback
    ? JsonActionProperty<Extract<NonNullable<P[K]>, Callback>>
    : JsonValueProperty<P[K]>;
};
type Property = JsonValueProperty<any> | JsonActionProperty<Callback>;
export interface JsonComponentDefinition<P extends object = any> {
  readonly component: Component<P, any>;
  readonly props: JsonPropsDefinition<P>;
}
export type JsonCatalog = ReadonlyMap<string, JsonComponentDefinition<any>>;

export function defineJsonComponent<P extends object>(
  component: Component<P, any>,
  props: JsonPropsDefinition<NoInfer<P>>,
): JsonComponentDefinition<P> {
  const fields: Record<string, Property> = Object.create(null);
  for (const [key, entry] of Object.entries(props)) {
    const field = entry as Property;
    if (Object.hasOwn(field, "default")) {
      if (field.kind !== "value")
        throw new JsonViewError(
          "invalid_default",
          key,
          "Only value properties accept literal defaults",
        );
      const value = cloneJsonValue(field.default, key);
      validateJsonValue(field.schema, value, key);
      fields[key] = Object.freeze({ ...field, default: value });
    } else fields[key] = Object.freeze({ ...field });
  }
  return Object.freeze({ component, props: Object.freeze(fields) as JsonPropsDefinition<P> });
}

export type JsonNode =
  | string
  | number
  | boolean
  | null
  | readonly JsonNode[]
  | {
      readonly component: string;
      readonly props?: Readonly<Record<string, JsonValue>>;
      readonly children?: JsonNode;
    };
const parsed = Symbol("meowjsx.json.view");
export interface JsonView {
  readonly [parsed]: true;
  readonly node: JsonNode;
}
export interface JsonViewOptions {
  readonly catalog: JsonCatalog;
  readonly bindings?: ReadonlyMap<string, ReadableSignal<unknown>>;
  readonly actions?: ReadonlyMap<string, Callback>;
  readonly runtime?: Runtime;
}
const forbiddenProps = new Set([
  "children",
  "ref",
  "dangerouslySetInnerHTML",
  "__proto__",
  "prototype",
  "constructor",
]);
const fail = (code: string, path: string, message: string): never => {
  throw new JsonViewError(code, path, message);
};
const isObject = (value: unknown): value is Record<string, JsonValue> =>
  !!value && typeof value === "object" && !Array.isArray(value);
function reference(
  value: JsonValue,
  path: string,
): { kind: "binding" | "action"; name: string } | undefined {
  if (!isObject(value)) return;
  const binding = Object.hasOwn(value, "$binding"),
    action = Object.hasOwn(value, "$action");
  if (!binding && !action) return;
  if (binding === action || Object.keys(value).length !== 1)
    return fail("invalid_reference", path, "A reference requires one exclusive marker");
  const name = value[binding ? "$binding" : "$action"];
  if (typeof name !== "string" || !name.length)
    return fail("invalid_reference", path, "A reference requires a nonempty exact name");
  return { kind: binding ? "binding" : "action", name };
}
function definitionFor(catalog: JsonCatalog, name: string, path: string): JsonComponentDefinition {
  const definition = catalog.get(name);
  if (!definition || typeof definition.component !== "function")
    return fail("unknown_component", path, "Component is not in the host catalog");
  return definition;
}
function walk(
  node: JsonValue,
  catalog: JsonCatalog,
  path: string,
  create?: JsonViewOptions,
): Child {
  if (
    node === null ||
    typeof node === "string" ||
    typeof node === "boolean" ||
    typeof node === "number"
  )
    return node;
  if (Array.isArray(node))
    return node.map((child, index) => walk(child, catalog, `${path}[${index}]`, create));
  if (!isObject(node) || typeof node.component !== "string")
    return fail("invalid_node", path, "Expected a catalog component node");
  for (const key of Object.keys(node))
    if (!["component", "props", "children"].includes(key))
      fail("unknown_field", `${path}.${key}`, "Unknown node field");
  const definition = definitionFor(catalog, node.component, `${path}.component`);
  const input =
    node.props === undefined ? (Object.create(null) as Record<string, JsonValue>) : node.props;
  if (!isObject(input)) return fail("invalid_props", `${path}.props`, "Expected a props object");
  const metadata = definition.props as Record<string, Property>;
  const props: Record<string, unknown> = Object.create(null);
  for (const key of Object.keys(input)) {
    const propPath = `${path}.props.${key}`;
    if (forbiddenProps.has(key) || !Object.hasOwn(metadata, key))
      fail("unknown_prop", propPath, "Property is not in this component's finite catalog");
    const field = metadata[key]!,
      value = input[key]!,
      ref = reference(value, propPath);
    if (field.kind === "action") {
      if (ref?.kind !== "action")
        return fail("invalid_action", propPath, "An action requires a host action reference");
      if (create) {
        const callback = create.actions?.get(ref.name);
        if (typeof callback !== "function")
          return fail("missing_action", propPath, "Host action is not registered");
        props[key] = (...raw: unknown[]) => {
          const args = field.mapArgs ? field.mapArgs(...raw) : raw;
          if (!Array.isArray(args) || args.length !== field.args.length)
            return fail("invalid_action_args", propPath, "Unexpected action argument count");
          const checked = field.args.map((schema, index) =>
            validateJsonValue(schema, args[index], `${propPath}[${index}]`),
          );
          return callback(...checked);
        };
      }
    } else if (ref) {
      if (ref.kind !== "binding" || !field.bindable)
        return fail("invalid_binding", propPath, "This property does not support a binding");
      if (create) {
        const source = create.bindings?.get(ref.name);
        if (!isSignal(source))
          return fail("missing_binding", propPath, "Host binding is not a readable Signal");
        validateJsonValue(field.schema, source.value, propPath);
        props[key] = mapSignal(source, (value) => validateJsonValue(field.schema, value, propPath));
      }
    } else props[key] = validateJsonValue(field.schema, value, propPath);
  }
  for (const [key, field] of Object.entries(metadata)) {
    if (Object.hasOwn(input, key)) continue;
    if (field.kind === "value" && Object.hasOwn(field, "default"))
      props[key] = validateJsonValue(field.schema, field.default, `${path}.props.${key}`);
    else if (field.required)
      fail("missing_prop", `${path}.props.${key}`, "A required property is missing");
  }
  const children = Object.hasOwn(node, "children")
    ? walk(node.children!, catalog, `${path}.children`, create)
    : undefined;
  return create
    ? (create.runtime ?? defaultRuntime).h(definition.component, props, children)
    : null;
}

/** Validate data only. No component, action, projector, Signal getter, or runtime hook is run. */
export function parseJsonView(input: unknown, catalog: JsonCatalog): JsonView {
  const node = cloneJsonValue(input);
  walk(node, catalog, "$", undefined);
  return Object.freeze({ [parsed]: true as const, node: node as JsonNode });
}
/** Create ordinary VNodes. Mounting, subscriptions, Context and cleanup remain renderer-owned. */
export function createJsonView(view: JsonView, options: JsonViewOptions): Child {
  if (!view || view[parsed] !== true)
    return fail("invalid_view", "$", "Expected a parsed JSON view");
  const checked = parseJsonView(view.node, options.catalog);
  return walk(checked.node as JsonValue, options.catalog, "$", options);
}
/** Describe exactly the same finite metadata used by admission; this is not Props reflection. */
export function describeJsonCatalog(catalog: JsonCatalog): JsonValue {
  const components: Record<string, JsonValue> = Object.create(null);
  for (const [name, definition] of catalog) {
    const props: Record<string, JsonValue> = Object.create(null);
    for (const [key, raw] of Object.entries(definition.props)) {
      const field = raw as Property;
      props[key] =
        field.kind === "action"
          ? { kind: "action", args: field.args.map(describeJsonSchema), required: !!field.required }
          : {
              kind: "value",
              schema: describeJsonSchema(field.schema),
              bindable: !!field.bindable,
              required: !!field.required,
              ...(Object.hasOwn(field, "default")
                ? { default: cloneJsonValue(field.default) }
                : {}),
            };
    }
    components[name] = { props, children: true, additionalProperties: false };
  }
  return { components };
}
