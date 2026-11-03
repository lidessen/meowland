---
name: meowland
description: Build browser UI with Meowland's packages - meowtail components and themes, meowjsx JSX and signals (not React), meowcss styles. Use when a project depends on meowtail, meowjsx or meowcss, when the user asks to add Meowland to an app, or to build a page, form, dashboard, settings screen or agent chat with it. Covers installation, the one-time setup, choosing and reading components, signals, styling with ui class values and tokens, and checking the result.
---

# Building with Meowland

Meowland is a component library with its own runtime. If you know shadcn/ui and Tailwind, most
of the vocabulary carries over, but three habits do not: components are not React, styles are not
utility classes, and nothing renders styled until the theme is mounted. This skill is the path an
agent takes in a host application. It does not cover developing the Meowland repository itself.

| You would reach for                | In Meowland                                                               |
| ---------------------------------- | ------------------------------------------------------------------------- |
| shadcn `Button`, `Card`, `Dialog`… | The same names from `meowtail`, already styled by the standard theme      |
| `npx shadcn add button`            | Nothing to copy: import it from `meowtail` and register it on the runtime |
| React state and hooks              | `signal`, `derived`, `mapSignal` from `meowjsx/signal`; setup runs once   |
| `flex gap-4`, `grid grid-cols-3`   | `Stack`, `Inline`, `Grid` with `gap="compact" \| "normal" \| "relaxed"`   |
| `text-sm text-muted-foreground`    | `Text variant="secondary" \| "caption" \| "eyebrow"`                      |
| Tailwind utilities on an element   | `ui` class values from `meowtail/theme`, joined with `cx` from `meowcss`  |
| `tailwind.config` colors and scale | `uiTokens` roles; light and dark values travel together                   |
| `cn()`                             | `cx()`                                                                    |
| `ui.shadcn.com/docs/components/x`  | `https://meowland.dev/components/<kebab-name>.md`                         |

## 1. Install

```sh
bun add meowtail@dev meowjsx@dev meowcss@dev
```

Use the `dev` (or `alpha`) channel and install all three: the host imports `meowjsx` and `meowcss`
directly. The `latest` tags still point at 0.1.x, whose API differs from everything below. If the
project already pins versions, keep them and read the docs shipped in `node_modules/meowtail`
(see step 4) rather than the website, which follows the newest source.

## 2. Configure JSX

MeowJSX compiles from TypeScript's own JSX transform. Prefer the automatic runtime:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "meowjsx",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
  },
}
```

The classic transform also works (`"jsx": "react"`, `"jsxFactory": "h"`,
`"jsxFragmentFactory": "Fragment"`) but then every `.tsx` file imports `h` (and `Fragment`) from
`meowjsx`. Never install or import `react`, `react-dom` or `@types/react`. Bun reads these
settings from `tsconfig.json`; another bundler needs the same automatic runtime and
`jsxImportSource: "meowjsx"` in its own JSX options.

## 3. Mount once: registry, stylesheet, theme root

A page needs all three on one runtime; missing any one leaves unstyled native controls. Put them in
one module and render every view through it:

```ts
// src/meowland.ts
import { createRuntime, type Child } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { applyTheme, mountStyles } from "meowcss/web";
import { createMeowUI, meowUIComponents } from "meowtail";
import { standardOptions, standardTheme } from "meowtail/theme";
import { installFocusModality } from "meowtail/web";

export function mountMeowland(root: HTMLElement, view: () => Child): () => void {
  const runtime = createRuntime({ plugins: [createMeowUI({ components: meowUIComponents })] });
  const removeStyles = mountStyles(root.ownerDocument, standardTheme.cssText);
  const removeTheme = applyTheme(root, standardTheme, standardOptions.select({ scheme: "auto" }));
  const removeFocusModality = installFocusModality(root.ownerDocument);
  const mounted = createWebRenderer(runtime).render(view(), root);
  return () => {
    mounted.unmount();
    removeFocusModality();
    removeTheme();
    removeStyles();
  };
}
```

```tsx
// src/main.tsx
import { mountMeowland } from "./meowland";
import { App } from "./app";

mountMeowland(document.querySelector<HTMLElement>("#app")!, () => <App />);
```

- `meowUIComponents` registers the whole library, which is the simplest correct start. To cut the
  bundle later, pass only the components the app renders, including the ones its compositions
  render, for example `components: [Button, Card, Stack]`.
- Host components with their own `meta` join the same list; their style fragments join the theme
  through `extendStandardTheme({ styles: [...] })` from `meowtail/theme` (mount its `cssText`
  instead of `standardTheme.cssText`).
- Other themes: `journalTheme` and `meowTheme` from `meowtail/theme`. `scheme` is `"light"`,
  `"dark"` or `"auto"`. A static or server-rendered page writes the CSS to a file and uses
  `themeAttributes` instead; see "Component installation and style delivery" in the meowtail README.

## 4. Find the component before writing markup

Meowtail has about 130 components, including complete compositions: `PageFrame` and page shells,
`Form`, `Dialog`, `Table`, `Tabs`, `CommandPalette`, chat parts and the whole `AssistantView`.
Writing a `<div>` structure for something the library has is the most common mistake.

1. Pick by task from the catalog: `node_modules/meowtail/COMPONENTS.md` (version-matched) or
   `https://meowland.dev/components.md` (newest source). Start with the complete composition for
   the task; use its parts only when it cannot express the task.
