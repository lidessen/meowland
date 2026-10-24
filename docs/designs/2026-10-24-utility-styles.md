# Utility styles from a finite token catalog

Status: proposed direction, pending an independent challenge, implementation and type validation.
It builds on the [parts and ref-binding design](2026-10-24-component-parts-ref-bindings.md). No
current export changes with this document; the examples below describe the target API, and every
name in them (`sx`, `apply`, `defineUtilities`) is a working name until the naming pass.

Hosts, stories and theme files get one short, typed vocabulary for single-purpose styles. The
vocabulary is the token tree that already exists, so a utility can only say what the design system
can say:

```tsx
// Host or story composition. Every value is a token role, never a literal.
<Stack sx={{ gap: "section", p: "panel", bg: "raised", radius: "xl" }}>
  <p sx={{ text: "caption", wide: { text: "body" } }}>Receipt</p>
</Stack>

// A component instance: flat keys reach the root part, `parts` reaches named parts.
<Alert tone="warning" sx={{ mt: "section", parts: { title: { text: "label" } } }} />
```

The same vocabulary works inside a theme file, where it expands to declarations instead of classes:

```ts
export const calloutStyles = css`
  ${partSelector(calloutContract, "root")} {
    ${ui.apply({ display: "grid", gap: "group", p: "group", text: "body", bg: "fill", radius: "lg" })}
  }
`;
```

## Why change the current styling surface

Today a single-purpose style has three routes, and none of them is short:

- An inline `style` object. There are 149 `style={{ … }}` sites across stories, examples and apps.
  They write literals (`fontSize: "25px"`, `borderRadius: "18px"`), which the theme audit never
  sees, and cannot express hover, focus or a breakpoint.
- A host stylesheet with ad hoc class names, as in the docs app (`docs-note`, `docs-example-head`).
  Each class restates a property and a token by hand.
- A theme rule. That is right for a component's look, but too heavy for "this story row needs a
  section gap", and every rule repeats `property: ${uiTokens.group.key}` pairs.

[`recipes.ts`](../../packages/meowtail/src/theme/recipes.ts) already says it carries the system's
rules "the way a utility class carries a scale", but only for four role-level recipes and only inside
theme files. Layout primitives cover gap and structure; they do not cover padding, margin, surface,
ink, radius or type on an arbitrary node.

## The observation that makes this cheap

Tailwind scans source text because its scale is open: any class string could appear. MeowCSS has a
closed scale. Token groups, option axes and recipe roles are finite and known when the theme is
assembled, so the full utility sheet is a pure function of the catalog:

```
sheet = Σ utility × value in its scale × condition it allows
```

That gives every property the root package already promises: generation is deterministic, DOM-free
and JSX-free; there is no source scanner, no build plugin and no runtime style injection; static
HTML and Web mounting emit the same class names; and delivery stays explicit through
`theme.cssText`.

## Ownership

| Layer             | Owns                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `meowcss` root    | `defineUtilities`: the mechanism that turns a catalog into `apply(spec)` fragments, class names and `cssText`. No concrete scale, no DOM, no JSX.                  |
| `meowcss/meowjsx` | The `sx` prop: a render-hook plugin that resolves `sx` on host nodes and on part nodes, merges classes and follows Signals. Type helpers for part-addressed specs. |
| Meowtail          | The concrete catalog `ui` over `uiTokens`, its conditions and its inclusion in `standardTheme`. Recipes become catalog entries.                                    |
| Hosts and stories | Composition only. They use `sx` for placement and local adjustments; they do not rebuild a component's look from utilities.                                        |

This matches the existing split: MeowCSS is the generation mechanism, Meowtail owns concrete values.

## Defining a catalog (root mechanism)

A catalog names its utilities, the scale each one accepts and the conditions it may appear under.
Three kinds of utility cover the current needs:

```ts
import { defineUtilities } from "meowcss";

export const ui = defineUtilities("ui", {
  conditions: {
    hover: "&:hover",
    focusVisible: "&:focus-visible",
    wide: "@media (min-width: 768px)",
  },
  utilities: {
    // Property utility: one or more properties over one token group.
    p: { properties: ["padding"], values: uiTokens.space },
    px: { properties: ["padding-inline"], values: uiTokens.space },
    gap: { properties: ["gap"], values: uiTokens.space },
    bg: { properties: ["background"], values: uiTokens.surface, conditions: ["hover"] },
    ink: { properties: ["color"], values: uiTokens.ink },
    radius: { properties: ["border-radius"], values: uiTokens.radius },
    // Keyword utility: a finite set of CSS keywords, not lengths or colors.
    display: {
      properties: ["display"],
      values: { block: "block", flex: "flex", grid: "grid", none: "none" },
    },
    // Recipe utility: each value is a whole fragment.
    text: { recipe: { caption: text("caption"), body: text("body"), label: text("label") } },
    surface: { recipe: { raised: surface("raised"), fill: surface("fill") } },
  },
});
```

Rules the mechanism enforces at definition time:

