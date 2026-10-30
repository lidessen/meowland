# MeowCSS

A generic TypeScript token, options and CSS generation mechanism. The root entry does not depend on JSX, UI or the DOM; component adapters are imported from
`meowcss/meowjsx`, DOM theme lifecycle from `meowcss/web`, and build-step passes over bundled CSS from `meowcss/bundle`.

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
`parts`, `ThemedProps` and `createStylePropsPlugin`, using component metadata through the same MeowJSX registry.
A theme imports a component's type to address its finite parts; constructing descriptors loads no component code.
The adapter's `defineTheme` binds conditional component tokens by their option attributes, while keeping
root and scheme configuration regional. It does not infer carriers from component implementations.

```ts
// button.styles.ts
import type { Button } from "./button";
import { css, parts } from "meowcss/meowjsx";
import { buttonOptions } from "./button.options";

const button = parts<typeof Button>("button");
const styles = css`
  ${button.root} {
    display: inline-flex;
    ${buttonOptions.when({ size: "large" })} {
      align-items: center;
    }
  }
`;
```

The component's static `meta` owns its name, part names and `style: defineStyleProps(...)` metadata.
Components and themes share each `defineOptions` object from an implementation-free module such as
`button.options.ts`. Registration checks metadata and carrier parts; token assembly checks conflicting
option-source definitions. Theme assembly does not compare component metadata with independently
authored schemas. The root and adapters share the same internal token module; builds must not inline
one copy per entry.
`css` throws when an interpolation would print as `[object Object]`; a part descriptor from a second
installed MeowJSX copy is the usual cause.

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

## Class values and cx

`cx` combines class values and plain class strings, omitting `false`, `null` and `undefined`.
String conversion returns the joined classes; interpolation into `css` expands the declarations.
A composite containing a plain external class string cannot expand declarations, since that string
has no CSS definition attached. Class-name composition does not resolve conflicts: stylesheet order
and the CSS cascade govern the result.

Meowtail supplies `ui` from `meowtail/theme`, for example `cx(ui.p.group, ui.bg.fill)`. Another theme
can define values with `defineClassValue(className, order, declarations, catalog)`, using one opaque
object or Symbol as its catalog identity and fixed numeric order matching its stylesheet. Within a
composite, values from that catalog expand in catalog order. Nested state and media rules remain
ordinary CSS in the declarations; there is no condition language, scanning or automatic installation.

The [utility styles design](../../docs/designs/2026-10-24-utility-styles.md) records the breaking
replacement of the old recipe surface.

## Bundling

The package declares `sideEffects: false`. `css`, `defineOptions`, `defineTokens`, `tokenRef`,
`compileTokens`, `defineTheme`, `themeAttributes`, `defineClassValue`, `cx`, `defineStyleProps`
and `parts` are marked `@__NO_SIDE_EFFECTS__`, so Rollup drops an unused call anywhere, including in
a consumer's own theme modules. In local checks with esbuild 0.25 the mark applied only inside the
declaring module, and Bun 1.4 did not apply it; with those bundlers, mark a top-level call
`/* @__PURE__ */` when it should be droppable.

`meowcss/bundle` holds passes for CSS a bundler has already written. `removeLegacyIsFallbacks(css)`
drops the `:-webkit-any()` and `:-moz-any()` copies Bun's CSS bundler (1.4.4) writes beside every
`:is()` rule and every `:not()` with a selector list; `Bun.build` has no CSS targets to turn them off.
iOS Safari matches the `:-moz-any()` copy of a rule like
`:where(.field):-moz-any(:focus-visible, :focus-within)` on every element with focus inside, which
spreads a field's focus halo over the containers of a tapped button. The `:is()` copy always stays.
Run it over each `.css` output after `Bun.build`; Meowbook, Meowpress and Meowslides builds already do.
Text from `mountStyles(document, cssText)` never passes a bundler and needs nothing.

## Verification

- `bun test packages/meowcss/tests/unit` verifies pure generation, typed parts, carriers, cross-entry token identity and theme lifecycle.
- The independent CSS core check in `bun run typecheck` does not include DOM or JSX types; public type cases live in `tests/types/`.
- The `meowcss` package itself has no default CSS assets; consumers generate or install `cssText` explicitly.
