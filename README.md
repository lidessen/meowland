# Meowland

A standalone Bun / TypeScript UI toolkit repository. The original five packages have completed npm publishing, independent-registry consumption acceptance and official GitHub Releases; `meowslides@0.1.0-alpha.1` has also completed its first npm publication and independent-registry consumption check. The product switch is still pending; the original Rossovia product repository's source, services, official dependencies and Git remote have not been switched here.

## Packages

| Package                                       | Responsibility                                                                                                                                                                           |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`meowjsx`](packages/meowjsx/README.md)       | Platform-agnostic JSX / reactive runtime; browser capabilities are loaded explicitly through `meowjsx/web`                                                                               |
| [`meowcss`](packages/meowcss/README.md)       | Shared token / CSS generation, with additional `/meowjsx` and `/web` adapter entries                                                                                                     |
| [`meowtail`](packages/meowtail/README.md)     | Components, semantic layout and concrete standard themes; this round's complete Assistant and finite JSON catalog have completed local implementation and limited independent acceptance |
| [`meowslides`](packages/meowslides/README.md) | Standalone presentation playback, content layouts, reveals, media, themes and trusted local MDX authoring tools; first public alpha                                                      |
| [`meowbook`](packages/meowbook/README.md)     | Component showcase, inspection, browser preview and screenshot tooling                                                                                                                   |
| [`meowpress`](packages/meowpress/README.md)   | Markdown / MDX static-site build tooling                                                                                                                                                 |

The [Meowtail component catalog](packages/meowtail/COMPONENTS.md) lists the components by purpose
and records their current status.

[`apps/showcase`](apps/showcase/README.md) is a private showcase board, not a sixth published package. This round's complete Assistant and finite JSON-to-UI work have completed local implementation and limited independent acceptance; see the [local migration receipt](docs/local-migration-receipt.md) for the actual same-source inputs, artifacts and uncovered scope. Passing earlier mixed artifacts is not evidence for this round's same-source work, and does not mean the Rossovia product has switched or been released.

Browser presentations start from the [MDX authoring example](examples/presentation/README.md); authoring methods are in the [presentation-authoring skill](.agents/skills/presentation-authoring/SKILL.md). Regular authors maintain scripts, assets and any necessary MeowJSX interactive components; shared playback, default themes, builds and previews come from `meowslides`, with Meowbook used for extra review. [The image-loading explainer](examples/image-loading/README.md) is a complete five-page custom interactive work built around encoding, network-speed estimates and real controlled screen recordings; its source, dedicated animations and review tools each have an owner, while generic audio-track display lives in the package stories. This is the first browser deliverable; PPT export is left for later. [The package split and MDX design](docs/designs/2026-10-18-presentation-package-mdx.md) records responsibilities and trust boundaries; the early history is in the [original implementation receipt](docs/records/2026-10-17-presentation-authoring.md).

The courseware implementation is in [8B Unit 6 · Sunshine for all / Welcome](examples/sunshine-welcome/README.md): classroom activities authored against the verified lesson scope, with teacher-controlled hints and reference answers, while student input is retained by the work's signals; textbook sources, classroom adaptation and launch steps are documented separately in the example, and validation and limitations are in the [courseware receipt](docs/records/2026-10-17-sunshine-welcome.md).

Standard layouts, narrow-container catalog reflow and the settings overlay shipped with the shared presentation tooling are covered by the [layout re-review receipt](docs/records/2026-10-18-presentation-toolbar.md), which also covers the image presentation and the English courseware.

Another work for Grade 8 Volume 1 Unit 5 is the [Protecting pandas reading courseware](examples/protecting-pandas/README.md): growth, problems and consequences, protection measures and personal action, with classroom options expanding inline and hints/references/evidence retractable and restorable separately. Both courseware pieces are kept independently; see the [examples index](examples/README.md) for all presentation entries.

## Local development

Use Bun 1.4.2:

```sh
bun install
bun run build
bun run pack
```

The build outputs ESM JavaScript and declaration files and keeps the module graph; six tarballs go to the untracked `artifacts/`. These commands only build or pack local packages; they do not publish to npm. Package public entry points do not point at TypeScript source.

After the first install, maintainers run `bun run build` first, then `bun run check`, which checks format, lint, types and unit tests in order. Checks and automatic fixes are separate; engineering scripts, type environments, test scope and the build/lint-only CI are described in [development checks](docs/development-checks.md). `typecheck` does not cover every unit/prototype source; each package README lists its own check entries. The showcase board check uses `bun run --cwd apps/showcase check`, and browser checks run separately with each consumer's Playwright configuration. Listing commands does not mean every item passed in this round; verification must be tied to the actual input version, and passing old artifacts does not replace acceptance of the current source.

