# The Meowland documentation site

This round adds `apps/docs`, a local-first static documentation site for the six published packages.
The site is generated from the material the repository already owns: the story manifest that Meowbook
discovers, the component registry that meowtail publishes, the contract documentation in the
package READMEs, and the code of every story. Nothing in the site is written twice: a component page
shows the live canvas of a story, the source of that story, and the style axes of the contract that
the component declares.

## The seam

Two engines do the work and the app owns the information architecture. Meowpress owns the build
pipeline: it reads content, renders MDX, stages assets, bundles the pages, writes the theme
stylesheet and publishes the agent-facing indexes. Meowbook owns story discovery and the live canvas.
`apps/docs` owns the page map, the prose, the theme and the component-page generator.

The site is a consumer of the library it documents. Its chrome is assembled from meowtail's own
components — `ResourceCard` for the package cards, `Card` for the preview frame, `Table` for the API
reference, `Badge` for the version marks, `Link` for the references — and its theme is one MeowCSS
assembly that extends `standardTheme` with the site layout instead of defining a second palette. The
site therefore shares one token set, one radius scale, one type scale and one light/dark scheme with
the components it documents. The visual language is Meowland's own; only the information structure of
a component page — a sidebar, a title, a large live preview, the code behind it, an install line, the
variants and the API table — follows the familiar shape.

## The Meowpress extension

Meowpress gained three additive fields on `SiteConfig`. `pages` is a provider that receives the
content that was already loaded and returns complete documents; `mdxComponents` adds named components
to MDX content pages; `themeStylesheet` renames the stylesheet the build writes, so the site is not
called "blog". The name reaches the built-in pages too, so a renamed stylesheet never leaves a page
linking a file the build did not write.

The provider owns the whole site map. When a consumer supplies pages, Meowpress does not publish its
own blog routes next to them, because two owners of one route space collide at `index.html` and leave
empty sections behind. The provider receives `posts`, `thoughts`, `site` and `theme` and nothing
else; the context stops at the types the public entry already exposes, so the extension does not make
an internal type public.

A page path is a route, not a file name, and it is written inside the generated directory. A path
that resolves above that directory is refused rather than clamped, because a silently rewritten route
is harder to notice than a refused one. The check resolves the path against the generated directory
and compares the result, so `../` and a `..` in the middle of the path are both caught.

Exporting the content loader instead was rejected: it would duplicate the parts of Meowpress worth
reusing — asset staging, the font and its license, the agent indexes, the `Bun.build` step — and
leave the package contributing only an MDX compiler. Building the site directly in MeowJSX would mean
not using Meowpress at all. The provider seam keeps Meowpress as the site pipeline and the app as the
information architecture, which is the split the repository's own boundaries describe.

## The Meowbook correction

The Meowbook gallery fetched `/manifest.json` and pointed its canvas at `/canvas.html`, both absolute
paths from the server root. A gallery served from a subdirectory therefore could not load its own
manifest, and the catalog stayed empty. The three paths are now relative to the document, so the
gallery works at the root of a Meowbook build and at any depth inside another site. This is a
correction, not a new capability: the standalone build resolves to the same files as before. The two
static links in the gallery shell — the brand and the standalone preview — became relative for the
same reason; the standalone preview was already replaced at runtime, so only the static fallback
changes.

## The preview is a separate document

Every example embeds the Meowbook canvas in an iframe. The canvas is a separate document with its own
runtime and its own theme root, which is the isolation Meowbook already guarantees: the page that
shows an example never shares a render graph with it, and the documentation page never carries a
second copy of the runtime. The canvas is the library's own story environment, so the stories keep
the fixture styles they are written against; an embedded canvas leaves out the in-canvas theme
toolbar, which would otherwise repeat in every frame.

One canvas per example is a cost, and it is the cost of the isolation. The Meowbook protocol carries
`inspect` and `measure` from the parent to the canvas and has no message that loads a story, so a
single shared canvas would mean a new published contract in Meowbook. The cost is bounded instead:
`loading="lazy"` defers the frames, and the preview frame has a fixed height so a composed scene
does not push the page down. The frame height is chosen by the group the story declares, which means
a new group of composed scenes would be shown in the short frame until the list of groups grows.

