# Meowpress Journal blog

## Decision

Replace the built-in Blog presentation with Meowtail Journal. Meowpress continues to own the
content, routes, static documents, timeline filtering and skill browser. Meowtail owns Page,
PageHeader, Container, Entry, EntryList, Section, Prose, MetaRow, Tag and Button structure and
styling. The old Blog token palette, doodles, paper texture and card styles are removed.

An independent boundary review agreed that this needs neither a Meowtail component fork nor a new
theme framework. The important counterexample was static rendering: mounting Journal CSS over the
old HTML does not produce component parts or option carriers. Each document now renders through a
selected-component `createMeowUI` runtime and uses the `meowui` theme root and page marker.
The theme assembles Journal's original token objects and component fragments with only host-owned
navigation, page edges and skill-browser layout. A consumer-supplied page map still owns its routes.

The built-in font manifest is Journal's own: Newsreader normal and italic, Inter and JetBrains Mono.
They are package dependencies, emitted as hashed local assets with their licenses. Custom themes
continue to default to no fonts; `fonts: []` explicitly suppresses font delivery.

## Verification

- The complete repository build and check passed: formatting, lint, types and 858 unit tests.
- The Meowpress unit/build suite passed 22 tests and 215 assertions, including real SSR parts and
  option carriers, nested content paths, custom themes and all Journal font files and licenses.
- A local build of the current readme content preserved six thoughts and its public skills. Eight
  routes were checked at 1440px and 375px in light and dark modes, including the home feed, both
  archives, a thought, About, the skills index, a skill detail and 404. These 32 browser cases had no
  horizontal document overflow. Repeated filtering and skill file/view switching worked.
- The permanent Playwright suite passed 16 cases across the same four viewport/scheme combinations,
  covering repeated filters, file/graph switching, internal links and hash reloads, clipboard copy,
  wide tables/code, deep 404 routes and JavaScript-disabled reading. It is registered in the CI
  browser matrix.
- Original browser screenshots were inspected. The home artwork moved into the editorial header
  instead of consuming a separate empty row. Skill Markdown headings now nest beneath the page
  heading. The skill graph retains its readable intrinsic size inside a keyboard-scrollable region
  instead of shrinking an entire graph into a phone-width diagram.

- An isolated local tarball consumer passed with the published Meowtail, MeowCSS and MeowJSX
  dependencies. It verified public exports and declarations, shared theme identity, the nested-cwd
  CLI, Markdown/MDX, drafts, images, and local Journal font files and licenses.

The package version for this change is `meowpress@0.3.0-alpha.4`; it consumes the existing
`meowtail@0.4.0-alpha.2` and its compatible CSS/JSX peers. Local checks, installed tarball acceptance,
registry publication and the personal site's deployment remain separate stages. This source record
does not claim that a package has been published or a site has deployed.
