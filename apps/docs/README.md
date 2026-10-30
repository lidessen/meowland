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

| File                      | What it owns                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `build.ts`                | The build order: discover the stories, generate the site, then build the galleries.     |
| `catalog.ts`              | The story manifest and the component registry become the component reference.           |
| `code.ts`                 | The source of a story, sliced out of the story file at build time.                      |
| `families.ts`             | The Meowtail component families, read from its catalog, and the reading form of a name. |
| `favicon.ts`              | The site icon, written at the root of the output directory.                             |
| `icons.ts`                | The wayfinding icons: one per entry page, package and component group.                  |
| `parts.tsx`               | The blocks a page is made of: the preview, the code sample, the API table.              |
| `document.tsx`            | The page document: the head, the sidebar and the footer.                                |
| `pages.tsx`               | The page builders: the home page, the package pages, the component pages.               |
| `theme.ts`                | The site theme: the standard theme, the site layout and the Meow values.                |
| `site.config.ts`          | The Meowpress configuration, including the pages provider.                              |
| `serve.ts`                | The loopback static server.                                                             |
| `content/posts/packages/` | The hand-written MDX page of each package.                                              |

## The output

```
dist/
  index.html                     the home page
  packages/<pkg>/index.html      the package pages
  components/<kebab>/index.html  the component pages
  examples/<story>/index.html    the stories that compose several components
  gallery/                       the Meowbook playground and its live canvas
  gallery/slides/                the presentation playground
  llm.txt  llms.txt  agents.md   the agent-facing indexes
```

## The boundaries

- The site is a consumer of the library it documents. Its chrome is meowtail's own components,
  and its theme extends `standardTheme` rather than defining a second palette.
- The app never edits a story or a component. A story that changes changes the site with it. The
  stories follow Meowtail's [story metadata rules](../../packages/meowtail/AGENTS.md#story-metadata),
  so the playground groups them the way this site does.
- The package pages are the app's own MDX; the component pages are generated. When both would cover
  the same ground, the generated page wins.
- The [Meowtail component catalog](../../packages/meowtail/COMPONENTS.md) owns the maintained
  component list, its grouping and planned additions. This app generates the current reference from
  stories and component metadata, and reads the catalog's family tables for the sidebar and index
  groups, their order and which members are parts; it never infers a part from a name and does not
  maintain another planning inventory. A documented page the families do not list goes under
  "Foundations and parts", and a story that declares no `component` under "Composition examples".
- Vercel deploys this static site from the repository configuration. The GitHub build-and-lint
  workflow does not publish it, and the npm release workflow remains separate.

## The look

The pages and the playground are one site. The playground is Meowbook's gallery dressed through its
`gallery` config in `build.ts`: it carries the Meowland mark and leads back to the home page, its
catalog rail, header and breadcrumb use the same sizes as the pages, and each story links to the
page that documents it. Each example on a component page links the other way, to the same story
in the playground. The component and presentation playgrounds link to each other.

The appearance menu is one choice across the site: the pages, their live previews and the
playground read the same `localStorage` keys, so a theme or scheme picked on a page is the one the
playground opens with, and the reverse. The chosen theme paints the playground's own chrome as well
as its stories; the chrome keeps the system faces, since only the stories load Journal's web fonts.

Pages, the sidebar and the playground (through Meowbook's `componentLabel`) show names in their reading form: `CardAction` is "Card Action", while the
import line and the agent indexes keep the export name. A part the catalog lists, such as Card
Action, sits one step in under its family. An example is named by the topic before its story
title's "·". The filter and the site search ignore spaces and case, and the filter also matches the
catalog's task terms, so "CardAction" and "radio group" both find their page.

Each component group folds. Every group starts open; a group the reader folds stays folded from
page to page, except the one holding the current page. A filter query shows its matches
in folded groups too, and without the script every group stays open.

Each place keeps one icon wherever it appears. The entry pages and packages lead their sidebar
rows and home-page tiles with it; each component group carries its icon in its sidebar and index
heading, and its rows hang on a guide line that marks the current page in the accent.

The theme supplies the same surfaces, hairlines and type scale to every page. The site adds only
the layout a reference needs — the reading column, the code panel and the API table — and every
one of them uses the shared tokens.

The catalog filter is the one piece of behavior the site owns: the search field is meowtail's
`SearchInput`, and the page matches the catalog entries with it. The matching runs in the page
itself, so the site stays a static directory.