- Values come from a `TokenRefs` group, a keyword map or recipe fragments. There is no arbitrary
  value form. A one-off measurement keeps using `style`, and an instance measurement the theme reads
  back keeps using a `tokenRef` custom property, as `tabsCount` does today.
- Names are identifiers (the same `segment` rule as tokens and options). Utility names, value keys
  and condition names cannot collide inside one catalog.
- A utility lists the conditions it allows. The default is no conditions, so the sheet grows only
  where a condition is meaningful (`bg` on hover, layout on a breakpoint).
- The catalog sheet is checked by the consumer's audit rules. Meowtail runs `standardAuditRules` over
  `ui.cssText()`, so a catalog cannot smuggle a literal color or size past the audit.

## What a catalog produces

### Class names and the sheet

Each (utility, value, condition) triple has one readable class: `ui-p-group`, `ui-bg-raised`,
`ui-hover:bg-fill` (escaped as `.ui-hover\:bg-fill` in the sheet). Names are stable across builds
and runtimes because they derive from catalog keys, not hashes, so static HTML and a later Web mount
agree.

```css
.ui-p-group {
  padding: var(--ui-space-group);
}
.ui-hover\:bg-fill:hover {
  background: var(--ui-surface-fill);
}
@media (min-width: 768px) {
  .ui-wide\:text-body {
    /* the body recipe */
  }
}
```

### Cascade

Part rules in themes are written inside `:where(...)`, so most have zero specificity. A utility class
is `0,1,0`, and the sheet is appended after every theme fragment, unlayered. An instance utility
therefore wins over the theme's paint of the same property, which is the point of an instance
adjustment. A conditioned utility (`.x:hover`, or a utility inside `@media`) is emitted after the
unconditioned ones, so it wins its condition. Shorthands are emitted before longhands (`p` before
`px`), so `{ p: "panel", px: "group" }` means what it reads as. Cascade layers are not introduced:
the existing theme CSS is unlayered, and an unlayered theme would beat a layered utility sheet.

### `apply`: the same vocabulary inside a theme

`ui.apply(spec)` returns a `CSSFragment` of declarations, with allowed conditions expanded as nested
rules (`&:hover { … }`, `@media … { … }`), the same nesting `options.when` already relies on. It is
the `@apply` of this system and the successor to the recipe functions: `surface("raised")` becomes
`ui.apply({ surface: "raised" })`, and a theme rule stops restating property and token pairs.
Geometry that belongs to one part (an optical offset, a fixed 24px header) stays a literal beside
the part, exactly as the current authoring rules say.

## The `sx` prop and parts

### Host nodes

On an ordinary host node, `sx` is a flat spec. A render-hook plugin from `meowcss/meowjsx` (an
extension of, or a sibling to, `createStylePropsPlugin`) removes `sx` from the props, resolves it to
class names through the registered catalog and merges them with the node's `className`. Values may
be Signals, per key:

```tsx
<div sx={{ bg: mapSignal(selected, (on) => (on ? "selected" : "raised")) }} />
```

The plugin then binds a derived class Signal, so a change updates `class` without re-running setup,
consistent with the component model. Unknown utilities, values or conditions throw before mount,
like an invalid style option does today.

### Component instances: flat keys reach the root, `parts` reaches named parts

The ref-binding design keeps the component's original props on every part node as
`componentPart.state`. That is exactly the channel `sx` needs, and it needs no component code:

- On a part node, the plugin reads `sx` from `componentPart.state`, never from the node's own props.
  Flat keys apply when the part is `root`; `sx.parts[part]` applies to that part.
- The plugin strips `sx` from every part node's props. A component that spreads `...props` onto its
  root therefore never double-applies or leaks an `sx` attribute.
- Part keys are checked against the contract's finite part names, at the type level through the
  contract and at runtime before mount.

```tsx
<Alert sx={{ mt: "section", parts: { title: { text: "label" }, body: { ink: "secondary" } } }} />
```

