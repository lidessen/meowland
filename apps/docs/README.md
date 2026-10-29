# Meowland documentation

The documentation site for the Meowland packages. It is a private workspace app, not an npm package.
It builds a static site into `dist/` for local preview and for the existing Vercel `meowland` project
at [meowland.dev](https://meowland.dev).

## What it is made of

Two engines and one app.

- **Meowpress** owns the build pipeline: it reads the content, renders the MDX package pages, stages
  the assets, writes the theme stylesheet and publishes `llm.txt`, `llms.txt` and `agents.md`. This
  app supplies the pages through the `pages` provider and the MDX components through
  `mdxComponents`.
- **Meowbook** owns the story manifest and the live canvas. The site embeds the canvas in an iframe,
  so every example runs in its own document, with its own runtime and its own theme root.
- **This app** owns the information architecture: the page map, the prose, the theme and the
  component-page generator. It copies no component implementation and no story.

## Commands

```sh
bun run build     # build the site into dist/
bun run dev       # build, then serve dist/ on http://127.0.0.1:13004
bun run check     # type-check the stories Meowbook discovers
bun run test      # the app's unit tests
```

The site is a static directory. Any static server can serve it; `bun run dev` is only a convenience.

## Vercel deployment

Keep the Vercel project's Root Directory at the repository root. The root `vercel.json` selects a
static build, installs the checked-in Bun lockfile, builds the workspace packages before this app,
and serves `apps/docs/dist`. The build order is the same as the local check:

```sh
bun install --frozen-lockfile
bun run build
bun run --filter @meowland/docs build
```

Each docs route has its own `index.html`, so the deployment needs no single-page-app rewrite. The
existing `meowland.dev` project domain points at the production deployment; npm package releases
follow their separate manual workflow.

## The files

| File                      | What it owns                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `build.ts`                | The build order: discover the stories, generate the site, then build the galleries. |
| `catalog.ts`              | The story manifest and the component registry become the component reference.       |
| `code.ts`                 | The source of a story, sliced out of the story file at build time.                  |
| `favicon.ts`              | The site icon, written at the root of the output directory.                         |
| `parts.tsx`               | The blocks a page is made of: the preview, the code sample, the API table.          |
| `document.tsx`            | The page document: the head, the sidebar and the footer.                            |
| `pages.tsx`               | The page builders: the home page, the package pages, the component pages.           |
| `theme.ts`                | The site theme: the standard theme, the site layout and the Meow values.            |
| `site.config.ts`          | The Meowpress configuration, including the pages provider.                          |
| `serve.ts`                | The loopback static server.                                                         |
| `content/posts/packages/` | The hand-written MDX page of each package.                                          |

## The output

```
dist/
  index.html                     the home page
  packages/<pkg>/index.html      the package pages
  components/<kebab>/index.html  the component pages
  examples/<story>/index.html    the stories that compose several components
  gallery/                       the Meowbook workbench and its live canvas
  gallery/slides/                the presentation workbench
  llm.txt  llms.txt  agents.md   the agent-facing indexes
```

## The boundaries

- The site is a consumer of the library it documents. Its chrome is meowtail's own components,
  and its theme extends `standardTheme` rather than defining a second palette.
- The app never edits a story or a component. A story that changes changes the site with it.
- The package pages are the app's own MDX; the component pages are generated. When both would cover
  the same ground, the generated page wins.
- The [Meowtail component catalog](../../packages/meowtail/COMPONENTS.md) owns the maintained
  component list and planned additions. This app generates the current reference from stories and
  component metadata; it does not maintain another planning inventory.
- Vercel deploys this static site from the repository configuration. The GitHub build-and-lint
  workflow does not publish it, and the npm release workflow remains separate.

## The look

The pages and the workbench are one site. The workbench is Meowbook's gallery dressed through its
`gallery` config in `build.ts`: it carries the Meowland mark and leads back to the home page, its
catalog rail, header and breadcrumb use the same sizes as the pages, and each story links to the
page that documents it. Each example on a component page links the other way, to the same story
in the workbench. The component and presentation workbenches link to each other.

The appearance menu is one choice across the site: the pages, their live previews and the
workbench read the same `localStorage` keys, so a theme or scheme picked on a page is the one the
workbench opens with, and the reverse. The workbench chrome itself stays on the standard theme;
the chosen theme paints its stories.

The theme supplies the same surfaces, hairlines and type scale to every page. The site adds only
the layout a reference needs — the reading column, the code panel and the API table — and every
one of them uses the shared tokens.

The catalog filter is the one piece of behavior the site owns: the search field is meowtail's
`SearchInput`, and the page matches the catalog entries with it. The matching runs in the page
itself, so the site stays a static directory.
