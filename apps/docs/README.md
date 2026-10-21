# Meowland documentation

The documentation site for the Meowland packages. It is a private app: it is not published, and
nothing here deploys. It builds a static site into `dist/` and serves it over loopback.

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
| `theme.ts`                | The site theme: the standard theme, extended with the site layout.                  |
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
- The delivery is local. Publishing the site, or a deployment workflow, is a separate decision.

## The look

The pages wear the workbench's own clothes: the catalog rail, the search field, the breadcrumb in
the header and the preview frame are the same parts the Meowbook gallery is built from, and the
theme supplies the same surfaces, hairlines and type scale. The site adds only the layout a
reference needs — the reading column, the code panel and the API table — and every one of them
uses the shared tokens.

The catalog filter is the one piece of behavior the site owns: the search field is meowtail's
`SearchInput`, and the page matches the catalog entries with it. The matching runs in the page
itself, so the site stays a static directory.
