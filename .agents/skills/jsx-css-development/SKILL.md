---
name: jsx-css-development
description: Develop or debug MeowJSX core/Web rendering, reactive lifecycle and module identity, generic JSON descriptions, or MeowCSS generation and adapters. Authoring a Meowtail component or its styles starts in the UI skill and the Meowtail component-model and styling sections.
---

# JSX and CSS mechanism development

Authoring a Meowtail component or its styles is UI work. Start with [UI development](../ui-development/SKILL.md) and the [component model](../../../packages/meowtail/AGENTS.md#component-model-meowjsx-is-not-react) and [styling](../../../packages/meowtail/AGENTS.md#styling-meowcss-is-not-ordinary-css) sections. This skill is for changing the MeowJSX or MeowCSS mechanism itself.

Start from the actual consumer failure or new usage to locate the responsible layer; do not decide package splits from file names. Read the current contract of [MeowJSX](../../../packages/meowjsx/README.md) or [MeowCSS](../../../packages/meowcss/README.md), along with nearby implementations and cases with independent value; when only one layer is involved, do not load the other layer's full material.

## First protect environment and identity

Core values, reactivity, Context and the target-neutral renderer seam stay in the `meowjsx` root; DOM/event/HTML/mount stay in `meowjsx/web`. A subpath of the same package does not mean the root may import Web back, and publicly declared type dependencies are also environment boundaries.

The MeowCSS root keeps pure tokens/options, parameter fragments and CSS/theme generation; `meowcss/meowjsx` carries component contracts/registry/carrier, and `meowcss/web` carries DOM lifecycle. Concrete UI token values, parts instances, themes and semantic layouts belong to Meowtail. Do not convert typed fragments to strings early to bypass types or component bindings.

Follow the real import graph to confirm the root, runtime, JSX runtime, Web and CSS adapters reference the same internal implementation. Two physical copies of the same version can still split Context or token identity; do not patch this with a global singleton, and do not forbid legitimate multiple explicit Runtimes.

## Verify changes by consumer

- For renderer/reactive changes, check observable output, updates, reordering and unmount; preserve node/focus/Context and cleanup relationships according to actual risk, and do not substitute private structure snapshots for behavior.
- For type-boundary changes, actually compile DOM-free core/CSS consumers and the related Web consumers. A package's full typecheck or `--check --package` is not automatically a DOM-free check; see [development checks](../../../docs/development-checks.md) for exact commands and coverage.
- When public cross-entry identity changes, verify it by passing real Signals/effects, Providers or TokenSets/fragments through the entries; identical version lists are not proof. Internal algorithm fixes alone do not automatically require repacking all five packages.
- For the generic JSON mechanism, read [MeowJSX JSON](../../../packages/meowjsx/JSON.md): description, validation, binding/action references and lifecycle are carried by the existing contract. Do not infer that a runtime schema already exists from TS types, and do not fill gaps with eval, dynamic import, arbitrary host paths or raw HTML. The concrete UI catalog's supported set goes back to [UI development](../ui-development/SKILL.md).

If public contracts, responsibilities or lifecycle change, converge the impact per [design-change](../design-change/SKILL.md); direct local fixes to established mechanisms proceed immediately. In the handoff, state consumer changes, environment and identity verification, necessary downstream impact and unverified parts; do not expand "compiles" into "passed in the browser or installed state".
