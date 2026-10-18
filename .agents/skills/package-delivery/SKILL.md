---
name: package-delivery
description: Change public exports, types, dependencies, CLI or package resources; verify clean tarball consumers or prepare the documented local release workflow. Not ordinary internal UI edits.
---

# Package contracts and local delivery

Determine the scope from the affected package's manifest, README and actual external usage. Each package has independent semver; Web ships with `meowjsx`, CSS adapters ship with `meowcss`, presentations belong to `meowslides`, and the root and showcase are private. An ordinary button fix is not forced into full-package release acceptance just because this skill exists.

## Verify the real consumption boundary

Both the JS and types of exports point at artifacts inside the official package; browser entries do not bundle Bun/Node/Playwright, and the declarations of core/CSS roots also stay environment-independent. Check peer ranges for shared core or opaque CSS values against the actual installation graph, not just identical package versions. Tools required to run the CLI are declared properly and not filled in by workspace-root hoisting.

`files` should carry the required templates/HTML/fonts/notices and declarations, not the entire source repository as a fallback for missing assets. Meowbook builds its own canvas, photography and host types; MeowPress's MDX/themes/fonts and non-root cwd are real consumption boundaries; follow their READMEs and do not substitute in-repo compilation success for them.

Build, type and packing commands follow [development checks](../../../docs/development-checks.md). Pack itself does not prove a rebuild happened; generate from one explicit source version and record the exact artifact. Valid evidence for already-frozen byte-identical artifacts may be reused; do not repeat the full matrix just because a document commit or summary changed.

When installed-state evidence is needed, install the actual tgz in an empty directory outside the repository, without source aliases, adjacent checkouts, parent `node_modules` or escaping symlinks. Verify the affected public subpaths/types and consumer-observable behavior; when necessary, pass a Signal/Context or token/fragment through the package boundary. State which third-party caches, overrides and simulated hosts were used, and do not treat fixture feedback as a real backend pass.

## Versions and publishing

The maintainer or Agent prepares independent versions in the affected packages' source manifests, dependency ranges and release notes, and follows the current [local release](../../../docs/releasing.md) contract; every commit, PR or docs-only change does not need a version record. After build/pack and acceptance of the chosen artifacts, list packages and target versions explicitly in the release manifest and hand them to the single local release script to check the source manifest, tarballs, targets and dependency ranges. The script does not infer version coordination; skills do not invent another version algorithm, fixed version group, command table or release ledger.

Actions on regular push/PR only build/lint, do not deploy, and do not publish automatically from tags; npm publishing only goes through the user's explicitly authorized manual workflow_dispatch + Trusted Publishing OIDC. Enter the script's execution mode only when this task has authorized real publishing; otherwise stop at its local dry-run/read-only plan; configuring npm trust, pushing and triggering a release follow this task's authorization separately. Chosen versions and tarballs are not repacked just because publishing starts. Alpha and stable releases use the explicit dist-tags from the release contract; the local script no longer manages Git tags/GitHub Releases. Resume an interrupted run along the same verified identity, without overwriting published versions or blindly re-publishing.

A queryable name, an existing license decision in code, or a locally available package does not automatically grant this account publishing rights. Read current blockers from the root README, the release contract and actual receipts, and do not turn a one-off tool rejection or historical npm query into permanent policy. Keep third-party licenses; established user decisions are not rewritten because of skill examples.

Return this run's packages/versions, source and artifact identity, actual consumer environment, pass/fail/reused evidence and uncovered scope; when publishing was not authorized or not executed, state clearly that the result stops at local delivery.
