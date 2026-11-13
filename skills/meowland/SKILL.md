---
name: meowland
description: Build browser UI with Meowland's packages - meowtail components and themes, meowjsx JSX and signals (not React), meowcss styles. Use when a project depends on meowtail, meowjsx or meowcss, when the user asks to add Meowland to an app, or to build a page, form, dashboard, settings screen or agent chat with it, or to translate an interface or a Meowpress site. Covers installation, the one-time setup, choosing and reading components, signals, styling with ui class values and tokens, checking the result, and the list-fill-stamp translation loop.
---

# Building with Meowland

Meowland is a component library with its own runtime. If you know shadcn/ui and Tailwind, most
of the vocabulary carries over, but three habits do not: components are not React, styles are not
utility classes, and nothing renders styled until the theme plugin is installed. This skill is the path an
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

## 3. Install two plugins, then render

The runtime carries the library: `createMeowUI` registers the components and `createMeowUITheme`
delivers the theme to every mount (the stylesheet, the theme root on the container and keyboard
focus rings). Rendering is MeowJSX's own `render`, and `unmount()` releases everything.

```tsx
// src/main.tsx
import { createRuntime } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { createMeowUI, meowUIComponents } from "meowtail";
import { standardTheme } from "meowtail/theme";
import { createMeowUITheme } from "meowtail/web";
import { App } from "./app";

const runtime = createRuntime({
  plugins: [
    createMeowUI({ components: meowUIComponents }),
    createMeowUITheme({ theme: standardTheme }),
  ],
});
createWebRenderer(runtime).render(<App />, document.querySelector<HTMLElement>("#app")!);
```

Without the theme plugin, components render as bare native controls and nothing reports an error.
`meowtail@0.4.0-alpha.1` and earlier do not export `createMeowUITheme`; there, do its work by hand
on the same root before rendering:

```ts
import { applyTheme, mountStyles } from "meowcss/web";
import { installFocusModality } from "meowtail/web";

mountStyles(root.ownerDocument, standardTheme.cssText);
applyTheme(root, standardTheme);
installFocusModality(root.ownerDocument);
```

- `meowUIComponents` registers the whole library, which is the simplest correct start. To cut the
  bundle later, pass only the components the app renders, including the ones its compositions
  render, for example `components: [Button, Card, Stack]`.
- Host components with their own `meta` join the same list; their style fragments join the theme
  through `extendStandardTheme({ styles: [...] })` from `meowtail/theme`; pass that theme to
  `createMeowUITheme` instead of `standardTheme`.
- Other themes: `journalTheme` and `meowTheme` from `meowtail/theme`. Choose the scheme with
  `createMeowUITheme({ theme, config: standardOptions.select({ scheme: "dark" }) })`; it is
  `"light"`, `"dark"` or `"auto"` (the default), and a Signal `config` switches it live. A static or server-rendered page writes the CSS to a file and uses
  `themeAttributes` from `meowcss` instead; see "Component installation and style delivery" in the meowtail README.

## 4. Find the component before writing markup

Meowtail has about 140 components, including complete compositions: `PageFrame` and page shells,
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
  `keyed(items, key, render)` from `meowjsx`. `render` receives each item as a read-only Signal, so
  bind `mapSignal(item, (row) => row.title)` rather than reading `item.title`. A Signal whose value is a whole JSX subtree remounts
  that subtree on every change and loses focus and drafts.
