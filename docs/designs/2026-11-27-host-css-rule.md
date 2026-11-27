# Host CSS and Meowtail parts

Meowtail's theme wraps its part selectors in `:where(...)`, keeping their specificity at zero.
That makes themes and supported overrides composable, but it also means an ordinary unlayered
host rule such as `button { color: red }` can win over the theme on a Meowtail button. A host
selector that names `[data-meowui-part]` similarly couples the app to component internals and
can override the selected theme. Apps must not use these selectors to style library parts.

Host styles may arrange app-owned containers, set CSS variables or use the theme's supported
options, and style app-owned classes that are not also used on library parts. Keep element
selectors in a cascade layer below the unlayered theme, or under an explicit
`.host-css-only` wrapper whose subtree contains no Meowtail parts. A wrapper around a mixed app
and library subtree does not prevent a descendant selector from matching a library part. Layer
ordering and `!important` can also change the cascade, so a layer is not permission to override
parts deliberately.

```css
.docs-layout {
  display: grid;
  grid-template-columns: 16rem 1fr;
}
@layer host-reset {
  button {
    font: inherit;
  }
}
.host-css-only a {
  text-decoration: underline;
}
```

The last example requires its wrapper to contain only host-owned markup. Prefer a host-owned
class on the element when that isolation cannot be guaranteed. Use the theme and component
options for the appearance of Meowtail parts.

## Audit scope

`bun test scripts/host-css-audit.test.ts` checks source `.css` files under `apps/docs` and
`apps/showcase`, excluding `dist` and `node_modules`. It rejects part-attribute selectors even
inside layers or host-only wrappers, and unlayered element selectors without a host-only wrapper.
The current CSS-file baseline has no exceptions. An exception is recorded by file and selector,
with its occurrence count, so a new occurrence still fails. Remove exceptions as the old rules
are fixed; do not add new host rules to the baseline.

This is a conservative source check, not a browser cascade or DOM analysis. It cannot verify that
a `.host-css-only` subtree really contains only host markup, nor does it inspect CSS generated
from TypeScript or other source formats. Review those styles and wrapper contents against the
same rule.
