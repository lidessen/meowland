# Utility classes as values

Status: selected direction, not implemented. This is a breaking change with no compatibility layer
for the old styling surface; see [Breaking changes](#breaking-changes). Names are working names.

MeowCSS is JavaScript, so a utility does not need a class-string language. Utilities live on one
namespace object, `ui`, built from the token scales: `ui.p.group` is a class, a value that a
component's `className` takes directly and that a theme rule can expand into declarations.
Conditions and composition are higher-order classes: functions from classes to classes. Classes know
nothing about component parts; a part, or any node, is associated with a class where it is used.

```tsx
<Card className={[ui.p.group, ui.bg.fill]} />
<div className={[ui.p.panel, ui.radius.xl, ui.hover(ui.bg.fill), ui.wide(ui.p.section)]} />
```

## Classes

`ui.p.group` is a `UtilityClass`:

- its class name, `ui-p-group`, derived from the utility and the key, so static HTML and Web
  mounting agree and the name reads in devtools;
- its declarations, `padding: var(--ui-space-group);`.

Typing `ui.` lists every utility and `ui.p.` every value of that scale. Every scale is finite (one
token group or a finite keyword map), so the namespace is a frozen plain object built once when it is
defined; no Proxy, and the types are the exact keys. `ui.p.group` exists, `ui.p.13px` does not. A
one-off literal is not a class; it stays a declaration beside its selector, where the audit sees it.

Keys are the token roles, not a numeric scale. `ui.p.group` reads as the spacing within a group,
the same name as `uiTokens.space.group`, so the class vocabulary and the token tree stay one system.

`String(ui.p.group)` is the class name, so the existing `className` path (which stringifies the
value) already accepts a single class or a Signal of one:

```tsx
<div className={mapSignal(selected, (on) => (on ? ui.bg.selected : ui.bg.raised))} />
```

## Higher-order classes

A higher-order class takes classes and returns a class.

- Conditions: `ui.hover(ui.bg.fill)` is the class `ui-hover:bg-fill`, whose rule is
  `.ui-hover\:bg-fill:hover { … }`. `ui.wide(ui.p.section)` nests the rule in the catalog's media
  query. Conditions compose: `ui.wide(ui.hover(ui.bg.fill))`.
- Composition: `ui.cx(ui.p.panel, ui.bg.raised, ui.radius.xl)` is one value holding those atoms.
  Its class name is the atoms' names joined, so it introduces no new rule. A named style is just a
  constant, `const card = ui.cx(...)`, and `ui.cx(card, ui.p.group)` overrides by order (a later
  atom of the same utility replaces the earlier one).
- `className` arrays: MeowJSX normalizes an array (nested, with `false`, `null` and `undefined`
  ignored) into a class list, so `className={[card, active && ui.bg.selected]}` works for plain
  strings too. This is the one renderer change; it belongs in the core prop normalization so static
  HTML and Web agree.

Because every composite is a list of atoms and every scale is finite, the CSS needed for any class
anyone can write is the atom sheet: each utility × its keys × the conditions it allows. There is no
per-style registration, hashing or scanning.

## Classes in themes

Interpolating a class into a rule body expands its declarations; conditions expand to nested rules.
`css` recognizes a class value (by its own marker, not by `toString`):

```ts
export const cardStyles = css`
  ${cardContract.parts.root} {
    ${ui.cx(ui.p.panel, ui.bg.raised, ui.radius.xl, ui.hover(ui.bg.fill))}
  }
`;
```

The association between a part and a style is made here, by the theme. The part descriptor comes
from the [parts design](2026-10-24-component-parts-ref-bindings.md), which replaces `partSelector`.
The existing recipes (`surface`, `text`, `interactive`, `focusRing`) are replaced by utilities of
the same kind: `ui.text.caption` works in a theme rule and in `className`.

## Ownership and delivery

- `meowcss` root: `defineUtilities(namespace, { utilities, conditions })`, which builds the
  namespace object with its class values, condition functions and `cx`; the `css` expansion of class
  values; and the atom sheet of a namespace. No DOM, no JSX.
- MeowJSX: `className` array normalization only.
- Meowtail: the `ui` namespace over `uiTokens` and its allowed conditions, and its atom sheet
  appended last in `standardTheme.cssText`, after the component fragments. A utility class is
  `0,1,0` and the theme's part rules are `:where(...)`, so an instance class wins over the theme's
  paint of the same property; a conditioned class is emitted after the plain ones.
- The atom sheet is audited with `standardAuditRules`, and a size budget test keeps conditions a
  deliberate choice per utility.

Part markers and option attributes do not change. A Meowtail component keeps its look in its theme
file and forwards a host `className` on its root; a host class is a local adjustment, not the
component's look.

## Breaking changes

The new surface replaces the old one; there are no aliases, shims or deprecation period. Callers
migrate in the change that lands each step, and each affected package takes a breaking version
bump under the [release contract](../releasing.md).

- The recipe functions `surface`, `text`, `interactive` and `focusRing`, and their types
  `SurfaceRung`, `TextRole` and `InteractiveOptions`, are removed from `meowtail/theme`. Their uses
  in Meowtail themes, the docs app, Meowbook and stories move to `ui` classes. Parameterized recipes
  (`focusRing({ inset })`, `interactive({ on, pressed })`) become finite keys or conditions on `ui`;
  the exact mapping is decided in implementation.
- `className` changes meaning for arrays: an array is a class list, not a value stringified with
  commas. A host that relied on the old stringification breaks.
- Hosts and stories that paint with inline `style` objects or ad hoc classes restating tokens are
  expected to move to `ui` classes; inline `style` stays only for instance measurements.

Unchanged: `uiTokens` and every token name, the `css` template, `defineOptions`,
`defineStyleProps`, part markers and option attributes. Contract and `partSelector` changes belong to
the [parts design](2026-10-24-component-parts-ref-bindings.md#breaking-changes).

## A Tailwind-style export later

A separate export can offer a Tailwind-like surface (for example `tw.p1` or `` tw.p`32px` ``) on top
of the same mechanism, without changing `ui`. Numeric keys can map onto the same atoms or a scale of
their own. Arbitrary values are the part that needs its own design: they are not finite, so they
cannot come from the atom sheet and need their own delivery (collected at render and emitted, or
generated at build) and their own audit policy. `ui` stays token-only.

## Open questions

- Condition kinds: media queries, or container queries for components embedded in host layouts.
- Which inline `style` objects in stories and examples become classes, and which are instance
  measurements that stay.

## Implementation and verification

1. `defineUtilities`, class values, conditions, `cx`, `css` expansion and the atom sheet in the
   `meowcss` root: tests for names, determinism, override order, condition nesting, and type cases
   for unknown keys, inside the DOM-free core check.
2. `className` array normalization in MeowJSX, checked through static HTML and Web mounting.
3. Meowtail's `ui` over `uiTokens`; audit and budget the atom sheet; rewrite a few theme files and
   confirm unchanged computed styles; migrate a story and look at it in Meowbook.

Use [development checks](../development-checks.md) for commands and coverage.
