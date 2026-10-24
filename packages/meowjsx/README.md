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
It is called in the order `pre`, normal, `post`, and within each group's registration order; the first non-`undefined` result wins, and returning the original function also stops resolution; the result is not resolved recursively. Selection happens before the lifecycle scope is created, and the selected component uses its own contract, parts and cleanup logic while the original component does not execute. `props` is a read-only typed view and does not copy or freeze the object.

This hook belongs to the execution runtime: pre-created VNodes, Signal/Promise deferred mounts and synchronous HTML all apply. The cleanup returned by `runtime.use()` unmounts rules and does not rewrite already mounted instances; other runtimes are unaffected.
It does not intercept module side effects or direct function calls, and does not change the meaning of the `create` / `render` hooks.

## Development metadata and instance observation

Component functions may carry `metadata?: ComponentMetadata`. `ComponentMetadata` is an open type-extension interface; development tools register their own namespaces through declaration merging, and core does not interpret or read their tool fields.
Both `Component<Props>` and the value returned by `defineComponent` preserve this constraint, and ordinary functions can use
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

MeowJSX core: the JSX/VNode factory, Signal/batch/effect, component and part contracts, shadow/plugin/theme
contracts, lifecycle and context, and the target-neutral renderer seam (`RenderStrategy<TNode>` /
`createRenderer()`). Core does not know the target platform.

```text
JSX source / component logic
          │
meowjsx (this package: core + JSX contract)
       └─→ meowjsx/web   the same package's DOM / event / HTML / mount modules
```

## Exports

- `.`, `./runtime`: `h`, `Fragment`, `raw`, `part`, `signal`/`batch`/`mapSignal`/`derived`,
  `createRuntime`, `defaultRuntime`, `defineComponent`, `defineShadow`,
  `createThemePlugin`, plus VNode/Signal/contract types.
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

## Component authoring design

The [parts and ref-binding design](../../docs/designs/2026-10-24-component-parts-ref-bindings.md)
selects ordinary function components and native JSX with `ref={ctx.parts.root}` or composed
`ref={[ctx.parts.root, forwardedRef, mount]}` bindings. This is a design direction pending
implementation and type validation; current exports still use `context.part(...)`. It is a
breaking change: `context.part`, `defineComponent`, hand-written `ComponentContract` objects and
`partSelector` are removed without aliases; themes address parts through a type-only adapter.

## Verification

- `bun test packages/meowjsx/tests/unit`: Signal, VNode, plugin, contracts, fake target seam and Web host tests.
- `tests/types/` checks core and Web type cases separately; the core type environment does not include the DOM.

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

## Derived signals

`derived(read)` is a read-only signal. `read` runs again when any signal it read changes, and subscribers hear the value when `Object.is` says it changed. `read` must not write signals. One source can also use `mapSignal`. A computation is not stored by writing another signal from `effect`.

## Keyed dynamic lists

`keyed(items, key, render)` keeps rows with the same key holding the same components, nodes, Context and observation parent chain; an update only changes that row's read-only item Signal,
a deletion releases that row's lifecycle, and reordering moves the existing range. Whole-replacement semantics for plain arrays and Signals are unchanged.

```ts
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
