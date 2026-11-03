# Delivering the theme through the runtime

Status: implemented. An independent challenger reviewed the first draft and its implementation; the
contract below includes the changes that review required, and the last section records them.

## The problem

A Meowtail page in a browser needs four things on one document and one runtime: the components
registered, the theme stylesheet in the document, the theme attributes on the root element and the
focus-modality tracker. Until this change the host wired them by hand:

```tsx
const runtime = createRuntime({ plugins: [createMeowUI({ components: meowUIComponents })] });
const removeStyles = mountStyles(root.ownerDocument, standardTheme.cssText);
const removeTheme = applyTheme(root, standardTheme, standardOptions.select({ scheme: "auto" }));
const removeFocusModality = installFocusModality(root.ownerDocument);
const mounted = createWebRenderer(runtime).render(<App />, root);
```

Each call is reasonable on its own, but an author who misses one still gets a working page with
bare native controls and no error. That is the most common first-attempt failure for agents, and
the agent skill had to ship a host-side wrapper (`mountMeowland`) to hide it. A wrapper in every
host is the wrong owner: the runtime already knows the library through its plugins, and the
renderer already knows the container. What was missing is the joint between them.

## The contract

```tsx
const runtime = createRuntime({
  plugins: [
    createMeowUI({ components: meowUIComponents }),
    createMeowUITheme({ theme: standardTheme }),
  ],
});
const mounted = createWebRenderer(runtime).render(<App />, root);
mounted.unmount(); // also releases what the theme plugin delivered for this mount
```

### MeowJSX: `prepareContainer`

```ts
interface ContainerContext {
  readonly runtime: Runtime;
  /** The node the target renders into; meowjsx/web passes the container Element. */
  readonly container: unknown;
  /** The target that mounts: "web" for meowjsx/web. */
  readonly target: string;
}
type PrepareContainerHook = (context: ContainerContext) => void | Cleanup;

type RuntimePlugin = { /* existing members */ prepareContainer?: PrepareContainerHook };
interface RuntimeTargetHooks {
  /* existing members */ prepareContainer(container: unknown, target: string): Cleanup;
}
```

- The core stays DOM-free: the container is `unknown` and the target is named, so a plugin narrows
  it itself.
- `runtime.targetHooks.prepareContainer` runs the installed hooks in `pre`, normal, `post` order and
  returns one cleanup that releases them in reverse. A target renderer calls it; hosts do not.
- `meowjsx/web` `render(node, container)` prepares the container before the tree mounts and
  releases it after `unmount()` removes the tree. If a hook or the synchronous first render throws,
  what was acquired is released and the error propagates. Asynchronous render failures go to
  `onError` and release nothing early. Release continues past a failing cleanup and rethrows the
  first error, like the other lifecycle cleanups.
- `renderToHtml` runs no hook. Static output has no container to prepare; static hosts keep
  delivering CSS at build time with `themeAttributes`.
- Uninstalling a plugin releases the containers it prepared, even under a live mount. A plugin
  installed after a render reaches only later renders.

### MeowCSS: `mountStyles` is shared

`mountStyles(document, cssText)` keeps one `<style>` per document and stylesheet text with a holder
count; each cleanup counts once and the last removes the element. A host that mounts the stylesheet
itself and also installs the theme plugin gets one element, not two.

### Meowtail: `createMeowUITheme` in `meowtail/web`

```ts
interface MeowUIThemeOptions {
  readonly theme: ThemeDefinition;
  /** The root selection, such as standardOptions.select({ scheme: "dark" }); a Signal stays live. */
  readonly config?: MaybeSignal<Selection>;
}
function createMeowUITheme(options: MeowUIThemeOptions): RuntimePlugin;
```

On the `web` target its `prepareContainer` hook mounts `theme.cssText` with `mountStyles`, applies
the theme attributes to the container with `applyTheme` and installs the focus-modality tracker,
releasing them in reverse. It throws instead of leaving a page half-styled when:

- the container is already bound by a theme plugin (a second render into the same container would
  make the two `applyTheme` bindings restore each other's attributes);
- the container sits inside a shadow root, where a stylesheet in the document head does not apply.

`createMeowUI` is unchanged: it registers components and the style-props adapter and imports no
delivery code, so a bundle that only registers components carries none
(`tests/unit/registry-bundle.test.ts`).

## Ownership

| Concern                                 | Owner                                             |
| --------------------------------------- | ------------------------------------------------- |
| When a container is prepared and undone | the target renderer (`meowjsx/web`)               |
| Which plugins prepare it, in what order | the runtime (`prepareContainer` hooks, `enforce`) |
| One stylesheet per document             | `mountStyles` in `meowcss/web`                    |
| What a themed Meowtail page needs       | `createMeowUITheme` in `meowtail/web`             |
| Which components are registered         | `createMeowUI`, unchanged                         |
| Which theme and selection               | the host, through the options                     |
| CSS for static output                   | the host at build time, unchanged                 |

Hosts that stay on the explicit path, because they do something the plugin does not express:

- static output and the documentation site, which deliver CSS at build time;
- `examples/sunshine-welcome` and `examples/image-loading`, which mount a presentation theme joined
  with extra CSS text;
- the Meowbook gallery, which applies the theme to `documentElement` and renders into `body`;
- the Meowbook and slides preview files, which mount styles themselves (sharing now makes adding the
  plugin harmless, but they do not need it).

## Alternatives considered

**A host-side wrapper (`mountMeowland`).** Works, but every host owns a copy, and the library still
exposes four independent steps. Rejected; the agent skill now uses the plugins.

**Theme options on `createMeowUI`.** The first draft did this. It pulled `applyTheme`, the focus
tracker and its top-level script into every bundle that registers components, theme or not, and
tied the registry entry to DOM code. A separate plugin in `meowtail/web` keeps registration and
delivery in one `plugins` array while the registry factory stays pure.

**A root component (`<MeowUIRoot theme>`).** Needs no MeowJSX change and mirrors MUI's
`ThemeProvider` + `CssBaseline`. It works, but it is a second place to configure the library next to
the plugin list, and a component cannot release document-level resources when its plugin is
uninstalled. `Theme` from `meowcss/web` remains for nested scheme regions.

**Mount styles from a plugin `setup`.** A plugin installs before any document is known and may serve
several documents (iframes, a gallery canvas). The container is the first point where the document
is known.

**A DOM-typed hook in the core.** Would break the rule that the MeowJSX root has no DOM types.

## Verification

- MeowJSX (`tests/unit/prepare-container.test.ts`): hook order with `enforce`; release in reverse and
  once; rollback when a hook throws; uninstall releases live preparations; the Web renderer prepares
  before component setup and releases after the tree is gone; a failing render releases; static
  HTML runs no hook.
- MeowCSS (`tests/unit/theme.test.ts`): holders of one stylesheet share one element.
- Meowtail (`tests/unit/registry-mount.test.tsx`, `registry-bundle.test.ts`): one stylesheet across
  two roots and a manual holder; attributes applied and restored; focus tracker installed and
  released; live Signal config; second mount into one container and shadow-root containers throw;
  uninstall under a live mount; the default runtime and renderer; registration alone touches
  nothing and bundles no delivery code.
- A clean consumer project renders a styled, interactive page from the plugin setup in Chromium.

## The review

The challenger accepted the joint (a runtime hook called by the Web renderer, DOM-free core) and
required these changes, all made above:

1. Move theme delivery out of `createMeowUI` into `meowtail/web`, with a bundle test.
2. Share stylesheets in `mountStyles` rather than in a private Meowtail counter, so manual and
   plugin delivery cannot paint twice.
3. Refuse a second themed mount into one container instead of corrupting attributes on unmount.
4. Name the hosts that stay on the explicit path.
5. Refuse shadow-root containers instead of leaving them unstyled.
6. Update the package contracts that described delivery as host-only.
7. Rename `mount` to `prepareContainer`, which no longer reads like a per-node mount hook.
8. State the asynchronous-failure and multiple-error behavior, and test uninstall under a live
   mount and the default runtime path.
