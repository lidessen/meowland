# Meowpress

`meowpress` provides content reading, page rendering, themes and the build pipeline for static sites.
Consumers own the site configuration and content and build through this package; the package does not own the application's posts or output directory.

Published history: `0.1.1-alpha.0` was accepted from the registry, followed by `0.1.1-alpha.1` with the English site and CLI defaults; `latest` remained `0.1.0`. The current workspace package is `0.2.0-alpha.0`, and its required CSS and JSX peer ranges accept `^0.2.0-alpha.0`. The host selects the shared CSS/JSX modules, and this package does not privately install another CSS copy; it does not depend on Meowtail or MeowSlides. Out-of-package builds and theme identity acceptance are bound to exact package archives, and peer contracts are not bypassed through overrides. Publishing requires separate explicit authorization.

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

## Pages a consumer owns

A consumer that supplies `pages` owns the whole site map. The provider receives the content that was
already loaded and returns complete documents; the package writes them at their paths, adds them to
the agent-facing indexes, and does not publish its own blog routes next to them. One site map, one
owner.

```ts
import { meowSite, type SitePage } from "meowpress/build";

export default meowSite({
  content: [{ directory: "/path/to/content" }],
  outputDirectory: "/path/to/dist",
  themeStylesheet: "site-theme.css",
  pages: ({ posts, theme }): SitePage[] =>
    posts.map((post) => ({
      path: post.slug,
      title: post.title,
      html: renderDocument(post, theme),
    })),
});
```

- `pages` is a provider of complete HTML documents. A path that resolves above the site root is
  refused rather than clamped.
- `mdxComponents` adds named components to the MDX content pages; the built-in `Callout` stays
  available.
- `themeStylesheet` names the theme stylesheet the build writes, so a consumer page can link it. It
  applies to the built-in pages as well, so a renamed stylesheet never leaves a page linking a file
  that was not written.

Directories in the configuration are provided explicitly by the application; the default theme resolves from this package and does not depend on the startup directory.
The whole theme can be replaced with `theme: defineTheme(...)`; all static pages output that theme's root attributes and default options.
The build writes `theme.cssText` to a temporary CSS file, then lets Bun handle the other assets, and finally delivers through a stylesheet link,
so the theme applies without client-side JavaScript.

`fonts` lists the web fonts the theme names, as Fontsource variable packages
(`{ family, package, styles }`, the same shape as Meowtail's `journalFonts`). The build publishes
each package's weight-axis `woff2` files into `fonts/` with a content hash, puts their `@font-face`
rules first in the theme stylesheet with each subset's `unicode-range`, and copies each license to
`licenses/<name>-OFL.txt`. A browser fetches only the files a page's text and families use, and
nothing for a family the page does not use, so a site with a theme switch pays only for the active
theme. The default Blog theme defaults to `blogFonts` (Geist); any other theme defaults to none.
Install the listed packages in the site; nothing depends on an external font service.
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

The CLI requires Bun, and the output location is determined by `outputDirectory`. Font packages resolve from the startup directory first, then from
this package, which carries the default Geist, so consumers are not required to copy source, install workspace-root dependencies or access an external font service.

## Independent verification

Once repository dependencies are ready, run `bun run --cwd packages/meowpress test` and
`bun run --cwd packages/meowpress typecheck`. Tests live in `tests/unit/`; real build tests create temporary content, themes and images through the public
`meowpress/build` entry,
covering Markdown, MDX, Thought output and draft page/asset exclusion, without reading Blog content or invoking the Blog build.
