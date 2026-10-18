# JSON description entry

`meowjsx/json` builds ordinary MeowJSX VNodes from finite JSON descriptions, using the existing runtime, Context, Signal, components and renderer lifecycle; the core root entry does not import JSON or the DOM back.

```ts
import { createJsonView, defineJsonComponent, jsonSchema, parseJsonView } from "meowjsx/json";
import { h, signal, type MaybeSignal } from "meowjsx";

const Label = (props: { text: MaybeSignal<string> }) => h("span", null, props.text);
const catalog = new Map([
  [
    "Label",
    defineJsonComponent(Label, {
      text: { kind: "value", schema: jsonSchema.string(), bindable: true, required: true },
    }),
  ],
]);
const text = signal("Hello");
const description = parseJsonView(
  { component: "Label", props: { text: { $binding: "label" } } },
  catalog,
);
const child = createJsonView(description, { catalog, bindings: new Map([["label", text]]) });
```

Nodes support strings, finite numbers, booleans, null, node arrays, and `{component, props?, children?}`. `component` must be an exact name in the host catalog; arbitrary HTML tags, raw HTML, refs, code, dynamic imports, expressions or object paths are not provided. A binding in a description has the exclusive shape `{$binding:"exact name"}`, and an action has `{$action:"exact name"}`. Names are looked up only as exact Map keys; dots and paths are not parsed, and no external permissions are granted.

`parseJsonView` only validates, copies and freezes data; it does not execute components, actions, event projections, Signal getters or runtime hooks. `createJsonView` then validates against the given catalog, binds the host's read-only Signals and real functions, and constructs VNodes; mounting and unmounting are still managed by the original renderer. Action arguments are validated by the finite schema in metadata; the host may provide a trusted `mapArgs` in metadata to project native events into explicit arguments, while JSON cannot provide executable code. The callback's original return value is preserved.

`jsonSchema` supports string/number/boolean/enum/array/object/optional/data/union, and description and validation share these definitions. Object fields are strict, and a union must match one complete branch; `data()` only promises a pure JsonValue and does not claim through generics that a complex business type has been validated. Ordinary fields named constructor, $binding or $action inside data are still data and are not recursively interpreted as controls. If a prop's outermost value happens to be an exclusive reference marker, it is kept as a reference; when that literal object is needed, the host binding provides it rather than an additional escape DSL.

`defineJsonComponent` statically associates finite metadata with the original component's Props and excludes arbitrary index fields of open Props; it does not reflect TS types automatically and does not claim that a whole-component schema exists. A concrete component library must state its supported set explicitly. `describeJsonCatalog` and `describeJsonSchema` output the finite description from the same metadata and do not maintain a separate schema. Functions, File, class instances, accessors, circular references, sparse arrays and non-finite numbers are not JSON data; the host is still responsible for network, permissions, persistence and the real data source.

Value metadata may provide a literal `default` that is validated against the same schema and copied and frozen, filled in only when the description omits that property; false, 0 and the empty string are not treated as missing. It does not execute actions, bindings or callbacks, and does not change the requirement that an explicit value for that property still matches the schema.
