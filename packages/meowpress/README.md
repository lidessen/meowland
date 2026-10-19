# Meowpress

`meowpress` provides content reading, page rendering, themes and the build pipeline for static sites.
Consumers own the site configuration and content and build through this package; the package does not own the application's posts or output directory.

`0.1.1-alpha.0` has been published and accepted from the registry. `0.1.1-alpha.1` updates the English site and CLI defaults and is published under `alpha`, with independent registry consumption accepted; `latest` remains `0.1.0`. CSS and JSX are both required peers, allowing `^0.1.0 || ^0.1.1-alpha.0`, keeping the stable compatibility range and accepting this round's JSX/CSS alphas. The host selects the shared CSS/JSX modules, and this package does not privately install another CSS copy; it does not depend on Meowtail or MeowSlides. Actual out-of-package builds and theme identity acceptance are bound to exact tgz files, and peer contracts are not bypassed through overrides. Publishing still requires separate explicit authorization.

This package is a standalone content publishing library with source in `packages/meowpress`; it already has a public build entry, independent tests and typechecking,
and does not depend on Assistant, WorkCell, Deno or the content and runtime state of a specific Blog. Style generation comes from `meowcss`,
and HTML rendering comes from `meowjsx/web`; MeowUI does not need to be installed.

## Entries

- `meowpress/build`: `meowSite()` defines configuration and `buildSite()` performs the build; this is the only public export.
  Content reading, page rendering, skill indexing and themes are internal package modules.
- `meowpress --config ./site.config.ts`: Bun CLI that loads the consumer-provided configuration and builds.

```ts
import { meowSite } from "meowpress/build";

export default meowSite({
  content: [{ directory: "/path/to/content" }],
  skillsDirectory: "/path/to/workspace",
  outputDirectory: "/path/to/dist",
});
```

Directories in the configuration are provided explicitly by the application; the default theme resolves from this package and does not depend on the startup directory.
The whole theme can be replaced with `theme: defineTheme(...)`; all static pages output that theme's root attributes and default options.
The build writes `theme.cssText` to a temporary CSS file, then lets Bun handle fonts and other assets, and finally delivers through a stylesheet link,
so the theme applies without client-side JavaScript. Files for the default Geist font are bundled with the site and do not depend on an external font service.
When the default font is used, the output also includes `licenses/geist-OFL.txt`, preserving the font's SIL OFL license.
Default illustrations use in-package vectors and CSS and require no business images. The `hero`, `feed` and `about` keys of `site.images`
can explicitly set decorative image paths, for example `images/cover.svg`; paths are relative to the content root's `assets/`, the library handles each page depth,
and assets are delivered along the existing asset build flow. When no About image is set, the first letter of the site name is used.
The content source contains `posts/`, `thoughts/` and optional assets; drafts whose names start with an underscore do not enter the published output.
The site has its own theme and does not implicitly install MeowUI's application theme.

## Verification and build

After installing `meowpress` and its `meowcss` and `meowjsx` dependencies, run in the consumer directory:

```sh
bunx --no-install meowpress --config ./site.config.ts
```

The CLI requires Bun, and the output location is determined by `outputDirectory`. Font files resolve from this package's official Geist dependency,
and consumers are not required to copy source, install workspace-root dependencies or access an external font service.

## Independent verification

Once repository dependencies are ready, run `bun run --cwd packages/meowpress test` and
`bun run --cwd packages/meowpress typecheck`. Tests live in `tests/unit/`; real build tests create temporary content, themes and images through the public
`meowpress/build` entry,
covering Markdown, MDX, Thought output and draft page/asset exclusion, without reading Blog content or invoking the Blog build.
