# MeowJSX

## Render-tree context

`createContext(defaultValue)` returns a typed Context and a `Provider` component.
`<Context.Provider value={value}>…</Context.Provider>` does not create a host node; descendant components read the nearest
ancestor value with `useContext(Context)` during synchronous render, and get the default when there is no Provider.
An explicitly provided `undefined` is still a value and does not fall back to the default. Siblings, independent root nodes and runtimes do not share environment.

Environment follows render-tree traversal, not the location where the VNode was created. Pre-created VNodes, arrays, host wrapper layers and subtrees replaced later by a Signal use the environment captured in the current area; deferred mounting of Promises and AsyncIterables preserves it as well.
Synchronous HTML output follows the same ancestor rule, but still does not support Promise / AsyncIterable content and throws when it encounters them.

`useContext` reads environment only during the component's synchronous execution. Event handlers and code after `await` must use the value captured in render beforehand; do not treat it as asynchronous local storage. Provider does not add whole-tree re-render or dependency tracking; to share a dynamic value, pass a Signal object as the value and let consumers use the existing Signal binding. Replacing a Provider's ordinary value does not automatically re-run already mounted descendants. Context's internal scope is passed by the renderer and users must not modify it.

`RuntimePlugin.resolveComponent({ component, props, runtime })` can select a replacement function before the component is called.
It is called in the order `pre`, normal, `post`, and within each group's registration order; the first non-`undefined` result wins, and returning the original function also stops resolution; the result is not resolved recursively. Selection happens before the lifecycle scope is created, and the selected component uses its own metadata, parts and cleanup logic while the original component does not execute. `props` is a read-only typed view and does not copy or freeze the object.

This hook belongs to the execution runtime: pre-created VNodes, Signal/Promise deferred mounts and synchronous HTML all apply. The cleanup returned by `runtime.use()` unmounts rules and does not rewrite already mounted instances; other runtimes are unaffected.

`RuntimePlugin.prepareContainer({ runtime, container, target })` prepares a container before a target
renderer mounts into it, such as delivering a stylesheet to its document, and returns the cleanup.
The core types the container as `unknown`; the plugin narrows it by `target` (`"web"` passes the
container Element). `runtime.targetHooks.prepareContainer(container, target)` runs the hooks in
`pre`, normal, `post` order and returns one cleanup that releases them in reverse; a target calls it,
hosts do not. `meowjsx/web` `render` prepares the container before the tree mounts and releases it
after `unmount()` removes the tree. If a hook or the synchronous first render throws, what was
acquired is released and the error propagates; asynchronous render failures go to `onError` and
release nothing early. Release continues past a failing cleanup and rethrows the first error.
`renderToHtml` runs no hook. Uninstalling a plugin releases the containers it prepared, and a plugin
installed after a render reaches only later renders.
It does not intercept module side effects or direct function calls, and does not change the meaning of the `create` / `render` hooks.

## Development metadata and instance observation

Component functions may carry `metadata?: ComponentMetadata`. `ComponentMetadata` is an open type-extension interface; development tools register their own namespaces through declaration merging, and core does not interpret or read their tool fields.
`Component<Props>` preserves this constraint, and ordinary functions can use
`satisfies ComponentMetadata` to check assignment. Metadata is not part of props or component runtime options.

`runtime.createRenderer(strategy, { observer })` enables target-neutral instance observation:
`onComponent(instance)` reports creation, `onUnmount(instance)` reports unmounting; the optional
`onNode(instance, node, mounted)` reports node-association changes. An instance includes this renderer's `id`,
`parent`, the original function `originalComponent`, the actually executed function `component`, and a live read-only `nodes` collection.
The collection includes host and text output of that instance and its descendants, excluding internal markers; Signal, Promise and AsyncIterable updates keep the current associations.
Arrays and host tags do not add component levels, and direct function calls do not create component instances.

