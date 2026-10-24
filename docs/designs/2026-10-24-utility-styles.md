# Utility styles as functions

Status: proposed direction, pending implementation. No current export changes with this document;
names are working names.

MeowCSS is JavaScript, so a utility does not need a class-string language or a generated catalog.
A utility is a function that takes a token key and returns a `CSSFragment`. A style is a value
composed from those fragments. Styles know nothing about component parts; a part, or any node, is
associated with a style where it is used.

## Utilities are functions

```ts
import { css } from "meowcss";
import { p, gap, bg, ink, radius, text, hover, wide } from "meowtail/theme";

const card = css`
  ${p("panel")} ${bg("raised")} ${radius("xl")}
  ${hover(bg("fill"))}
  ${wide(p("section"))}
`;
```

The same values compose without a template where that reads better:

```ts
const card = style(p("panel"), bg("raised"), radius("xl"), hover(bg("fill")));
const compactCard = style(card, p("group"));
```

- `meowcss` provides the mechanism: `utility(properties, scale)` builds a typed function from one
  token group (or a finite keyword map), and `condition(wrapper)` builds a wrapper such as `hover` or
  `wide` that nests a fragment under `&:hover` or a media query. `style(...fragments)` concatenates.
  No DOM, no JSX, no scanning.
- Meowtail owns the concrete set over `uiTokens` (`p`, `px`, `gap`, `bg`, `ink`, `radius`, …) and
  its conditions. The existing recipes (`surface`, `text`, `interactive`, `focusRing`) are already
  this shape and join the set unchanged.
- Arguments are typed from the scale: `p("group")` compiles, `p("13px")` does not. A function may
  take more than a key when the value really is a parameter, such as `columns(3)`. A one-off literal
  stays a plain declaration beside its selector, where the audit still sees it.

## Associating styles where they are used

A style is not tied to a part. The association is made by whoever uses it.

In a theme, a part selector takes a style. This already works with today's `css` template; only the
utilities are new:

```ts
export const cardStyles = css`
  ${partSelector(cardContract, "root")} {
    ${card}
  }
  ${partSelector(cardContract, "header")} {
    ${style(text("title"), gap("group"))}
  }
`;
```

On an instance, a host attaches a style as a class. `classOf(style)` returns a deterministic class
name derived from the fragment text, so static HTML and Web mounting agree:

```tsx
<Card className={classOf(style(p("group"), bg("fill")))} />
<div className={classOf(card)} />
```

The class needs its rule in the sheet. Delivery stays explicit: the host lists the styles it uses as
classes, `sheet(card, …)`, and passes that fragment to `defineTheme` with its other styles, the same
way the docs app passes `docsStyles` today. A utility's scale is finite, so `sheet(p, bg)` can also
emit every value of those utilities for hosts that want ad hoc atoms without listing each style.

Component contracts, part markers, option attributes and the theme's paint of parts stay as they
are. Meowtail components keep their look in theme files; a host class remains a local adjustment,
not the component's look.

## Open questions

- Whether `classOf` should also accept the fragment directly in `className` (a fragment as a class
  value), or stay an explicit call.
- Condition kinds: media queries, or container queries for components embedded in host layouts.
- Whether the docs app, stories and examples migrate their inline `style` objects and ad hoc classes
  to utilities, and which inline styles are instance measurements that should stay.

## Implementation and verification

1. `utility`, `condition`, `style`, `classOf` and `sheet` in the `meowcss` root, with unit tests for
   determinism, condition nesting and type cases for invalid keys, inside the DOM-free core check.
2. Meowtail's utility set over `uiTokens`; audit the output of `sheet(...)` for every utility with
   `standardAuditRules`.
3. Rewrite a few theme files with utilities and confirm the generated `cssText` gives unchanged
   computed styles; migrate a story with inline styles and look at it in Meowbook.

Use [development checks](../development-checks.md) for commands and coverage.