2. Read the component's page before first use: `https://meowland.dev/components/<kebab-name>.md`
   (for example `/components/choice-select.md`). It has the import line, every prop with its type
   and default, the DOM parts and the code of each example. Offline, read the declaration in
   `node_modules/meowtail/dist/src/components/<kebab-name>.d.ts` (chat parts under
   `dist/src/chat/`).
3. Copy the shape of the example closest to your task. Examples are the stories the library tests
   visually, so their composition is the intended one.

Everything a host renders is imported from the package root, `meowtail`. Subpaths hold the rest:
`meowtail/theme` (themes, `ui`, `uiTokens`), `meowtail/icons` (`Icon`), `meowtail/web` (document
behavior), `meowtail/json` (the finite JSON catalog for model output rendered at runtime; see
`JSON.md`) and `meowtail/chat`. `https://meowland.dev/llms.txt` indexes every page.

## 5. Write components the MeowJSX way

A component is a function whose body is setup: it runs once per mount and never again. A later
change reaches the DOM only through a Signal bound to a prop, attribute, text node or child.

```tsx
import { derived, signal } from "meowjsx/signal";
import { Button, Inline, Text } from "meowtail";

export function Counter({ step = 1 }: { step?: number }) {
  const count = signal(0); // created once, in setup
  const label = derived(() => `Clicked ${count.value} times`);
  return (
    <Inline gap="compact">
      <Button onClick={() => (count.value += step)}>Increment</Button>
      <Text variant="secondary">{label}</Text>
    </Inline>
  );
}
```

- Pass the Signal (`{label}`, `busy={busy}`), not its `.value`; a `.value` read in setup is a
  snapshot that never updates.
- Derive with `derived(() => ...)` or `mapSignal(source, fn)`. Do not write one signal from an
  effect to mirror another.
- Show and hide with the `hidden` attribute bound to a Signal; render lists with
  `keyed(items, key, render)` from `meowjsx`. A Signal whose value is a whole JSX subtree remounts
  that subtree on every change and loses focus and drafts.
- In event handlers read the current value: `count.value` or `unwrap(prop)`.
- `context.effect(fn)` and `context.onCleanup(fn)` (the component's second argument) are for the
  outside world only: timers, observers, DOM APIs without a prop.
- Props a component may receive live are typed `MaybeSignal<T>`; a component's docs say when a prop
  such as `items` or `options` is fixed for the mount.
- Events are DOM events with camel-case names (`onClick`, `onInput`, `onChange`, `onKeyDown`).
- Presence decides who owns a value. Omit `value` and the component keeps its own state. Pass
  `value={selected}` (a Signal) and the host owns it: set `selected.value` in `onValueChange`, or
  the control will not move. `Checkbox` and `Switch` use `checked` with the native `onChange`.

## 6. Style without leaving the theme

Components arrive styled; a host rarely writes CSS. When it does:

- On an instance, compose built-in class values: `className={cx(ui.p.panel, ui.bg.raised)}` or an
  array `className={[ui.radius.xl, "app-hero"]}`. `ui` is typed, so the editor lists what exists.
- In a stylesheet, use `uiTokens` (`uiTokens.space.group`, `uiTokens.ink.secondary`) instead of
  literal colors, sizes, radii or durations; the standard theme switches light and dark from the
  same tokens. `auditCSS(fragment, standardAuditRules)` reports literals.
- A host component that needs its own look declares `meta = { name: "app-…", parts: [...] }`, binds
  `ref={context.parts.root}` and gets a `css` fragment addressed with `parts<typeof X>("app-…")`.
  `node_modules/meowtail/AUTHORING.md` walks through it, including variants with
  `defineOptions` (the `cva` equivalent).
- Do not restyle a library component by targeting its internal markup; pass the props, variant
  options or `className` it documents.

## 7. Check the result

- Type-check (`tsc --noEmit`), then open the page in a browser. Unit tests and types do not show a
  missing theme.
- If controls look like bare browser defaults, one of the three mount steps is missing or ran on a
  different runtime from the one that renders.
- Look at a narrow viewport (about 390px) and at `scheme: "dark"`; both come from the theme, so a
  layout that breaks there usually hard-codes widths or colors.
- Keyboard: Tab through the page; focus rings appear after keystrokes, not after clicks.

## Boundaries

Meowtail owns structure, interaction and the visual system. The host owns business data,
networking, persistence, permissions, uploads and execution: components display facts and call
your callbacks, they do not fetch or store. `meowslides` (presentations) and `meowpress` (static
sites) build on the same packages and have their own READMEs.