Built-in Fragment and Context Provider report `semantic` as `fragment` or
`context-provider` according to their actual executed function identity, not by name guessing. Replaced components use the selected function's semantic identity and metadata.
Observation adds no host wrapper layers; when disabled, no instance or node index is created. Callbacks run synchronously, and a throw is handled as a mount or cleanup failure; tools should handle diagnostics at their own boundary. Instances are removed from the tool projection after unmount, and `id` is not used to locate instances across runs.

The optional `onFlush(changed)` merges instance-invalidation notices in a microtask, covering component mount/unmount, node associations and updates to mounted host Signal props; exceptions and rollbacks also notify instances whose current facts may have changed. `changed` uses real instance
identity and includes instances unloaded in this round; it is not a successful-commit record. The set is cleared before the callback runs, and new changes caused by the callback go into the
next round without recursive delivery. It does not mean DOM layout, paint, all asynchronous work or application readiness; without this callback,
no additional dirty set or microtask is established. A throw from this callback goes through the renderer's `onError(error, "async")` and does not roll back
rendering that already happened; if no error outlet is provided, it is thrown asynchronously.

Tools can set `observer.roots` to limit the observed subtree by child object reference; when omitted the whole render tree is observed, and an empty array observes no instances. After entering each root, the first-level component's `parent` is `null`; outer containers still render normally,
pass context and run lifecycle, but do not enter the observation projection. A root may be a VNode, Signal, Promise or
AsyncIterable, and deferred output continues to use that scope. If the caller expands a content array into a container, it should pass the actual child references inside it. This scope adds no component calls and does not affect runtime hooks or component replacement.

Multiple consumers use `createComponentObservation<TNode>({ roots?, onError? })` instead of each copying
its own instance Map. It returns `observer`, `read(root?)`, `subscribe(listener, { root? })` and `dispose()`.
After wiring `observer` into the renderer, subscribe first and then read to obtain the current state and subsequent invalidation notices:

```ts
const observation = createComponentObservation<HostNode>({ onError: reportObserverError });
const renderer = runtime.createRenderer(strategy, { observer: observation.observer });
const unsubscribe = observation.subscribe(() => inspect(observation.read()));
const current = observation.read();
```

`read` returns a copy of the current instance-member array; the instance `nodes` is still the renderer-owned live collection; it is not
an immutable historical snapshot. `root` is the real instance object and includes itself and its descendants; reading an unmounted root is empty. Changes inside the root and ancestor changes can both invalidate subscriptions; notification may be conservative and does not promise a precise layout-impact set. Subscriptions have no implicit first replay;
delivery uses a snapshot of the subscriber list and re-checks validity before calling, so subscriptions cancelled in this round no longer run, and newly added
subscriptions begin with later notifications. A throwing consumer does not block other consumers; the error goes to the observation center's `onError`;
if that outlet is missing or throws again, the error is reported asynchronously rather than silently swallowed.

`dispose` only stops observation and clears the projection; it does not unmount the view. Afterwards `read` is empty and `subscribe` rejects; late notifications
from an existing renderer are ignored. Usually one observation center is attached to one renderer; the implementation stores by instance identity and does not overwrite because different renderers have the same numeric id. `roots` may use a getter, but the scope is read and fixed when the renderer is created, suitable for tools that set the real child before creation; it is not a runtime dynamic-switch entry. Purely host or text roots
have no component instances, and external DOM/styles, font loading and browser size changes also do not belong to this observation contract.

MeowJSX core: the JSX/VNode factory, Signal/batch/effect, component metadata and part bindings, shadow/plugin/theme
contracts, lifecycle and context, and the target-neutral renderer seam (`RenderStrategy<TNode>` /
`createRenderer()`). Core does not know the target platform.

```text
JSX source / component logic
          │
meowjsx (this package: core + JSX contract)
       └─→ meowjsx/web   the same package's DOM / event / HTML / mount modules
```

## Exports

- `.`, `./runtime`: `h`, `Fragment`, `raw`, `createRuntime`, `defaultRuntime`, `defineShadow`,
  `createThemePlugin`, part descriptor helpers, plus VNode/metadata, `Context` and generic ref types.
  Existing reactive exports remain available and share the implementation below.