This is the sanctioned replacement for the descendant selector the authoring rules forbid ("do not
reach into another component with a descendant class or tag selector"): a caller addresses a part
by its public name, the same name the theme uses, and the component keeps its contract.

Constraints carried over from the ref-binding design:

- A host node carries at most one part identity, so a node receives at most one component's `sx`.
- A component that delegates its root to another component (rather than a host node bound to its
  own `root` part) does not get flat `sx` applied automatically. Its `sx` would arrive at the inner
  component as an ordinary prop, typed for the wrong contract. The ref-forwarding audit in that
  design must also cover `sx`: such wrappers either bind their own root part or translate `sx`
  explicitly.
- `sx` on a part is per instance. It does not change the component's options, its defaults or the
  carrier the theme uses for option attributes.

### What `sx` is not for

The Meowtail rule stays: a component looks finished without a host class, and its look lives in the
theme. Meowtail components never use `sx` on their own parts. `sx` is for hosts, stories, examples
and apps: placement (margin, width, grid placement), spacing, and local adjustments within the
design system's roles. A story that rebuilds a card from `bg`, `radius` and `p` utilities is a sign
the card is missing an option, and the review should treat it that way.

## Types

The catalog is typed from its definition: `Spec<typeof ui>` maps each utility to the union of its
scale's keys, each allowed condition to a nested spec, and each key to `MaybeSignal<value>`.
`PartSpec<typeof ui, typeof alertContract>` adds a `parts` key over the contract's part union.

Two type surfaces are open, and both depend on the type prototype in the ref-binding design:

- Host nodes need `sx` on intrinsic element props. Today `Props` and `IntrinsicElements` are open
  string-index aliases in the MeowJSX root, so `sx` compiles but is untyped. The typed version needs
  an augmentable registration point (an interface the adapter can merge, such as
  `interface UtilityRegister { catalog: typeof ui }`) in the explicit Web type surface, without
  importing MeowCSS into the MeowJSX root.
- Components need `sx` in their props from the contract. A mixin like the existing `ThemedProps`
  (`SxProps<typeof contract>`) works without registration; deriving it automatically from the
  attached contract belongs with the `ctx.parts` typing work.

## Delivery and size

`defineTheme` gains an optional `utilities` field; the catalog's sheet is appended after all
fragments in `cssText`. `standardTheme` includes `ui`. Nothing installs on import, and
`mountStyles` / `Theme` / static HTML keep their current ownership.

The full sheet is bounded by the catalog, but conditions multiply it. Two controls keep it small:

- Per-utility condition lists (above), and a budget test on `ui.cssText().length` in Meowtail, so a
  new condition or a broad recipe is a visible review decision.
- An optional collector for static builds: the plugin records every class it resolves into a
  caller-owned set, and `ui.cssText({ only })` emits that subset. A static site (Meowpress, the docs
  app) renders, then emits only what it used. A dynamic app keeps the full sheet. Pruning is an
  optimisation, never required for correctness.

## What this design does not do

- No class-string parsing (`class="p-group bg-raised"`) and no source scanning.
- No arbitrary values in utilities; `style` stays the escape for instance measurements.
- No runtime style injection; the sheet travels in `theme.cssText`.
- No new component or layout system; `Stack`, `Inline` and `Grid` keep owning structure and `gap`.
- No change to option attributes, part markers or the theme's paint of parts.

## Alternatives considered

| Candidate                                        | Decision and reason                                                                                                                                |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tailwind itself, or class strings with a scanner | Drop. Needs a build scanner, has an open scale that bypasses `uiTokens` and the audit, and the authoring rules already exclude Tailwind utilities. |
| Class strings checked by template-literal types  | Defer. Possible as sugar over the same catalog, but large unions slow the checker, and a string cannot carry a Signal per key.                     |
| Atomic CSS-in-JS with runtime injection          | Drop. Breaks explicit delivery and static HTML parity, and needs a DOM in the generation path.                                                     |
| A `parts` prop with per-part class names         | Drop. Re-opens the prop the ref-binding design declined, and class names lose the token typing.                                                    |
| Utilities only in themes (`apply`), no `sx`      | Keep as the first step, not the whole design. It fixes theme verbosity but leaves the 149 inline style sites as they are.                          |
| `sx` read from the part node's own props         | Drop. Every component would have to forward `sx` to the right node, and a `...props` spread on the root would apply it twice.                      |

## Open questions

- Naming: `sx`, `apply` and `defineUtilities` need the concept-naming pass. `sx` reads as a React
  library convention and may not be the best fit.
- Condition kinds: media queries are simple, but Meowtail components often live inside a host
  layout; container conditions need a declared container ancestor. Decide per catalog.
- Option and part-state conditions: `sx` keyed by a component option (`when tone is accent`) or by
  an ancestor part's state (Tailwind's `group-hover`) would multiply the sheet per contract. If
  needed, scope them to explicitly declared pairs rather than every contract.
- Whether Meowtail's own story and gallery chrome migrates to `sx`, and which inline `style` sites
  are instance measurements that should stay.

## Implementation and verification

1. Root mechanism: `defineUtilities`, `apply`, class naming and `cssText`, with unit tests for
   determinism, collisions, condition expansion, emission order and invalid specs. Keep it inside
   the DOM-free core typecheck.
2. Meowtail catalog `ui` over `uiTokens`; express the four recipes as catalog entries and keep the
   recipe functions as thin aliases. Audit `ui.cssText()` with `standardAuditRules` and add the size
   budget test.
3. Theme migration sample: rewrite a few theme files with `apply` and compare generated `cssText`
   for unchanged computed styles.
4. `sx` plugin in `meowcss/meowjsx`: host nodes, Signals, `className` merge, part `state` reading,
   `parts` addressing and stripping. Verify static HTML and Web mounting produce the same classes.
   This step depends on the ref-binding normalization (step 2 of that design) for part nodes.
5. Types: catalog spec types first; the intrinsic `sx` registration lands with the Web typing entry
   from the ref-binding prototype. Add compiler cases for wrong values, unknown parts and Signals.
6. Migrate representative inline styles (the layout story, the `sunshine-welcome` example) and look
   at them in Meowbook in both schemes and at narrow width.

Use [development checks](../development-checks.md) for commands and coverage. No runtime, type,
browser or installed-package acceptance is established by this design-only change.