The source code comes from the library directory of the Rossovia repository and was migrated into a standalone directory; it does not use the original repository's workspace links, product backend or real data. Existing third-party notices are retained with the source.

## Release status

Current operations use [manual Actions + npm OIDC publishing](docs/releasing.md): explicit package selection and independent versions; prereleases use `alpha`, stable releases use `latest`. Regular pushes only check; subsequent publishing is triggered by a manual workflow and does not depend on long-lived npm tokens. Slides' user-authorized first-package bootstrap used direct npm CLI with user-handled 2FA and a revoked temporary login. The scripts do not manage GitHub Releases; the completed releases below remain historical facts. `meowjsx@0.1.1-alpha.0`, `meowcss@0.1.1-alpha.0`, `meowtail@0.2.0-alpha.0`, `meowbook@0.1.2-alpha.0` and `meowpress@0.1.1-alpha.0` have been published through Actions OIDC and accepted from the registry. `meowtail@0.2.0-alpha.1`, `meowbook@0.1.2-alpha.1` and `meowpress@0.1.1-alpha.1` were subsequently published under `alpha` by [the exact-source OIDC run](https://github.com/lidessen/meowland/actions/runs/39185612444) and passed independent registry consumption. Their public tarballs match the accepted local bytes; all `latest` tags remain unchanged. See the [publication receipt](docs/records/2026-10-19-alpha1-publication.md).

The authoring migration is published under `alpha` as JSX/CSS/Book/Press `0.2.0-alpha.0` and Tail
`0.3.0-alpha.0`. These versions replace component definers/contracts with ordinary functions and
static metadata, and replace theme recipes with class values and `cx`. The
[OIDC publication receipt](docs/records/2026-10-24-authoring-alpha-publication.md) records the exact
source, checks, public bytes and registry consumption. Slides `0.1.0-alpha.1` subsequently completed
its [first publication and registry consumption](docs/records/2026-10-25-slides-first-publication.md).
The earlier [authoring migration receipt](docs/records/2026-10-24-authoring-migration.md) retains the
implementation's original local acceptance scope.

The public source repository is [lidessen/meowland](https://github.com/lidessen/meowland). Current official versions are `meowjsx@0.1.0`, `meowcss@0.1.0`, `meowtail@0.1.0`, `meowbook@0.1.1` and `meowpress@0.1.0`, all of which have completed npm publishing, independent-registry installation acceptance and official GitHub Releases. The original JSX/CSS tags and assets remain unchanged; see the [release receipt](docs/records/2026-10-17-tail-book-press-publish.md) for this batch's exact candidates, artifacts and acceptance scope.

JSX `0.1.1-alpha.1` and Tail `0.2.0-alpha.2` are now published under `alpha` from [source `5b46614`](https://github.com/lidessen/meowland/commit/5b4661479035178a4e0aaa39ee39b4b691387842), with matching local/runner/registry bytes and isolated exact registry consumption accepted. JSX adds `derived`; Tail requires that new JSX baseline and includes the common component batch, live prop bindings, and the corrected Composer surface/actions/external hint. CSS, Book, and Press remain at their existing alpha versions, and all `latest` tags are unchanged. See the [publication receipt](docs/records/2026-10-19-jsx-tail-alpha-publication.md).

The earlier rejected Composer candidate and later local surface candidate are retained as historical evidence, not substituted for this newer upstream release input. The [surface correction record](docs/records/2026-10-19-composer-surface.md) and [superseded geometric receipt](docs/records/2026-10-19-composer-footer.md) keep their original source and acceptance boundaries. Product adoption remains owned by the consuming application.

The standalone UI package was renamed from `meowui` to `meowtail`, with public entries `meowtail`, `meowtail/chat`, `meowtail/json` and so on; `createMeowUI`, `installMeowUI` and the existing DOM/CSS markers remain compatible and are not merged into JSX/CSS. Book uses the new UI package and was published as `0.1.1`; the old UI and Book `0.1.0` drafts/tags are retained, not moved or overwritten. Press's earlier E409 is kept as history; after explicit authorization this batch retried only once and has now completed publishing and consumption acceptance. Later releases continue to follow [local releasing](docs/releasing.md) and do not overwrite assets with the same name and version.

Our own code is MIT-licensed; official packages carry the corresponding `LICENSE` and third-party notices; third-party assets continue to be governed by their original licenses. The differences between build, installation acceptance and official release are still recorded separately for each exact input in this round.
