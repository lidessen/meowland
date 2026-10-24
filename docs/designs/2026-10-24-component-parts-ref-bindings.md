# Component parts through composable ref bindings

Status: selected authoring direction, pending implementation and type validation. This design covers
MeowJSX component implementations, their host nodes and how themes address parts. It is a breaking
change with no compatibility layer for the old authoring surface; see
[Breaking changes](#breaking-changes). Existing runtime APIs and published packages still use
`context.part(...)` and `partSelector(...)` until it lands; the examples below describe the target
API.

Component authors write ordinary functions and native JSX. A part is a binding supplied through
`ref`, and `ref` accepts multiple bindings when the component and its caller both need the node.

```tsx
// Target syntax. Context and Web ref type names remain to be finalized.
export function Panel({ title, children, ref, ...props }, ctx) {
  const p = ctx.parts;

  return (
    <section {...props} ref={[p.root, ref, mountPanel]}>
      <h2 ref={p.heading}>{title}</h2>
      <div ref={p.body}>{children}</div>
    </section>
  );
}
```

The setup body still runs once per mount. Signals continue to carry later updates; changing the
parts syntax does not introduce component re-rendering.

## Why change the current authoring model

Today a component declares a contract, repeats its name and part union in many `defineComponent`
calls, then creates each part with `context.part(name, tag, props, ...children)`. Nested parts move
ordinary element structure into nested function arguments. The multi-part
[Alert](../../packages/meowtail/src/components/alert.tsx) demonstrates this cost.

Ordinary component functions already receive a lifecycle context through the runtime's
[invocation path](../../packages/meowjsx/src/registry.ts). `defineComponent` attaches a contract and
supplies a fallback context for direct calls; it does not create the renderer-owned mount lifecycle.
A part binding can therefore replace the node-construction ceremony without replacing component
execution.

The binding must preserve more than a generated HTML attribute. Current parts carry
`VNode.componentPart`, including component identity, part name and original component props.
The [MeowCSS adapter](../../packages/meowcss/src/meowjsx/parts.ts) reads these facts to resolve style
options; runtime themes and Web shadows also consume the identity.

## Selected authoring surface

`ctx.parts` exposes the finite part names associated with the component's contract. Each member is
an opaque, reusable binding descriptor. It carries identity and original component props; it does
not automatically forward those props, merge events, hold a single current element, or create a
component instance.

```tsx
const p = ctx.parts;

<input ref={p.control} disabled={disabled} />;
<div ref={[p.panel, mountPanel]} />;
```

A single binding remains valid. An array composes part bindings, caller refs and local callbacks.
The same composition works without parts:

```tsx
<input ref={[forwardedRef, connectValidation, observeSize]} />
```

The selected public route is `ref`. A separate `parts` prop and a part-specific `withRef` method are
not needed for this design. Native HTML `part` and `as` attributes keep their meaning.

### Ref composition

The implementation should support readonly arrays and nested arrays so forwarding a composed ref
does not require a component to inspect or flatten it:

```tsx
// forwardedRef may itself be an array.
<section ref={[p.root, forwardedRef, mountRoot]} />
```

Normalize arrays in depth-first, left-to-right order. Ignore `undefined`, `null` and `false`, so an
omitted caller ref and a conditional binding work without filtering. Preserve callback occurrences;
normalization must not silently deduplicate callbacks by function identity.

For the initial implementation, a host VNode may carry at most one distinct part identity. Repeated
references to the same part descriptor are redundant identity declarations. Multiple distinct part
descriptors on one node are rejected before mount, rather than choosing one by array order. This
keeps the current single `componentPart` model. Supporting multiple identities is separate work on
theme matching, shadow application and CSS markers, not a consequence of accepting a ref array.

One descriptor may mark several nodes, as in repeated list items:

```tsx
<ul ref={p.root}>
  {items.map((item) => (
    <li key={item.id} ref={p.item}>
      {item.label}
    </li>
  ))}
</ul>
```

Each node owns its callback invocations and cleanup. List identity remains the responsibility of
`key` and the existing keyed rendering contract.

### Creation and mounting are separate stages

The runtime recognizes part descriptors while constructing a host VNode, before create-hook or
host-override decisions can discard or replace their identity. It extracts the descriptor into
`componentPart` and retains the ordinary ref callbacks for the target to execute at mount.

Preserve the existing part behavior: the host VNode is raw, carries original component props as
part state, bypasses create hooks and host-tag overrides, and still passes through the existing
render hooks. This is a compatibility decision for the new syntax; ordinary unmarked JSX keeps its
current behavior. Both `h` and automatic JSX must reach the same normalization path.

A binding introduces no wrapper element, function component execution, observation instance or
extra lifecycle scope. Existing themes, style-option carriers and shadows continue to see the
same part identity and original props.

The target executes ordinary ref callbacks in their normalized order at its existing ref mount
point. Each callback receives the host node and may return a synchronous cleanup. Release returned
cleanups in reverse order, once per binding occurrence. If a later callback throws, release the
cleanups already obtained before propagating the mount failure. A cleanup failure must not prevent
other acquired cleanups from being attempted; final error reporting should follow the renderer's
existing failure conventions. This design does not promise layout or paint readiness at ref time.

Ref-array normalization and cleanup ownership must have one implementation owner. The core owns
composition and part identity; target strategies supply the host handle. The Web adapter should not
maintain a second array walker with different rules.

### Static HTML

Static output reads the part descriptor and applies existing identity-based rendering and styling.
It omits `ref` from HTML and never invokes node callbacks or their cleanup functions. The descriptor
must therefore be interpreted before HTML serialization, rather than by a DOM mount callback.

This extends the current callback-only ref meaning with a creation-time identity binding. Callback
refs retain their mount-only behavior. It does not turn ref into a value store or provide access to
control values during parent setup; the separate [value-binding proposal](2026-10-20-value-bindings.md)
continues to own that question.

## TypeScript and platform boundaries

Native JSX tags determine host attributes and node types. No part API infers all legal attributes
from a polymorphic `as` prop. Required type acceptance includes contextual typing inside composed
refs:

```tsx
<input
  ref={[
    ctx.parts.control,
    (element) => {
      // The Web type surface should infer HTMLInputElement here.
      element.select();
    },
  ]}
/>
```

Current intrinsic JSX props use an open string index and do not provide this precise host typing.
That example is an acceptance target, not a claim about current inference. Readonly and nested
arrays, optional forwarded refs, invalid callback node types and callback cleanup returns all need
compiler cases before the ref type is finalized. Part bindings must not widen callback inference to
`any` or make incompatible node callbacks valid.

Core binding and callback types remain generic over the target's node handle. DOM node types and
HTML/SVG mappings belong to the explicit Web type surface. Changing ref typing must not import DOM
types into the MeowJSX root. The exact Web typing entry and public type names remain open.

Ordinary component functions should be accepted as JSX tags with a required, typed context. Current
`Component` and `JSX.ElementType` types do not support that signature together. Resolve their
compatibility in the type prototype; do not require every author to add an optional-context guard
or use `any`. Direct function invocation does not create a renderer-owned mount and does not gain
an implicit context through this design.

## Contracts and component forwarding

Component identity, finite part names, style-option axes, defaults and carrier parts remain
available before mounting. CSS assembly, selectors and documentation use that information without
executing components. The initial implementation can retain existing contract objects and attach
them to ordinary functions. Removing repeated generic arguments is part of the authoring goal;
automatically generating contracts is not required for ref bindings.

The exact typed association between an ordinary function, its contract and `ctx.parts` remains to
be prototyped. A renamed or minified JavaScript function name is not a stable contract identity.

A ref passed to a function component remains a component prop. Core does not search the component's
output for a first element or automatically choose a node from multi-root output. Components
explicitly forward refs to their intended host node and compose them with local bindings. The
initial migration must audit wrappers that currently assume `props.ref` is a callable function;
those wrappers must accept and forward composed refs too.

Registration, theme assembly and CSS installation retain their existing owners. Attaching a
contract to a function does not register it or install styles.

### Themes address parts through the same descriptors

The descriptors are defined with the contract, before any mount, and `ctx.parts` is that same
object. A theme therefore addresses a part by interpolating its descriptor, and `partSelector` is
not needed:

```ts
// Working names: the contract exposes its part descriptors.
export const cardStyles = css`
  ${cardContract.parts.root} {
    ${ui.cx(ui.p.panel, ui.bg.raised)}
  }
`;
```

The `css` template in `meowcss/meowjsx` recognizes a part descriptor through a MeowJSX guard and
emits the part selector (`:where([data-meowui-part="card/root"])`) and the contract dependency that
`defineTheme` uses for carrier inference. The MeowJSX core gains no CSS text; the selector form stays
owned by the adapter, as it is today. Styles themselves stay independent of parts: the descriptor
is where a theme associates a style with a part, as the
[utility styles design](2026-10-24-utility-styles.md) describes.

## Breaking changes

The new surface replaces the old one; there are no aliases, shims or deprecation period. Every
in-repository component, theme, story and app migrates before the release that ships it, and each
affected package takes a breaking version bump under the [release contract](../releasing.md).

- `context.part(name, tag, props, ...children)` is removed. Parts are bound with `ref={ctx.parts.x}`.
- `defineComponent` with repeated name and part generics is removed. Components are ordinary
  functions with an attached contract; the exact attachment API comes from the type prototype.
- `partSelector(contract, part)` is removed from `meowcss/meowjsx`. Themes interpolate the part
  descriptor directly, as above. The same applies to `ScopedTokens.at`, which takes a descriptor.
- `ComponentContract.parts` changes from an array of names to the descriptor record. Code that reads
  it as an array (`contract.parts.includes(...)`) breaks; the finite names stay available from the
  record's keys.
- `props.ref` on a component may be a composed array, not only a callback. Wrappers that call it as
  a function break and must forward it instead.

Unchanged: part identity on the VNode (`componentPart`), the `data-meowui-part` marker and its
values, option attributes, `defineOptions`, `defineStyleProps` and the style-props plugin's behavior.

## Alternatives considered

| Candidate                                        | Decision and reason                                                                                                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `<section {...p.root}>`                          | Drop. Identity should not look like a bag of ordinary props or depend on spread ordering.                                           |
| `<section parts={p.root}>`                       | Feasible alternative. Separate identity and callbacks clearly, but composable ref bindings provide the selected common entry point. |
| `<section as={p.root}>`                          | Drop. Overloads host selection and native HTML `as` with identity binding.                                                          |
| `<p.root as="section">`                          | Drop as the primary surface. Polymorphic props, events and ref inference add TypeScript work that native tags avoid.                |
| `const Root = p.root("section"); <Root />`       | Drop from the initial API. Adds per-part declarations and another JSX tag protocol without being needed for ref composition.        |
| `p.root.withRef(callback)`                       | Drop. Ref composition belongs to the general ref protocol rather than each kind of binding.                                         |
| A part callback that adds attributes after mount | Drop. Too late for static output, creation hooks, style resolution and host overrides.                                              |

The independent syntax challenge identified native ref coexistence, static identity extraction,
extra component observation layers and polymorphic typing as the consequential boundaries. The
selected direction addresses coexistence through ref arrays and identity through VNode creation.
Failure cleanup and contextual typing still need the implementation checks below.

## Implementation and verification

1. Prototype the public types for ordinary functions, finite `ctx.parts` names and composed refs.
   Compile inline callbacks, nested readonly arrays, forwarded refs and wrong-node cases. Check the
   DOM-free core environment independently from Web typing. Stop and revise the type surface if
   basic examples require casts or lose callback inference.
2. Add host-VNode normalization shared by `h` and automatic JSX. Verify part identity, original
   props, raw behavior, static HTML, style-option Signals and component forwarding through existing
   public consumers. Preserve callbacks for actual mounting and omit binding objects from host
   attributes and serialized output.
3. Implement callback composition at the renderer/target seam. Verify call order, reverse cleanup,
   partial mount failure, cleanup failure, per-node reuse and unmount without duplicate cleanup.
4. Migrate representative components: `Alert` for multiple parts, `Popover` for refs and cleanup,
   `Accordion` for repeated parts, and a host-forwarding control. Verify keyboard behavior, focus and
   drafts in the relevant real scenarios; unchanged observation depth and shadow behavior need
   focused contract checks.
5. Teach the `meowcss/meowjsx` `css` template and `defineTheme` to accept part descriptors, then
   migrate every `partSelector` call and remove it. Confirm the generated `cssText` is unchanged.
6. Update component authoring guidance, migrate the remaining components and wrappers, and remove
   `context.part` and the old `defineComponent` form in the same release. There is no compatibility
   period.

Use [development checks](../development-checks.md) for commands and coverage. No runtime, type,
browser or installed-package acceptance is established by this design-only change.