- In event handlers read the current value: `count.value` or `unwrap(prop)`.
- `context.effect(fn)` and `context.onCleanup(fn)` (the component's second argument) are for the
  outside world only: timers, observers, DOM APIs without a prop.
- Props a component may receive live are typed `MaybeSignal<T>`; a component's docs say when a prop
  such as `items` or `options` is fixed for the mount.
- Events are DOM events with camel-case names (`onClick`, `onInput`, `onChange`, `onKeyDown`).
- Presence decides who owns a value. Omit `value` and the component keeps its own state, starting from `defaultValue`. Pass
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
  The authoring guide walks through it, including variants with `defineOptions` (the `cva`
  equivalent): `node_modules/meowtail/AUTHORING.md` in releases after 0.4.0-alpha.1, otherwise
  [AUTHORING.md on GitHub](https://github.com/lidessen/meowland/blob/main/packages/meowtail/AUTHORING.md).
- Do not restyle a library component by targeting its internal markup; pass the props, variant
  options or `className` it documents.

## 7. Check the result

Look at the result before calling it done: a missing theme or an empty list does not show in types
or unit tests. An agent in a terminal photographs the app with Meowbook (this describes source newer
than the published `dev` tag; on an older install, `meowbook` needs a config and a `preview.ts`
first, see its README):

```sh
bun add -d meowbook@dev
bunx --no-install playwright install chromium   # once
bunx --no-install meowbook capture --component src/app.tsx --export App
bunx --no-install meowbook capture --component src/app.tsx --export App --viewport 390x844 --color-scheme dark
bunx --no-install meowbook capture --story users/loaded
```

No config is needed. The `Scene` line of the output is the absolute path of a themed PNG; read it.
Keep `App` in its own module apart from `main.tsx`, so it can be photographed as a temporary
component. Add `dist/meowbook/captures` to `.gitignore`.

- If the page photographs as an empty list or a loading state, the `Unmocked requests` line names
  the `fetch` that had no answer. Write `src/*.stories.tsx` with `mocks` (`"GET /api/users": [...]`,
  or a function returning JSON or a `Response`) and capture it with `--story <id>`. If the real
  application and its backend are already running, `capture --url` photographs that instead.
- Type-check (`tsc --noEmit`). If controls look like bare browser defaults, the theme plugin is
  missing or sits on a different runtime from the one that renders.
- Look at about 390px and at `--color-scheme dark`; both come from the theme, so a layout that
  breaks there usually hard-codes widths or colors.
- With `createMeowUITheme` the page itself takes the theme's canvas and color scheme. A region
  embedded in someone else's page passes `page: false` and leaves the ground to that page; on
  0.4.0-alpha.1 and earlier, give the app's outermost element `className={ui.bg.canvas}` instead.
- Keyboard: Tab through the page; focus rings appear after keystrokes, not after clicks.

## Translating a Meowpress site

Interface copy in an application goes through `meowjsx/i18n`: write the sentence where it is used
with `t("Posts")`, and add a language by giving `createI18n` a catalog from source sentence to
translation. The source sentence is the identity, so there are no keys to invent, and an edited
sentence is reported as an unused catalog entry rather than silently keeping a wrong translation.
`auditCatalog` from `meowjsx/i18n/audit` turns a locale into a missing, unused and invalid list.

A Meowpress site adds content and publishing on top. Run the list, fill what it names, stamp, and
repeat until it is empty; the loop is the same one a person follows.

```sh
bunx --no-install meowpress locales                    # missing and stale items, one per line
bunx --no-install meowpress locales --json             # the same list as a contract
bunx --no-install meowpress locales stamp content/posts/first.fr.md
```

- Configure the locale in `meowpress.config.ts`; the site's sentences are filled in
  `locales/<tag>.json`, and a content translation is a sibling file: `first.md` becomes
  `first.fr.md`.
- A translation records the hash of the original it came from in its frontmatter
  (`translation.source`). After writing or revising one, `stamp` records the current hash. A
  missing or stale translation is still published with a notice to readers; `locales.stale:
  "fail"` turns a stale one into a build error instead.
- Run `locales` again until it prints nothing, then build. `/translations.json` in the output is
  the same report for an agent reading the published site.

## Boundaries

Meowtail owns structure, interaction and the visual system. The host owns business data,
networking, persistence, permissions, uploads and execution: components display facts and call
your callbacks, they do not fetch or store. `meowslides` (presentations) and `meowpress` (static
sites) build on the same packages and have their own READMEs.
