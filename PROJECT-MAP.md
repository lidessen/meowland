# Meowland Project Map

- Status: current
- Last verified: `3a1af58` / 2026-11-21
- Maintainer: meowland
- Strategic health: Healthy — six standalone Bun/TypeScript UI packages are published to npm (`alpha`/`latest`); Rossovia product-repository adoption remains host-owned.
- Purpose: Help technical decision-makers judge package boundaries, invariants, and release health; no daily todo lists or unverified claims.

> Detailed component and authoring rules live in [README.md](README.md) and [AGENTS.md](AGENTS.md).

## 1. Strategic Goals

- Problem: Provide a standalone, reactive UI, styling, presentation, component-preview, and static-site toolkit decoupled from any single product backend.
- Target state: Six independently consumable npm packages built over `meowjsx` signals and `meowcss` tokens, verifiable locally and via Playwright browser suites and publishable through OIDC Trusted Publishing.
- Non-goals: Hosting product backends, permissions, uploads, or persistent business state; executing untrusted remote MDX by default; adopting React runtime assumptions.
- Success criteria: Clean DOM-free core roots, single render/theme module identity across consumers, full `bun run check` + browser checks passing, and exact-source npm OIDC releases.

## 2. Architecture

```text
meowjsx (DOM-free reactive runtime; /web adapter)   +   meowcss (DOM-free token/CSS engine; /meowjsx, /web)
                                        ↓
                        meowtail (components, semantic layout, themes, /json)
                                        ↓
         ┌──────────────────────────────┼──────────────────────────────┐
    meowslides                     meowbook                       meowpress
(presentations & MDX)     (component gallery & inspect)     (Markdown/MDX static site)
```

| Part                   | Responsibility                                                                                   | Boundary / Non-responsibility                                             | Key Entry                                                                                                                       | Status    |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Core Runtime & Styling | Signals (`meowjsx`), token/CSS generation (`meowcss`), explicit `/web` adapters                  | Root entries must stay DOM-free; never duplicate runtime/theme registries | [meowjsx](packages/meowjsx/README.md), [meowcss](packages/meowcss/README.md)                                                    | Available |
| Component Library      | Generic UI components, Assistant, finite `/json` catalog, concrete themes                        | No product persistence, uploads, or arbitrary code execution from JSON    | [meowtail](packages/meowtail/README.md), [COMPONENTS](packages/meowtail/COMPONENTS.md)                                          | Available |
| Tooling Packages       | Slide playback/MDX (`meowslides`), showcase & screenshot (`meowbook`), static site (`meowpress`) | One-way dependency on lower packages; MDX is trusted local code only      | [meowslides](packages/meowslides/README.md), [meowbook](packages/meowbook/README.md), [meowpress](packages/meowpress/README.md) | Available |
| Showcase & Examples    | Private `apps/showcase` board, image-loading explainer, classroom courseware examples            | Pass scenario data only; do not duplicate `meowtail` implementations      | [apps/showcase](apps/showcase/README.md), [examples](examples/README.md)                                                        | Available |

## 3. Primary Work

- Maintain public exports, type declarations, component catalog, and llms-friendly Markdown documentation across the six packages.
- Maintain Oxlint/Oxfmt/TypeScript/unit/Playwright gates and manual OIDC npm publication workflows.
- Support downstream consumers such as the `readme` static site (`meowpress`).

## 4. Work Methods

- Component model: Read [packages/meowtail/AGENTS.md](packages/meowtail/AGENTS.md) before modifying components or styles (`setup` runs once per mount; signals and tokens drive updates).
- Verification: `bun run build` before `bun run check` (`format:check` -> `lint` -> `typecheck` -> `test`), plus `bun run --cwd apps/showcase check` and per-config Playwright suites ([development-checks.md](docs/development-checks.md)).
- English-only rule: Strictly English across all repository files, docs, UI copy, and commits, enforced by the `rg` Han sweep in [AGENTS.md](AGENTS.md) (only two approved Unicode test files and four upstream-installed skills under `.agents/skills/` are exempt).
- Cross-project conventions: Maintain `AGENTS.md` + `CLAUDE.md` (`@AGENTS.md`) + `PROJECT-MAP.md` triad; keep linear history on `main`; track cross-session work in `~/.workcells` (`task/local`) without credentials.

## 5. Core Mechanisms & Commands

- **Signal & theme integrity**: One render graph shares core `meowjsx` modules; one theme assembly shares CSS token identity without bundler inlining duplicates.
- **Public-export verification**: `typecheck` and unit tests consume built `dist` exports, requiring `bun run build` after source changes; package releases go through [releasing.md](docs/releasing.md).

| Command                                          | Purpose                                                    | Status    | Reference                                                |
| ------------------------------------------------ | ---------------------------------------------------------- | --------- | -------------------------------------------------------- |
| `bun install` / `bun run build` / `bun run pack` | Install deps, emit ESM + declarations, pack local tarballs | Available | [README.md](README.md#local-development)                 |
| `bun run check`                                  | Run Oxfmt check, Oxlint, TypeScript check, and unit tests  | Available | [docs/development-checks.md](docs/development-checks.md) |
| `bun run --cwd apps/showcase check`              | Verify private showcase board                              | Available | [apps/showcase/README.md](apps/showcase/README.md)       |
| `bun run test:presentation`                      | Browser contract tests for presentation runtime            | Available | [docs/development-checks.md](docs/development-checks.md) |

## 6. Changes, Risks & Health

- Recent changes: Published `meowpress@0.3.0-alpha.9` (`3a1af58`, 2026-11-13) alongside `meowjsx@0.3.0-alpha.2` and `meowcss@0.3.0-alpha.2`, consumed by `readme`; Assistant and finite JSON catalog landed locally in `meowtail` and `apps/showcase`.
- Drift risk: Violating English-only prose rules, leaking product backend coupling into packages, or shipping unbuilt `dist` artifacts.
- Known gaps: Product adoption switch in Rossovia remains pending externally; `meowslides@0.2.0-alpha.0` OIDC publish previously hit `ENEEDAUTH` (`0.1.0-alpha.1` remains the published Slides alpha).
- Verdict: **Healthy**. Package layering, English-only gates, and verification scripts are stable and clean.

## 7. Further Reading

- Entry & checks: [README.md](README.md), [AGENTS.md](AGENTS.md), [docs/development-checks.md](docs/development-checks.md)
- Releases & provenance: [docs/releasing.md](docs/releasing.md), [docs/local-migration-receipt.md](docs/local-migration-receipt.md)