- `./signal`: `signal`, `batch`, `mapSignal`, `derived`, `isSignal`, `unwrap`, and the
  `ReadableSignal`, `WritableSignal`, `Signal` and `MaybeSignal` types. This DOM-free entry loads
  the reactive implementation without creating a runtime or renderer.
- `./i18n`: `createI18n`, `t`, `defineMessages`, `I18nProvider`, `useI18n` and the `Catalog`,
  `Message`, `MessageDescriptor` and `I18n` types; see [Internationalization](#internationalization).
  DOM-free (ECMAScript and `Intl` only) and not re-exported from the root.
- `./i18n/audit`: `extractMessages`, `messageArguments`, `auditCatalog` and `CLOSEST_SIMILARITY`;
  see [Audit](#audit). Pure functions over strings: no IO, no DOM, and no import of the runtime or
  renderer.
- `./renderer`: `RenderStrategy<TNode>`, `createRenderer()`, `Renderer`/`Rendered`/
  `RendererOptions`, `ComponentObserver`/`ObservedComponent` and other target-seam types. `createRenderer()` injects component lifecycle,
  render hooks, overrides and `key`/`componentPart` identity; the target only implements node and attribute placement.
- `./jsx-runtime`: `jsx`/`jsxs`/`jsxDEV`/`Fragment`.
- `./jsx-dev-runtime`: the `jsxDEV`/`Fragment` needed by development automatic JSX, reusing the same implementation.
- `./web`: DOM mount, static HTML, Web shadow, instance-observation sources and skeleton visual controls.
- `./json`: finite descriptions, host binding/action references, single-source metadata validation and catalog descriptions; see [JSON entry](JSON.md).
- `Runtime.targetHooks`: when the target owns the output path (Web's static HTML), reuse the runtime's
  component calls, render hooks and override semantics instead of copying a set into the target.

The core root has no `render`/`renderToHtml`: `render(node, Element)` and HTML serialization are imported from
`meowjsx/web`. The root does not import Web back; both use the same core module, and multiple explicit Runtimes can still be created independently.

### API migration

- Use `defineShadow(component, part, setup)` in place of the removed `shadow` alias. It creates a
  definition; register it through `createRuntime({ shadows: [...] })` or a runtime plugin. Setup runs
  when the target mounts the matching part. Core keeps the host handle generic; `meowjsx/web` types
  it as `Element`.
- Use `renderer.render(node, parent, before?)` on the target-neutral renderer and
  `web.render(node, container)` on the Web renderer. Both return an `unmount()` handle. The `mount`
  methods and top-level Web `mount` export are removed; static output remains `renderToHtml`.

## Invariant: core contains no platform

The core source (including types) does not contain `document`, `window`, DOM `Element`/`HTMLElement`,
browser `Event`, CSS APIs or terminal APIs. `packages/meowjsx/tsconfig.core.json` checks the whole core under a configuration without the
`dom` lib and with `types: []`:

```sh
bun node_modules/typescript/bin/tsc -p packages/meowjsx/tsconfig.core.json
```

The command above runs from the repository root and only checks the DOM-free core group. The package's `bun run typecheck` runs core, renderer and Web configurations in order; the final Web group explicitly includes the DOM and is not equivalent to the DOM-free core-only check. `tsconfig.renderer.json` independently checks the target-neutral renderer seam, and behavior cases use a fake target.

`ShadowContext.element` is the target-provided host handle, typed as generic `TNode` in core
(defaults to `unknown`); the Web module narrows it to a real element. Theme contracts (`Theme`/`ThemeRule`/
`ThemeStyle` and their merge rules) stay in core as planned; they carry values only and touch no style API.

## Class lists

`className` accepts strings, stringifiable class values, nested readonly arrays, and Signals of
those values. Arrays keep their order, join with spaces, and omit `false`, `null`, `undefined` and
empty strings. They do not merge conflicting classes or interpret objects as class dictionaries.
The native `class` attribute follows the same runtime normalization.

```tsx
import { h } from "meowjsx";
import { signal } from "meowjsx/signal";

const stateClass = signal("is-idle");
<div className={["panel", [false, stateClass], "host-panel"]} />;
stateClass.value = "is-active";
```

Static HTML reads current values without subscribing. Mounted nodes subscribe to Signals at any
list depth, update their class attribute in place, and release replaced sources and unmount
subscriptions. Theme-provided class lists compose with the caller's classes in the same way. The
public `ClassValue` type is available to components that forward `className`.

## Components and refs

Components are ordinary functions. A static `meta` declares their stable name and finite parts;
`Context<typeof Component>` supplies the lifecycle and a typed `parts` map. Use
`Context<typeof Component, ComponentProps>` when setup also needs the declared types of
`context.props`. Setup runs once per mount, and Signals carry later changes. Import `signal`
directly from `meowjsx/signal` and create local state inside setup; each mount creates its own Signals.
`context.effect` and `context.onCleanup` manage effects and cleanup for that mount. Signals have no
dispose operation; the renderer releases its binding subscriptions on unmount. Register any manual
subscription's unsubscribe function with `context.onCleanup`.

```tsx
import { h, type Context, type Props } from "meowjsx";
import type { WebRef } from "meowjsx/web";

interface PanelProps extends Props {
  title: string;
  ref?: WebRef<HTMLElement>;
}

export function Panel({ title, children, ref, ...props }: PanelProps, ctx: Context<typeof Panel>) {
  return (
    <section {...props} ref={[ctx.parts.root, ref]}>
      <h2 ref={ctx.parts.heading}>{title}</h2>
      <div ref={ctx.parts.body}>{children}</div>
    </section>
  );
}
Panel.meta = { name: "panel", parts: ["root", "heading", "body"] } as const;
```

`ref` accepts nested readonly arrays of part descriptors, node callbacks and `false`/nullish
omissions. Callbacks run in order at the existing host-property mount point; returned synchronous
cleanups run in reverse order. A failure still releases acquired cleanups. Static HTML extracts part
identity without running callbacks. A host node accepts one distinct part identity, and a descriptor
can mark several nodes. Component refs remain props and are forwarded explicitly to the intended
host node.

Generic ref types stay in the DOM-free root. Importing the explicit `meowjsx/web` type surface adds
HTML/SVG node inference for native JSX refs. Register component functions with `components: [Panel]`;
metadata does not register itself. The [parts and ref-binding design](../../docs/designs/2026-10-24-component-parts-ref-bindings.md)
records the breaking migration and theme adapter.

## Bundling

The package declares `sideEffects: false` and ships one ESM module per source file. The default
runtime, JSX runtime and Web renderer are created by `/* @__PURE__ */` calls, and their exported
members (`h`, `Fragment`, `jsx`, `render` and the rest) are pure reads, so a bundle that imports only
Signals, Context or types leaves the runtime and renderer out.

## Verification

- `bun test packages/meowjsx/tests/unit`: Signal, VNode, plugin, metadata, part/ref bindings, fake target seam and Web host tests.
- `tests/types/` checks core and Web type cases separately; the core type environment does not include the DOM.

## Internationalization

`meowjsx/i18n` translates by source sentence: the literal text is the message identity, so a
single-language application needs no provider, catalog or key.

```tsx
import { t } from "meowjsx/i18n";

function Header() {
  return (
    <nav aria-label={t("Primary navigation")}>
      <a href="/posts/">{t("Posts")}</a>
      <span>{t("{count, plural, one {# min read} other {# mins read}}", { count })}</span>
    </nav>
  );
}
```

```tsx
import { createI18n, I18nProvider } from "meowjsx/i18n";

const i18n = createI18n({ source: "en", locale: "fr", catalogs: { fr: { Posts: "Articles" } } });
render(
  <I18nProvider value={i18n}>
    <App />
  </I18nProvider>,
  container,
);
i18n.locale.value = "en"; // mounted text and attributes update in place
```

- `t(source, params?, options?)` returns a `ReadableSignal<string>` that follows the locale, the
  catalogs and any Signal parameter. A mounted child, attribute or `className` binds to it; static
  HTML reads it once. `options.context` is part of the identity; `options.note` is ignored at run time.
- The message Signal throws from `toString` and `Symbol.toPrimitive`, so `` `${t("Posts")}` `` and
  `t("a") + "b"` fail loudly. Read `.value` for a string, or pass variables through
  `t("Hello, {name}", { name })`.
- `source` must be written as a literal: a value of type `string` or a template literal with a
  runtime part is a type error. Required parameter names are inferred only when the literal has no
  `,` inside braces, no nested brace, no space inside a name and no apostrophe; otherwise
  parameters are loose.
- Messages support `{name}`, `{count, plural, =0 {...} one {...} other {...}}` and `#` (the
  locale-formatted number). An apostrophe is literal unless it directly precedes `{`, `}` or `#`,
  where it starts a quoted section ending at the next apostrophe (`''` is a literal apostrophe), so
  `l'{name}` does not interpolate; write `l’{name}`. A placeholder with no parameter stays visible
  as written, and a template that does not parse throws an error naming it.
- `{kind, select, a {...} b {...} other {...}}` picks the branch whose selector equals the value
  (`other` otherwise). `{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}` selects
  with the locale's ordinal rules (`Intl.PluralRules` with `type: "ordinal"`) and accepts `=N`
  and `#` like `plural`. `other` is required in all three; branches may nest arguments, and a `#`
  in a `select` branch inside a `plural` is the plural's number. Any other argument type
  (`number`, `date`) is a parse error.
- A catalog is a flat object from source to translation, or to an object from context to
  translation with `""` for no context. An empty string counts as missing; only own properties are
  read. Lookup tries the locale, then its parents (`zh-Hant-TW`, `zh-Hant`, `zh`), then the source
  text. A locale equal to, or a child of, `source` uses the source text without a miss;
  otherwise `onMissing({ source, context?, locale })` is called once per source, context and locale.
- `createI18n` returns a plain object: `locale` (writable Signal of a canonical tag; an invalid tag
  throws), `direction` (`"ltr"` or `"rtl"`, derived from the locale's script because Bun has no
  `getTextInfo`), `t`, `number(value, options?)` and `date(value, options?)` (Signals of strings;
  `date` uses the instance `timeZone` unless the options set one), `addCatalog` and
  `setLocale(locale)`. `setLocale` loads through `load` first when the locale has no catalog, then
  writes `locale`, and with concurrent calls only the last one writes. Bind `lang` and `dir` on your
  own element; the entry never touches the document.
- The module-level `t` reads the nearest `I18nProvider` and works only while a component function
  body runs, binding the message to that instance for good. Without a provider it renders the
  source text, with the plural rules of `"en"`. In a handler, a `derived` body, an effect, a `keyed`
  callback, after `await`, at module top level or in a plain function it throws; use `i18n.t`
  there, which has the same signature and works anywhere.
- `defineMessages(table)` declares messages away from their use, at module top level or in a table
  keyed by a status or error code. Each entry is a literal source or `{ source, context?, note? }`;
  the result is a frozen object of frozen descriptors with the same keys, and no lookup happens.
  `t` and `i18n.t` accept a literal, a descriptor, or a Signal of a descriptor as the first
  argument. With a Signal, the message follows both the locale and the descriptor, so
  `t(derived(() => labels[status.value]))` called in the component body works. A descriptor's own
  `context` wins over `options.context`; parameters of a descriptor are not inferred. A value of
  type `string` is still a type error for `t` and for a table entry.
- `t.rich(source, parts, params?, options?)` (also `i18n.t.rich`) returns a `ReadableSignal<Child>`
  for a message with named tag pairs: `t.rich("Read <link>the guide</link>", { link: (children) =>
  <a href="/guide/">{children}</a> })`. A tag is `<name>` ... `</name>` with no attributes and no
  self-closing form; `parts` maps each tag name in the literal to `(children: Child) => Child`
  and a missing part is a type error. Arguments, plurals and selects work inside and outside
  tags, and a translation may move or reorder tags. The result is an array of strings and part
  results that the renderer and `renderToHtml` accept. A tag in the message (or in its
  translation) with no matching part throws an error naming the tag and the source when the
  Signal is read. `<` is only interpreted by `t.rich`: in `t` it is ordinary text, and in `t.rich`
  a `<` that does not start `<name>` or `</name>` is text. Parts run when the Signal is evaluated,
  outside the component body, so they should not call the ambient `t`. The ambient `t.rich` has the
  same in-component-body rule as `t` and the rich Signal refuses string conversion like a message.
- `i18n.lookup(text, options?)` translates a string that is not a literal, such as site
  configuration copy, through the same catalogs, the same fallback chain and the same `onMissing`
  reporting, and returns a message Signal. The text and its translation are **literal**: no
  placeholder, plural or apostrophe is interpreted, because such copy may contain braces and
  apostrophes. It is an instance method only; there is no ambient `lookup`. The scanner cannot see
  these strings, so their owner passes the same set to `auditCatalog` as extra messages.

### Audit

`meowjsx/i18n/audit` turns "did every string get translated" into a list. It runs at build time
and imports nothing but the message parser the run time also uses, so the audit and the run time
cannot disagree about what a template contains.

- `extractMessages(code, file)` returns `{ messages, dynamic, aliases }`. It is a scanner, not a
  TypeScript parser: it lexes enough TS and TSX to skip comments, string and template literals
  (including `${}` nesting), regex literals and JSX text, then reads only the argument list of
  each call to `t(`, `.t(`, `t.rich(`, `.t.rich(`, `.lookup(` and `defineMessages(`. Matching is by
  name, so an unrelated `.t(` also appears; filter by file. A first argument that is one string
  literal (single or double quoted, or a template without substitutions, with escapes decoded) is
  a message `{ source, context?, note?, kind: "t" | "rich" | "defined", key?, literal?, file, line,
  column, placeholders, tags }`. `context` and `note` come from an options object literal (third
  argument of `t`, fourth of `t.rich`, second of `lookup`); a `context` that is not a literal
  makes the call dynamic. `defineMessages` members with a literal source, or an object literal
  with a literal `source`, are messages of kind `"defined"` with their `key`. A `.lookup("...")`
  call with a literal is a message with `literal: true`.
- Everything else is reported in `dynamic` as `{ file, line, column, callee, argument, reason }`
  and never skipped: template literals with substitutions, concatenations, identifiers, member
  accesses (the scanner does not try to prove one is a descriptor), calls, other expressions,
  every non-literal `.lookup(...)`, and unreadable `defineMessages` members. `reason` is one of
  `missing-argument`, `template-literal`, `concatenation`, `identifier`, `member-access`, `call`,
  `expression`, `lookup`, `context`, `options`, `not-an-object-literal` and `unreadable-member`.
  `aliases` lists `import { t as x } from "meowjsx/i18n"` (and the same for `defineMessages`),
  and calls through the alias are scanned. Line and column are 1-based and point at the callee
  name, or at the member key for `defineMessages`. An unterminated construct ends the scan of that
  region without throwing.
- `messageArguments(source, { rich? })` returns `{ names, tags }` from the shared parser and
  throws when the template does not parse.
- `auditCatalog(messages, catalog, locale, { extra?, extraLiteral? })` compares messages with one
  locale's catalog (source to string, or to an object from context to string, `""` for none) and
  returns `{ locale, missing, unused, invalid }`:
  - `missing`: `{ source, context?, note?, file?, line? }` for a message with no translation or an
    empty one;
  - `unused`: `{ source, context?, translation, closest? }` for a non-empty catalog entry that no
    message refers to. `closest` is the first missing item with the highest normalized
    edit-distance similarity (case-insensitive, `1 - distance / longer length`) of at least
    `CLOSEST_SIMILARITY` (0.6), so an edited sentence carries its old translation as a starting
    point;
  - `invalid`: `{ source, context?, translation, reason }` when the source or the translation does
    not parse, when the set of argument names differs (this also catches `l'{name}`, where the
    apostrophe swallows the placeholder), or, for messages of kind `"rich"`, when the set of tag
    names differs. Plural categories are not validated against `locale`; it is recorded in the
    result.
  - `extra` adds messages the scanner cannot see; with `extraLiteral` (default `true`) they are
    literal text, as `lookup` treats them, and only their presence is checked.

```ts
import { auditCatalog, extractMessages } from "meowjsx/i18n/audit";

const { messages, dynamic } = extractMessages(await readSource(file), file);
const { missing, unused, invalid } = auditCatalog(messages, catalog, "fr", {
  extra: [{ source: site.description }],
});
```

## Web module

```ts
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";

const web = createWebRenderer(createRuntime());
const mounted = web.render(h("p", {}, "Hello"), document.querySelector("main")!);
mounted.unmount();
```

The Web source lives in `web/`, and DOM types only arrive through that entry. Static `renderToHtml` does not mount a DOM or run shadow;
`createSkeletonController` needs a real document and CSS Custom Highlight support only when called.
Importing the module creates the default Web renderer and observation Context; it does not install styles or listeners.
`createWebRenderer(runtime)` respects the components, themes and plugins already installed in that runtime; when an observation source is passed explicitly,
its lifecycle is managed by the consumer, and no global observation tree is created across renderers.

Public JS artifacts preserve module relationships: the root, runtime, automatic JSX and Web entries reference the same core.
Release builds must not copy a defaultRuntime, Context or reactive scheduler per entry.

## Signal interoperability

Import reactive functions and types from `meowjsx/signal`:

```ts
import { signal, mapSignal, derived, batch, type ReadableSignal } from "meowjsx/signal";
```

The renderer's `SignalLike<T>` type from `meowjsx/renderer` describes its structural input protocol.
MeowJSX's `ReadableSignal<T>` and compatible external implementations satisfy that protocol. JSX
bindings accept any object with this shape; no MeowJSX constructor or brand is required:

```ts
interface SignalLike<T> {
  readonly value: T;
  subscribe(listener: (value: T) => void): () => void;
}
```

`value` returns the current value. `subscribe` reports changed values and returns an unsubscribe
function. The renderer reads the initial value, subscribes for updates and unsubscribes on unmount.
`mapSignal(source, map)` also subscribes explicitly, so it works with external implementations.
A third-party API with a different shape needs an adapter to this contract.

Automatic dependency tracking in `context.effect` and `derived` requires getters from the shared
MeowJSX reactive implementation. Reading an external Signal's `.value` alone does not register it as
a dependency; this also applies to component logic that uses those computations. Use `mapSignal`
for an explicit source, or subscribe directly and register the unsubscribe function with
`context.onCleanup`. The root, runtime and signal entries share one reactive module and scheduler.

## Derived signals

`derived(read)` is a read-only signal. `read` runs again when any signal it read changes, and subscribers hear the value when `Object.is` says it changed. `read` must not write signals. One source can also use `mapSignal`. A computation is not stored by writing another signal from `effect`.

## Keyed dynamic lists

`keyed(items, key, render)` keeps rows with the same key holding the same components, nodes, Context and observation parent chain; an update only changes that row's read-only item Signal,
a deletion releases that row's lifecycle, and reordering moves the existing range. Whole-replacement semantics for plain arrays and Signals are unchanged.

```ts
import { h, keyed } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";

const items = signal([{ id: "one", label: "First" }]);
const rows = keyed(
  items,
  (item) => item.id,
  (item) =>
    h(
      "p",
      {},
      mapSignal(item, (value) => value.label),
    ),
);
```

`render` constructs a Child and is not an extra lifecycle hook; when reading Signals inside a component, keep using the existing Signal properties or `mapSignal`.
Keys must be unique and must be strings or finite numbers; duplicate/invalid keys and new-row mount failures keep the original rows and values, and later valid updates still continue.
Target insert/remove failures provide no transactional rollback. Ordinary appends at either end do not move old rows; whether native focus survives arbitrary reordering depends on the target's move capability.
Static HTML reads the list once and does not subscribe or mount a DOM.
