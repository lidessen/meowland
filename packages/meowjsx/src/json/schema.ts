export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export class JsonViewError extends Error {
  constructor(
    readonly code: string,
    readonly path: string,
    message: string,
  ) {
    super(`${path}: ${message}`);
    this.name = "JsonViewError";
  }
}

const schemaType = Symbol("meowjsx.json.schema");
type Definition =
  | { kind: "string" | "number" | "boolean" | "data" }
  | { kind: "enum"; values: readonly JsonPrimitive[] }
  | { kind: "array"; item: JsonSchema<unknown> }
  | { kind: "object"; fields: Readonly<Record<string, JsonSchema<unknown>>> }
  | { kind: "optional"; value: JsonSchema<unknown> }
  | { kind: "union"; variants: readonly JsonSchema<unknown>[] };

export interface JsonSchema<T> {
  readonly [schemaType]: T;
  readonly definition: Definition;
}
type Infer<S> = S extends JsonSchema<infer T> ? T : never;
type RequiredFields<F> = { [K in keyof F]-?: undefined extends Infer<F[K]> ? never : K }[keyof F];
type ObjectValue<F> = { readonly [K in RequiredFields<F>]: Infer<F[K]> } & {
  readonly [K in Exclude<keyof F, RequiredFields<F>>]?: Exclude<Infer<F[K]>, undefined>;
};
const define = <T>(definition: Definition): JsonSchema<T> =>
  Object.freeze({ [schemaType]: undefined as T, definition: Object.freeze(definition) });

/** Finite data descriptions, shared by admission and the public catalog description. */
export const jsonSchema = {
  string: (): JsonSchema<string> => define({ kind: "string" }),
  number: (): JsonSchema<number> => define({ kind: "number" }),
  boolean: (): JsonSchema<boolean> => define({ kind: "boolean" }),
  data: (): JsonSchema<JsonValue> => define({ kind: "data" }),
  enum<const V extends readonly JsonPrimitive[]>(...values: V): JsonSchema<V[number]> {
    if (!values.length) throw new Error("JSON enums require at least one value");
    values.forEach((value) => cloneJsonValue(value));
    return define({ kind: "enum", values: Object.freeze([...values]) });
  },
  array<T>(item: JsonSchema<T>): JsonSchema<readonly T[]> {
    return define({ kind: "array", item });
  },
  object<const F extends Readonly<Record<string, JsonSchema<unknown>>>>(
    fields: F,
  ): JsonSchema<ObjectValue<F>> {
    return define({ kind: "object", fields: Object.freeze({ ...fields }) });
  },
  optional<T>(value: JsonSchema<T>): JsonSchema<T | undefined> {
    return define({ kind: "optional", value });
  },
  union<const V extends readonly JsonSchema<unknown>[]>(
    ...variants: V
  ): JsonSchema<Infer<V[number]>> {
    if (!variants.length) throw new Error("JSON unions require at least one variant");
    return define({ kind: "union", variants: Object.freeze([...variants]) });
  },
};

