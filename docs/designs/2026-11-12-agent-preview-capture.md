# Screenshots and mock data for agents building with Meowland

Status: proposed. The challenger review and the implementation outcome are recorded in the last
section.

## The problem

An agent that builds an application with Meowland cannot see what it made. The consumer skill ends
with "open the page in a browser", which an agent in a terminal cannot do, and the failures that
matter most (a missing theme, a broken narrow layout, an empty list because the data never
arrived) do not show in types or unit tests.

Meowbook already photographs stories, temporary components and running pages, and its capture is
more thorough than this task needs. What stops an application agent from using it is the distance
to the first picture:

1. **Two files before anything renders.** Every command needs a config with `root`, `stories`,
   `preview` and `tsconfig`, plus a `preview.ts` that repeats the application's own runtime setup.
   The CLI's default config name is `story.config.ts`, while every document says
   `meowbook.config.ts`.
2. **No place for data.** A temporary component takes JSON props, which covers components that
   display facts. A page that calls `fetch` renders its loading or error state, and the README
   leaves mocks to the consumer without giving them a seam with a lifecycle.
3. **The picture is hard to find.** The plain output prints the report and manifest paths, not the
   PNG. An agent must pass `--json` and dig `artifacts[0].frame` out of the receipt.
4. **The consumer skill does not mention any of it.**

The expected behavior: in a project that has `meowtail` and `meowbook` installed and a
`tsconfig.json`, one command with no setup prints the path of a PNG of a component or of the whole
app, and one more file gives that scene its data.

## The contract

### 1. Config resolution and the built-in preview

`--config` becomes optional for `list`, `check`, `serve` and `capture`:

1. `--config <file>` when given (unchanged).
2. Otherwise `meowbook.config.ts` in the current directory, then `story.config.ts` (the previous
   default, kept so existing invocations do not change).
3. Otherwise built-in defaults: `root` is the current directory, `stories` is
   `["src/**/*.stories.{ts,tsx}"]`, `tsconfig` is `"tsconfig.json"`, and there is no `preview`.

Under built-in defaults there is no config file: `configFile` is undefined, the manifest omits
`references.config` and records `input.config: "builtin"`, and the rerun command starts with
`cd <root> &&` because the root is the working directory. Artifacts still go to
`dist/meowbook/captures` under the root; the docs tell the consumer to ignore that directory.
With zero story modules and no temporary component, `check` and `serve` report "no stories found"
instead of running `tsc` on an empty file list.

`StoryConfig.preview` becomes optional. Without it the canvas uses Meowbook's built-in standard
preview (`src/web/default-preview.ts`, published as the `meowbook/web/default-preview` export and
imported by that package specifier, because a file inside Meowbook's own install fails the
config-root check). Nothing is added to the type-check `files` for it. The preview is a fresh runtime with `createMeowUI({ components:
meowUIComponents })`, the standard theme mounted on the document, the theme attributes on the
document element and focus modality installed, all released through `onCleanup`. It uses
`mountStyles`, `applyTheme` and `installFocusModality` rather than `createMeowUITheme`, so the
existing `meowtail` peer range still holds. `applyTheme` rewrites every theme attribute, and
`standardTheme` defaults to `scheme: "auto"`, so the preview first reads the
`data-meowui-color-scheme` the canvas may already have set from the gallery's `scheme` parameter
and passes it as the selection, falling back to `auto`. Under capture that is `auto`, which follows
`prefers-color-scheme`, so `--color-scheme dark` photographs the dark theme.

The generated canvas entry imports the built-in preview with a dynamic import only when the config
has no `preview`, so a consumer preview does not pull the whole component set into its bundle. The
module resolves `meowtail` from the consumer's install like the rest of the canvas, so there is one
component identity, under the same assumption the canvas already makes for `meowjsx`: the
consumer's `meowtail` satisfies Meowbook's peer range and is hoisted beside it.

A temporary component without a props file is rendered as `<Target />` with no `satisfies` clause.
Today the generated source checks `{} satisfies Parameters<typeof Target>[0]`, which fails for a
component that takes no parameters, such as the skill's own `App`.

A project with its own theme, host components or providers still writes `preview.ts`; the built-in
preview is the standard-theme default, not a second way to configure a runtime. A missing
`tsconfig.json` stays an explicit error that names the file.

### 2. Story mocks

`Story` gains `mocks`, a table from route to answer, applied to `fetch` for the life of the story:

```tsx
export const Loaded = defineStory({
  id: "users/loaded",
  mocks: {
    "GET /api/users": [{ id: 1, name: "Ada" }],
    "GET /api/users/:id": ({ params }) => ({ id: Number(params.id), name: "Ada" }),
    "POST /api/users": () => Response.json({ id: 2 }, { status: 201 }),
    "GET /api/slow": () => new Promise(() => {}), // stays loading
    "GET /api/broken": () => new Response(null, { status: 500 }),
  },
  render: () => <UsersPage />,
});
```

- **Route.** `"<METHOD> <path>"` or `"<path>"` for any method. The path is matched against the
  request URL's pathname, whatever its origin; the query string is ignored. `:name` matches one
  segment and is decoded into `params`; a final `*` matches the rest. A route that starts with
  `http://` or `https://` must also match the origin. The first matching route in declaration order
  wins. A malformed route fails the story before it renders.
- **Answer.** A JSON value becomes a `200` JSON response. A function receives
  `{ request, url, params }` and returns a JSON value, a `Response` used as is, or a promise of
  either; `undefined` becomes an empty `204`. A function that throws rejects the `fetch` like a
  network failure. Status, headers and delay need no descriptor type: they are a `Response` and an
  `await`.
