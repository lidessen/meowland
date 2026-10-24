# Utility classes as values

Status: implemented and locally accepted on 2026-10-24; see the
[implementation receipt](../records/2026-10-24-authoring-migration.md). This is a breaking change
with no compatibility layer for the old recipe surface. Published packages retain the previous APIs
until a separately authorized release.

The authoring surface is `cx` plus theme values:

```tsx
import { cx } from "meowcss";
import { ui } from "meowtail/theme";

<Card className={cx(ui.p.group, ui.bg.fill)} />
<div className={cx(ui.p.panel, ui.radius.xl, ui.text.caption)} />
```

`cx` is a public composition utility. `ui` is Meowtail's built-in theme catalog, with typed names
for its spacing, colors, typography and other styles. MeowCSS knows nothing about those names or
the Meowtail scale. Another theme can supply its own catalog and stylesheet using the same class
values and the same `cx`.

## Class values and cx

A class value carries a stable CSS class name and its declarations. For example, `ui.p.group`
carries `ui-p-group` and `padding: var(--ui-space-group);`. `String(ui.p.group)` returns the class
name. Editors complete the keys of the theme's ordinary typed object.

`cx` combines class values and plain class strings, ignores `false`, `null` and `undefined`, and
returns a reusable class value:

```tsx
const panel = cx(ui.p.panel, ui.bg.raised, ui.radius.xl);

<div className={cx("host-panel", panel)} />
<div className={mapSignal(selected, (on) => cx(panel, on && "is-selected"))} />
```

`cx` joins classes; it does not parse class names or resolve CSS conflicts. Stylesheet order and
the CSS cascade decide overlapping properties, as with Tailwind classes. Argument order is not an
override API. Composed values keep their declarations so they can also be used in a theme rule.

MeowJSX also accepts `className={[ui.p.panel, ui.bg.raised]}` for class-list composition, including
nested lists and Signals. Use `cx` when a reusable composed value must retain declarations for a
theme rule. Conditional selection uses JavaScript as above. Hover, focus, disabled and responsive
rules remain CSS in the theme, where existing options and component parts already apply.

## The same values in theme rules

The `css` template expands class values into declarations instead of their class-name string:

```ts
import { cx } from "meowcss";
import { css, parts } from "meowcss/meowjsx";
import type { Card } from "../../components/card";
import { ui } from "../utilities";

const card = parts<typeof Card>("card");

export const cardStyles = css`
  ${card.root} {
    ${cx(ui.p.panel, ui.bg.raised, ui.radius.xl)}
  }
`;
```

Within one composite, values from the same catalog expand in that catalog's stylesheet order.
Separate interpolations and handwritten CSS retain ordinary CSS order. Plain class strings have no
declarations to expand; interpolating a composite containing one as declarations is an error.

Parts stay independent of styles. The [parts design](2026-10-24-component-parts-ref-bindings.md)
provides the descriptor; the theme associates it with styles here.

## Ownership and delivery

MeowCSS owns `cx`, the shared class-value contract and expansion in `css`. MeowJSX owns class-list
normalization, including stringifiable values and Signals, shared by Web mounting and static HTML.
It needs no knowledge of MeowCSS or `ui`.

Meowtail owns the built-in `ui` values and their rules over the existing `uiTokens`. The catalog
lives in a small module independent of components, registration and complete theme assembly;
`meowtail/theme` exports it. Its stylesheet is an ordinary shared fragment delivered with the
standard theme. Extended and presentation themes reuse that fragment once, after their component
rules. There is no source scanning or per-render style registration.

The catalog uses the existing audit. Part descriptors keep their `:where(...)` selectors; complete
rules, instance classes and inline styles follow the ordinary CSS cascade. This change does not
introduce cascade layers or require a separate rewrite of every theme selector.

## Migration and verification

This replaces `surface`, `text`, `interactive` and `focusRing`, and their public recipe types,
without aliases. Their finite styles become values such as `ui.surface.raised` and `ui.text.caption`;
existing interaction and reduced-motion behavior stays in those styles. One-off geometry stays in
owned CSS, and instance measurements can stay inline. Tokens, options and part markers keep their
existing names. Affected packages take breaking versions under the [release contract](../releasing.md).

Implement and check the class values and `cx` in the DOM-free MeowCSS root first. Verify conditional
inputs, reusable composites, deterministic names and ordering, and declaration expansion. Then
check class values, nested lists and Signals through static HTML and Web mounting. Migrate representative
theme rules and a story, checking default styles, instance overrides and stylesheet delivery through
standard, extended and presentation themes before completing the migration. Follow
[development checks](../development-checks.md) for commands and coverage.