/** Copy JSON data without interpreting names inside business objects as controls. */
export function cloneJsonValue(
  input: unknown,
  path = "$",
  ancestors = new Set<object>(),
): JsonValue {
  if (input === null || typeof input === "string" || typeof input === "boolean") return input;
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input !== "object" || input === null)
    throw new JsonViewError("invalid_data", path, "Expected finite JSON data");
  if (ancestors.has(input))
    throw new JsonViewError("invalid_data", path, "Cyclic JSON data is not supported");
  const prototype = Object.getPrototypeOf(input);
  if (!Array.isArray(input) && prototype !== Object.prototype && prototype !== null)
    throw new JsonViewError("invalid_data", path, "Expected a plain JSON object");
  if (Object.getOwnPropertySymbols(input).length)
    throw new JsonViewError("invalid_data", path, "JSON data cannot contain symbol keys");
  ancestors.add(input);
  try {
    const fields = Object.getOwnPropertyDescriptors(input);
    for (const field of Object.values(fields))
      if (field.get || field.set)
        throw new JsonViewError("invalid_data", path, "JSON accessors are not supported");
    if (Array.isArray(input)) {
      if (
        Object.keys(fields).some(
          (key) => key !== "length" && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= input.length),
        )
      )
        throw new JsonViewError("invalid_data", path, "JSON arrays cannot contain named fields");
      const values: JsonValue[] = [];
      for (let index = 0; index < input.length; index++) {
        if (!Object.hasOwn(fields, index))
          throw new JsonViewError("invalid_data", path, "Sparse JSON arrays are not supported");
        values.push(cloneJsonValue(fields[index]!.value, `${path}[${index}]`, ancestors));
      }
      return Object.freeze(values);
    }
    const value: Record<string, JsonValue> = Object.create(null);
    for (const key of Object.keys(fields)) {
      if (!fields[key]!.enumerable)
        throw new JsonViewError("invalid_data", path, "JSON fields must be enumerable");
      value[key] = cloneJsonValue(fields[key]!.value, `${path}.${key}`, ancestors);
    }
    return Object.freeze(value);
  } finally {
    ancestors.delete(input);
  }
}

export function validateJsonValue<T>(schema: JsonSchema<T>, value: unknown, path = "$"): T {
  const definition = schema.definition;
  const fail = (): never => {
    throw new JsonViewError("invalid_prop", path, `Expected ${definition.kind}`);
  };
  switch (definition.kind) {
    case "string":
      if (typeof value !== "string") fail();
      break;
    case "number":
      if (typeof value !== "number" || !Number.isFinite(value)) fail();
      break;
    case "boolean":
      if (typeof value !== "boolean") fail();
      break;
    case "data":
      cloneJsonValue(value, path);
      break;
    case "enum":
      if (!definition.values.some((entry) => Object.is(entry, value))) fail();
      break;
    case "array":
      if (!Array.isArray(value)) fail();
      cloneJsonValue(value, path);
      (value as unknown[]).forEach((entry, index) =>
        validateJsonValue(definition.item, entry, `${path}[${index}]`),
      );
      break;
    case "object": {
      if (!value || typeof value !== "object" || Array.isArray(value)) fail();
      cloneJsonValue(value, path);
      const object = value as Record<string, unknown>;
      for (const key of Object.keys(object))
        if (!Object.hasOwn(definition.fields, key))
          throw new JsonViewError("unknown_field", `${path}.${key}`, "Unknown data field");
      for (const [key, child] of Object.entries(definition.fields))
        validateJsonValue(
          child,
          Object.hasOwn(object, key) ? object[key] : undefined,
          `${path}.${key}`,
        );
      break;
    }
    case "optional":
      if (value !== undefined) validateJsonValue(definition.value, value, path);
      break;
    case "union": {
      for (const variant of definition.variants) {
        try {
          return validateJsonValue(variant, value, path) as T;
        } catch (error) {
          if (!(error instanceof JsonViewError)) throw error;
        }
      }
      fail();
    }
  }
  return value as T;
}

export function describeJsonSchema(schema: JsonSchema<unknown>): JsonValue {
  const definition = schema.definition;
  switch (definition.kind) {
    case "data":
      return {};
    case "enum":
      return { enum: definition.values };
    case "array":
      return { type: "array", items: describeJsonSchema(definition.item) };
    case "optional":
      return describeJsonSchema(definition.value);
    case "union":
      return { anyOf: definition.variants.map(describeJsonSchema) };
    case "object": {
      const properties: Record<string, JsonValue> = Object.create(null);
      const required: string[] = [];
      for (const [key, field] of Object.entries(definition.fields)) {
        properties[key] = describeJsonSchema(field);
        if (field.definition.kind !== "optional") required.push(key);
      }
      return { type: "object", properties, required, additionalProperties: false };
    }
    default:
      return { type: definition.kind };
  }
}
