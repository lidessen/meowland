# MeowCSS

A generic TypeScript token, options and CSS generation mechanism. The root entry does not depend on JSX, UI or the DOM; component adapters are imported from
`meowcss/meowjsx`, and DOM theme lifecycle from `meowcss/web`.

MeowUI owns concrete token values, component parts, standard themes and semantic layout. MeowCSS does not provide another component or layout system.

## Pure CSS consumption

The root entry can be used in build programs without a DOM, MeowJSX or MeowUI. Templates keep native CSS, and type checking covers
token paths, options and complete default values; it does not promise to validate every CSS property or arbitrary template text.

```ts
import { css, defineOptions, defineTokens, defineTheme, themeAttributes } from "meowcss";

const options = defineOptions("reader", {});
const tokens = defineTokens("reader", { ink: ["black", "white"] });
const theme = defineTheme({
  options,
  defaults: { scheme: "auto" },
  tokens: [tokens],
  styles: css`
    body {
      color: ${tokens.ink};
    }
  `,
});
// The build program delivers theme.cssText; a static HTML root uses themeAttributes(theme).
```

The root `defineTheme` only understands explicit selector/source bindings. If tokens depend on component options, pure CSS consumers specify
the options and the carrier selector through `sources`; local constants can be written as `{ at: ".control", values: tokens }`.
It does not guess components from CSS text and does not install styles.

## JSX component adapters

Consuming components requires a compatible `meowjsx` install. `meowcss/meowjsx` provides `defineStyleProps`,
`partSelector`, `ThemedProps` and `createStylePropsPlugin`, using component identity through the same MeowJSX registry.
That entry's `css` preserves typed part dependencies; the same-named `defineTheme` derives the real carrier of component options from the fragments,
then calls the pure root assembler. It does not create a second component table.

```ts
import { defineOptions, defineTokens } from "meowcss";
import { css, defineStyleProps, partSelector, defineTheme } from "meowcss/meowjsx";

const options = defineOptions("button", { size: ["small", "large"] });
const contract = {
  name: "button",
  parts: ["root"],
  styleProps: defineStyleProps(options, { defaults: { size: "small" } }),
} as const;
const styles = css`
  ${partSelector(contract, "root")} {
    display: inline-flex;
  }
`;
```

Component options, part names and default values are owned by the component's own contract; MeowCSS does not import concrete UI.
Do not call `String(styles)` before assembly, otherwise only CSS text remains and the component dependency information is explicitly discarded.
The root and adapters share the same internal token module; builds must not inline one copy per entry.

## Web lifecycle

`meowcss/web` provides `applyTheme`, `mountStyles` and the Web JSX `Theme`; that entry requires the DOM and a compatible
MeowJSX. Style delivery is an explicit operation: `mountStyles(document, theme.cssText)` returns a cleanup function;
`Theme` only manages the scope attribute, and `applyTheme` can subscribe to a Signal configuration and restore the original attributes on cleanup.
Importing the module itself does not touch the DOM, automatically register components or automatically load themes.

`data-meowui-*` is kept as the existing marker shared by CSS, static HTML and adapters; it carries no product data or permissions.
The MeowUI standard theme and Meowpress's own theme reuse the same generation mechanism, with concrete visual parameters held by each consumer.

## Auditing CSS

`auditCSS(input, rules, { allow })` reads every declaration in CSS text or a fragment (nested rules
and at-rules included, comments and custom property definitions skipped) and returns the ones an
`AuditRule` flags, with the property, value, selector and line. The root knows no scale: a consumer
supplies the rules (Meowtail's are `standardAuditRules`), and `allow` accepts a deliberate exception.

## Utility styles design

The [utility styles design](../../docs/designs/2026-10-24-utility-styles.md) proposes utilities
as typed functions over tokens that return classes (`className={[ui.p.group, ui.hover(ui.bg.fill)]}`),
with conditions and composition as higher-order classes. The same class expands to declarations
inside a theme rule; classes stay independent of component parts. It is a selected, not yet
implemented, breaking change: the `meowtail/theme` recipe functions are removed without aliases.

## Verification

- `bun test packages/meowcss/tests/unit` verifies pure generation, typed parts, carriers, cross-entry token identity and theme lifecycle.
- The independent CSS core check in `bun run typecheck` does not include DOM or JSX types; public type cases live in `tests/types/`.
- The `meowcss` package itself has no default CSS assets; consumers generate or install `cssText` explicitly.
