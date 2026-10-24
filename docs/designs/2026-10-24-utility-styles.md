# Utility classes as values

Status: proposed direction, pending implementation. No current export changes with this document;
names are working names.

MeowCSS is JavaScript, so a utility does not need a class-string language. A utility is a function
over a token scale, and what it returns is a class: a value that a component's `className` takes
directly and that a theme rule can expand into declarations. Conditions and composition are
higher-order classes: functions from classes to classes. Classes know nothing about component
parts; a part, or any node, is associated with a class where it is used.

```tsx
<Card className={[p("group"), bg("fill")]} />
<div className={[p("panel"), radius("xl"), hover(bg("fill")), wide(p("section"))]} />
```

## Classes

`p("group")` returns a `UtilityClass`:

- its class name, `ui-p-group`, derived from the utility and the key, so static HTML and Web
  mounting agree and the name reads in devtools;
- its declarations, `padding: var(--ui-space-group);`.

`String(p("group"))` is the class name, so the existing `className` path (which stringifies the
value) already accepts a single class or a Signal of one:

```tsx
<div className={mapSignal(selected, (on) => (on ? bg("selected") : bg("raised")))} />
```

Arguments are typed from the scale: `p("group")` compiles, `p("13px")` does not. A utility that
produces classes has a finite scale (one token group or a finite keyword map). A one-off literal is
not a class; it stays a declaration beside its selector, where the audit sees it.

## Higher-order classes

A higher-order class takes classes and returns a class.

- Conditions: `hover(bg("fill"))` is the class `ui-hover:bg-fill`, whose rule is
  `.ui-hover\:bg-fill:hover { … }`. `wide(p("section"))` nests the rule in the catalog's media query.
  Conditions compose: `wide(hover(bg("fill")))`.
- Composition: `cx(p("panel"), bg("raised"), radius("xl"))` is one value holding those atoms. Its
  class name is the atoms' names joined, so it introduces no new rule. A named style is just a
  constant: `const card = cx(...)`, and `cx(card, p("group"))` overrides by order (a later atom of
  the same utility replaces the earlier one).
- `className` arrays: MeowJSX normalizes an array (nested, with `false`, `null` and `undefined`
  ignored) into a class list, so `className={[card, active && bg("selected")]}` works for plain
  strings too. This is the one renderer change; it belongs in the core prop normalization so static
  HTML and Web agree.

Because every composite is a list of atoms and every scale is finite, the CSS needed for any class
anyone can write is the atom sheet: each utility × its keys × the conditions it allows. There is
no per-style registration, hashing or scanning.

## Classes in themes

Interpolating a class into a rule body expands its declarations; conditions expand to nested rules.
`css` recognizes a class value (by its own marker, not by `toString`):

```ts
export const cardStyles = css`
  ${partSelector(cardContract, "root")} {
    ${cx(p("panel"), bg("raised"), radius("xl"), hover(bg("fill")))}
  }
`;
```

The association between a part and a style is made here, by the theme, exactly as today. The
existing recipes (`surface`, `text`, `interactive`, `focusRing`) become utilities of the same kind:
`text("caption")` works in a theme rule and in `className`.

## Ownership and delivery

- `meowcss` root: `utility(name, properties, scale)`, `condition(name, wrapper)`, `cx`, class
  values, their `css` expansion and `atomSheet(utilities, conditions)`. No DOM, no JSX.
- MeowJSX: `className` array normalization only.
- Meowtail: the concrete utilities over `uiTokens` and their allowed conditions, and the atom sheet
  appended last in `standardTheme.cssText`, after the component fragments. A utility class is
  `0,1,0` and the theme's part rules are `:where(...)`, so an instance class wins over the theme's
  paint of the same property; a conditioned class is emitted after the plain ones.
- The atom sheet is audited with `standardAuditRules`, and a size budget test keeps conditions a
  deliberate choice per utility.

Component contracts, part markers and option attributes do not change. A Meowtail component keeps
its look in its theme file and forwards a host `className` on its root; a host class is a local
adjustment, not the component's look.

## Open questions

- Condition kinds: media queries, or container queries for components embedded in host layouts.
- Which inline `style` objects in stories and examples become classes, and which are instance
  measurements that stay.

## Implementation and verification

1. Class values, `utility`, `condition`, `cx`, `css` expansion and `atomSheet` in the `meowcss`
   root: tests for names, determinism, override order, condition nesting, and type cases for
   invalid keys, inside the DOM-free core check.
2. `className` array normalization in MeowJSX, checked through static HTML and Web mounting.
3. Meowtail utilities over `uiTokens`; audit and budget the atom sheet; rewrite a few theme files
   and confirm unchanged computed styles; migrate a story and look at it in Meowbook.

Use [development checks](../development-checks.md) for commands and coverage.