## The boundaries that hold

The app copies no component implementation and no story. It reads the manifest and the registry and
points at them. The package pages are hand-written MDX under the app's own content directory, and the
component pages are generated from the manifest, so the documentation structure and the workbench
structure cannot drift apart. The site is local only: nothing in this round deploys it, and no
package is published by it.

A component page is titled by the name the registry and the stories use, not by the URL segment. The
registry names its contracts in kebab case, so a component no story covers would otherwise be titled
`app-bar` while the rest of the site calls it `AppBar`. The display name comes from the same registry
map the stories use, so the two agree by construction.

The site addresses its own pages from the root, so it is served at the root of a host. A site under a
sub-path would need relative addresses; the Meowbook correction above points at the way that is done.

## The review

This work was reviewed by an independent challenger, which read the implementation and the contracts
it touches. It confirmed the seam, the build order, the catalog and the module identity, and it found
four defects that are now closed: the page-path guard did not work, because resolving a path against
the root clamps `..` instead of exposing it; a generated page claimed a registry entry for the five
components that have no contract, and contradicted itself two lines above; the agent-facing indexes
advertised six `/posts/` routes that the consumer's site map does not publish; and the app's own
tests were never typechecked. It also found that a renamed theme stylesheet left the built-in pages
linking a file the build never wrote, that the theme had two paths to one definition, and that the
documentation build was not exercised in CI. Those are closed as well.

Two of its findings are recorded rather than changed. The consumer that supplies pages owns the whole
site map, which is surprising for one optional field; the alternative — making the field additive —
would let two owners write the same route, and the field is documented instead. And the documentation
build is now in CI, but the site is still served from the root of a host.

The acceptance run found one more defect, in the package rather than in the app. The built-in pages
addressed the theme stylesheet at a fixed depth, which is wrong for a post whose slug has more than
one segment and for the list pages, and the stylesheet name was a literal in eight places. The depth
is now derived from the page's own path, so a renamed stylesheet reaches every page that links it.

## The restyle

The site was built from the library's parts but did not look like the library: the chrome was a
generic two-column page with uppercase labels and blue underlined links, while the workbench the
same components make is dense, quiet and hairline-separated. The restyle puts the workbench's own
clothes on the site instead of inventing a second look for it.

The catalog rail is the gallery's rail: a 240px sticky column with the brand mark, a search field,
a labelled count and the group headings, with 32px rows, a soft `primarySoft` background and a
2px `primary` bar on the current page. The header is the gallery's header: a 56px sticky bar that
carries the breadcrumb and a link to the workbench. The title block is meowtail's own
`PageHeader`; the code panel, the install chip, the API table, the badges and the package cards
are the components the site already used, restyled by the site theme rather than by new CSS.

The rules that were added are the ones the library does not ship: the reading column, the code
panel, the install chip and the two fine adjustments the workbench itself makes — the muted
middle level of the trail and the current-page bar. The components keep their own look; the site
only arranges them.

Two decisions are worth naming. Navigation inherits the ink of its container and a reference link
says so itself, so the anchor reset excludes meowtail's `Link` part instead of overriding it.
And the catalog filter is the one behavior the site owns: the field is meowtail's `SearchInput`,
whose own contract says the matching belongs to the consumer, and the matching runs in the page
itself so the site stays a static directory.

The restyle changed no contract, no route and no story. The verification is the same as before:
the build, the checks, the Han sweep, the link check over the built pages, and a browser pass over
the home page, the package pages, a component page, a metadata-only page and an example page, in
both schemes and at 390px.

## The release status

The Meowpress extension is additive and backward compatible: without `pages` the package behaves
exactly as before. The published `meowpress@0.1.1-alpha.1` does not carry it. This round records the
contract and the acceptance; publishing it is a separate, explicitly authorized step.