- **Lifecycle.** The canvas installs the interceptor after it loads the story and before `render`,
  and restores the original `fetch` in the environment scope, which is released after unmount, so
  requests made during unmount still see the mocks. A request that matches no route goes to the
  real `fetch`. A function that throws makes `fetch` reject with a `TypeError` whose `cause` is the
  thrown value.
- **Limits.** Only `fetch` is intercepted. `XMLHttpRequest`, `WebSocket`, `EventSource`, images,
  fonts and navigation are not; requests made by the preview or while the story module is being
  imported are not; a `fetch` reference a module captured at import time is not. Mocks are story
  code, so they are trusted like the story.

The temporary component entry gets the JSON subset: `--mocks-file <file>` next to `--props-file`,
a JSON object from route to JSON value, resolved inside the config root and recorded in the
manifest by path and hash like the props file. It travels everywhere `--props-file` does:
`TemporaryStory`, the generated story, `serve`'s temporary flags, `input.temporary`,
`references.mocks` and the rerun command. Functions need a story.

Mock data stays with the host, as before: Meowbook provides the seam and its lifecycle, the
consumer writes the routes and the facts. Meowtail components still do not fetch.

### 3. What the capture reports about requests

Counting starts when the interceptor is installed, so the preview's own requests never appear. A
story or component capture scene gains (`--url` capture does not):

```ts
requests?: {
  mocks: { route: string; hits: number }[];
  unmocked: { method: string; url: string; count: number }[];
};
```

`unmocked` holds origin and pathname without query or fragment, at most 50 distinct entries. It is
present when the story has mocks or any request went unmocked. This is the fact an agent needs
when a page photographs as empty: which request had no answer. It travels through the capture
snapshot like `replacements`, and the offline report shows it next to the replacement log. A route
with zero hits is reported, not judged. Pathnames can carry identifiers; like the rest of the
capture artifacts, this fact is not desensitized. `serve` does not stream requests to the gallery.

### 4. Output an agent can act on

Plain `capture` output adds one line per photographed scene with the absolute path of the viewport
PNG (and the full-page PNG when requested), a line for each failed scene with its error, and a
line for unmocked requests. `--json` gains the same `requests` field per artifact. Nothing is
removed from either form.

### 5. The path the skill teaches

The consumer skill's "Check the result" section and the Meowbook README lead with the short loop:

```sh
bun add -d meowbook@dev
bunx --no-install playwright install chromium   # once
bunx --no-install meowbook capture --component src/app.tsx --export App
bunx --no-install meowbook capture --component src/app.tsx --export App --viewport 390x844 --color-scheme dark
bunx --no-install meowbook capture --story users/loaded
```

then: read the printed PNG; when a page needs data, write a `src/*.stories.tsx` with `mocks`; when
the real application is already running with its backend, use `capture --url`, where a `--pages`
plan can call Playwright's `page.route`. A whole app is photographed as a story or temporary
component that renders its root component, which is why the skill keeps `App` in its own module
apart from `main.tsx`.

## What this does not do

- **No routing seam.** A story renders at `/canvas.html`. An app that chooses its page from
  `location` photographs each page as its own story for now. A `url` field on stories is deferred
  until a consumer needs it; it has to answer what a reload of the canvas does.
- **No inline `--props` string.** The manifest deliberately does not copy props content, and an
  inline value would have to live in the rerun command.
- **No HMR and no new server.** `serve` is unchanged.
- **No version change or publication.** Releasing follows `docs/releasing.md` separately; until
  then the skill text describes source newer than the published `dev` tag and says so.

## Work packages

One implementer owns all of it; the packages are ordered by dependency.

1. `types.ts`, `cli.ts`, `bun/build.ts`, `bun/discover.ts`, `bun/capture.ts`,
   `web/default-preview.ts`, `package.json` exports: config resolution, optional preview, the
   props-less temporary component, `--mocks-file`. Unit tests for CLI parsing, the
   `meowbook.config.ts` / `story.config.ts` / built-in order, and `check` of a fixture project with
   no config and a component that takes no props.
2. `web/mocks.ts` (pure matcher and interceptor), wiring in `web/canvas.ts`. Unit tests for
   matching, answers, order, restore.
3. `capture/types.ts`, `web/capture.ts`, `capture/page.ts`, `capture/report.ts`, `cli.ts`: the
   `requests` fact and the plain output. A browser capture spec with a fixture story that has one
   mocked and one unmocked request.
4. Meowbook README, the docs-site Meowbook page, the consumer skill and anything the docs tests
   derive from them.

Acceptance is observed, not inferred: in a scratch consumer with no Meowbook config, the three
commands above each print a PNG; the pictures are opened and show a themed component in light,
dark and at 390px; the mocked story shows its data and the receipt names the unmocked request.

## Review and outcome

An independent challenger read the first draft against the source (without running it) and
required these changes, all now in the contract above: the absent config file in capture
references and rerun commands; the preview import by package specifier and its absence from the
type-check files; the scheme attribute that `applyTheme` would overwrite; the generated
`satisfies` that rejects a component with no parameters; the empty-stories check; counting from
interceptor install rather than boot; restoring `fetch` after unmount; `--mocks-file` in every
place props travel; the privacy sentence; and the `{ts,tsx}` glob. It also judged streaming each
request into the `serve` gallery unnecessary, and it was dropped. The single-`meowtail`-identity
assumption is stated rather than solved.

Implementation outcome: pending.
