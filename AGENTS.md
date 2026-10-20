# Meowland development entry point

This is a standalone UI capability library. Start with the [root README](README.md), the owning package's README and any deeper AGENTS file; then load methods per task from the [skill index](.agents/README.md). Do not pre-read all skills or historical records.

## Boundaries that break easily

- The MeowJSX root and its types do not depend on the DOM; Web goes explicitly through `meowjsx/web`. The MeowCSS root does not depend on JSX, UI or the DOM; components and Web adaptation are carried by subpaths.
- Before writing a Meowtail component or its styles, read the [component model](packages/meowtail/AGENTS.md#component-model-meowjsx-is-not-react) and [styling](packages/meowtail/AGENTS.md#styling-meowcss-is-not-ordinary-css) sections. Setup runs once per mount, and the theme paints parts and tokens.
- One render graph shares core modules; one theme assembly shares CSS token/fragment identity. Entry points must not be inlined into multiple runtimes, Contexts or Symbol/WeakMap copies. Explicitly creating multiple Runtimes is still valid isolation.
- Meowtail owns generic structure, the complete Assistant, concrete themes and semantic layout. `apps/showcase` and stories only pass scenario data and drive interactions; they do not copy component implementations. Backend, business facts, permissions, uploads and persistence stay with the host.
- Meowslides owns presentation playback, presentation content layouts, reveals, media and authoring tools; it depends one-way on Meowtail's generic capabilities. MDX is trusted local code; arbitrary uploaded or generated text is not executed by default.
- The JSON entry point reuses the same components and finite contracts; it does not turn arbitrary business JSON, functions or object paths into execution capabilities. The supported set is defined by the JSON documentation inside the package and the actual exports.
- Out-of-package consumption uses public exports. Third-party assets keep their own notices.

## English only

All human-readable repository content is English: READMEs and docs, AGENTS and skill guides, source
comments and JSDoc, user-visible strings (labels, placeholders, empty/error/status text), story and demo
copy, test titles and fixtures, console output and commit messages. Do not add Chinese prose, comments,
labels, fixtures or mixed-language sections.

- Apart from the upstream-skill exception below, the only non-English text allowed is third-party license/attribution kept verbatim, plus deliberate
  Unicode test payloads that must be non-ASCII to prove the behavior. Such a payload needs a short
  English comment explaining why it is intentional. Current approved files are
  [presentation-text.test.tsx](packages/meowslides/tests/unit/presentation/presentation-text.test.tsx)
  and [compiler.test.ts](packages/meowslides/tests/build/compiler.test.ts); any new exception is a
  review decision and must be reported, not added silently.
- User-authorized skill installation exception (2026-10-20): upstream content in only
  `.agents/skills/architecture/`, `.agents/skills/doc-writing/`, `.agents/skills/concept-naming/`
  and `.agents/skills/research-synthesis/` keeps its original language. These four directories are
  managed by the official Skills CLI from public [lidessen/skills](https://github.com/lidessen/skills),
  with their source recorded in `skills-lock.json`; do not translate or customize the installed copies.
  The five project-owned skills and all other project content remain subject to the English-only rule.
- Language changes preserve behavior and contracts: never rename APIs, identifiers, package names,
  exports, story `id`s or `data-*` names/values, and keep numbers, dates, versions, commands, links and
  the strength of claims unchanged.
- Reviewed migration exception (2026-10-18): the 15 `data-card-action`, `data-message-choice`,
  `data-message-action` and `data-action` display-copy payloads in the Tail card, chat-message, chat
  and foundation stories may be translated to English. Their attribute names stay unchanged and
  their values are only copied into visible feedback, never used as machine identifiers. This
  exception does not authorize changes to other `data-*` values.
- Markdown translation keeps heading anchors valid; update same-file anchors with the heading and
  reconcile cross-file anchors in the same change. Historical records may change language only, not
  chronology, scope or evidence.
- Before handoff, run the sweep and report its result when a change touches language-visible content:
  `rg -n '[\p{Han}]' --hidden -g '!.git' -g '!node_modules' -g '!.agents/skills/architecture/**' -g '!.agents/skills/doc-writing/**' -g '!.agents/skills/concept-naming/**' -g '!.agents/skills/research-synthesis/**'`. It must print only the approved test files
  above; anything else fails the change.

## Work by risk

Independent work may run in parallel; align the owner of shared files first and preserve unrelated WIP. For complex tasks, clarify the goal, dependencies and observable results first. When changing mechanisms such as responsibilities, public contracts or lifecycle, reach bounded consensus with an independent challenger first; routine implementation, local fixes and copy changes do not need to repeat the design process.

Check commands and coverage are in [development checks](docs/development-checks.md). For visual and interaction changes, actually open the relevant scenario; report static checks, behavior observation, installed-state acceptance and official release separately. Once the necessary checks hold, add tests only for new changes, failures or unresolved risks; do not repeat the full matrix in place of judgment.

The release contract is in [local releasing](docs/releasing.md). Actions on regular push/PR only build/lint; npm publishing only goes through the user-authorized manual workflow_dispatch + Trusted Publishing OIDC and does not deploy; building, packing, tagging or a draft Release does not equal a completed release. Commits, pushes and real releases still follow the authorization for this task.
