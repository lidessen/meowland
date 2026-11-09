# Meowpress

Meowpress builds a static blog from Markdown and MDX, with a built-in theme for posts, short notes
and public skills. A project can supply its own theme or page map through `meowpress/build`.

## Build and preview a site

Use Bun and install this version of `meowpress` with compatible `meowcss` and `meowjsx` peers.
When trying a workspace build, install the archives from `bun run build` and `bun run pack` in your
project. From that project, add your first post and build the site.

```sh
mkdir -p content/posts
printf '# First post\n\nHello from Meowpress.\n' > content/posts/first.md
bunx --no-install meowpress build
```

Meowpress builds `dist/index.html` and `dist/posts/first/index.html`. Put short notes in
`content/thoughts/` and public skills in `skills/<name>/SKILL.md`. `llms.txt` and `agents.md`
describe the generated site. The default theme includes `404.html` for static hosts that serve a
custom error page.

Run `bunx --no-install meowpress preview` to serve the built files at `http://127.0.0.1:4173`.
Run the build again after editing content. Deploy the `dist/` directory to a static host.

## Configure an existing repository

Place `meowpress.config.ts` in the project root when your content lives outside the default
folders or when you want to change the site name. This example uses `blog/` for posts, `notes/`
for short notes and `blog/assets/images/` for the homepage image.

```ts
import { meowSite } from "meowpress/build";

export default meowSite({
  content: {
    directory: ".",
    postsDirectory: "blog",
    thoughtsDirectory: "notes",
    assetsDirectory: "blog/assets",
  },
  site: {
    name: "My site",
    images: { hero: "images/cover.svg" },
  },
});
```

The directory names in `content` are relative to its `directory`. Posts from `blog/` still have
URLs under `/posts/`, and notes still have URLs under `/thoughts/`. Meowpress copies `posts/assets/`
to `/posts/assets/`. Set `postAssetsDirectory` to change the source of those files. Posts and assets
whose paths contain a file or folder name starting with `_` are treated as drafts.

Pass a project path after `build` or `preview` to run from another directory. The project root
defaults to the current directory and is the base for relative config paths and output.
The CLI looks for `meowpress.config.ts`, then `site.config.ts`. Use `--config <file>` to choose a
file explicitly. `meowpress` and `meowpress --config ./site.config.ts` also build, and `preview`
accepts `--port <port>`.

Builds replace the generated output after they succeed. Meowpress reuses a nonempty default
`dist/` only when it contains the previous build's `agents.md` and `llms.txt`. If another tool
owns `dist/`, set `outputDirectory` to a separate directory and reserve it for generated files.

`includeProjectSkills: true` opts in to publishing `.agents/skills/`. Set `projectRootDirectory`
to choose the root for those skills. Set `notFound: false` to omit the built-in `404.html`, or
supply `notFound: { title, message, homeLabel }` to change its copy.

## Build from code

`meowSite()` resolves configuration and `buildSite()` writes the site. Both are exported from
`meowpress/build`. Use trusted local configuration and MDX, which execute code during a build.

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
- A page's optional `markdown` is the same page for agents. It is published next to the route
  (`components/button.md` for `/components/button/`, `index.md` for the root), and `llms.txt`,
  `llm.txt` and `agents.md` link it instead of the HTML. `llms.txt` follows the
  [llms.txt](https://llmstxt.org/) shape: the site summary, then one section of links per page
  `group` with each page's `description`. `llms-full.txt` holds every Markdown copy in one file.
- `agentGuide` is Markdown that opens `llms.txt` and `llms-full.txt` after the summary: what an
  agent must know before following any link, such as how to install and set up the documented
  packages.
- `mdxComponents` adds named components to the MDX content pages; the built-in `Callout` stays
  available.
- `themeStylesheet` names the theme stylesheet the build writes, so a consumer page can link it. It
  applies to the built-in pages as well, so a renamed stylesheet never leaves a page linking a file
  that was not written.

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
Font packages resolve from the project root first, then from this package, which carries the
default Geist.

## Independent verification

Once repository dependencies are ready, run `bun run --cwd packages/meowpress test` and
`bun run --cwd packages/meowpress typecheck`. Tests live in `tests/unit/`; real build tests create temporary content, themes and images through the public
`meowpress/build` entry,
covering Markdown, MDX, Thought output and draft page/asset exclusion, without reading Blog content or invoking the Blog build.
