# Alpha.1 OIDC publication

The user explicitly approved publishing and updating the three prepared alpha.1 versions. The exact source is `dd80d080bae3465dcb7329e142c157239a6c4750`; the [manual Actions run 39185612444](https://github.com/lidessen/meowland/actions/runs/39185612444) completed successfully with both prepare and publish jobs green. Its source is also the source of the accepted [preparation record](2026-10-18-alpha1-preparation.md) and the successful [normal build/lint CI](https://github.com/lidessen/meowland/actions/runs/39174791732).

## Published versions and bytes

| Package   | Published alpha | Latest before and after | SHA256 of the public tarball                                     |
| --------- | --------------- | ----------------------- | ---------------------------------------------------------------- |
| meowtail  | 0.2.0-alpha.1   | 0.1.0                   | 46e4a0598f0cb584aa14aaa7ebffe7367d02982ddf46288b6d5465f8926e9e42 |
| meowbook  | 0.1.2-alpha.1   | 0.1.1                   | 97ce9164542951179407563e780e4ce79a2faeb5dd529a5c45c9566dfa316264 |
| meowpress | 0.1.1-alpha.1   | 0.1.0                   | ca37b8e71d3c7ddaad02ee6068d49f7d57b073b8da85822c694102b8a2fcca5c |

Before dispatch, local HEAD and remote main matched the source, the tracked tree was clean, all three exact versions returned the registry's version-not-found response, and no other publication was running. The local release inspection had no blockers. Only Tail, Book and Press were selected, with the explicit alpha channel.

The runner's prepared manifest and three tarballs were downloaded and compared byte-for-byte with the previously accepted frozen batch. The publish job downloaded that original artifact and did not repack it; its resulting manifest and files were checked again. Public registry tarballs match the runner and frozen bytes, and SHA512 integrity matches the actual downloads. All alpha tags point to the versions above; every latest tag matches its saved preflight value.

Existing Trusted Publishing was used with Node 24.21.0 and npm 11.21.0. Each package had one npm publish invocation, returning HTTP 202; the workflow then waited with public registry reads rather than uploading again. Tail was verified after 4 visibility reads, Book after 14 and Press after 5. No tag repair, token fallback, trust/security change, Git tag, GitHub Release or deployment was performed. Slides was not selected and its bootstrap was not executed.

Public metadata identifies GitHub Trusted Publishing. The public SLSA statements were inspected: source commit, invocation run and subject SHA512 match this batch. This is a matching public-provenance check, not a separately claimed Sigstore signature-verification session.

## Independent registry consumption

A separate reviewer installed exact `meowtail@0.2.0-alpha.1`, `meowbook@0.1.2-alpha.1`, `meowpress@0.1.1-alpha.1`, and registry JSX/CSS `0.1.1-alpha.0` into a fresh empty-cache directory `/tmp/meowland-alpha1-registry-five-4lihc2rg`. All dependency resolutions are official registry URLs; no file dependency, source alias, workspace link or override substitutes for a public version. Lifecycle scripts were disabled.

Acceptance passed for:

- Native Node/Bun public imports and shared Signal/Context/component/theme identities.
- Strict core without DOM, DOM, tool and new composition types under Bundler and NodeNext.
- Public composition SSR and SVG namespaces, including IconSource and the Lucide boundary.
- Actual installed Book CLI list/check and public build, with English gallery/canvas documents.
- Press CLI builds from a nested working directory, including Markdown/MDX, assets, drafts, Geist/OFL, custom themes and identical public CSS paths/functions.
- One installed copy of each shared package, exact installed-file comparisons with verified public tarballs, and no escaping links or parent node_modules.

The earlier limited Chromium behavior evidence was explicitly reused only because these runtime bytes are identical. This publication does not claim a fresh full UI/media matrix, real iOS keyboard or assistive-technology session. No fresh browser service was started by this registry-consumer pass.

## Evidence and scope

Ignored evidence is preserved under `artifacts/releases/20261019-alpha1-oidc-39185612444/`: original runner and publication artifacts, publication log, run identity, runner-versus-frozen byte proof, and the independent `consumer/verification-summary.json`. The consumer directory also contains registry/tag/integrity checks, public provenance, commands, the exact dependency tree and lock, package audit, and the explicit browser-evidence reuse boundary. The original preflight baseline remains in `artifacts/releases/20261019-alpha1-oidc-preflight/`.

Tail and Book availability was reported as each became public, followed by the complete three-package result to the already-authorized Rossovia task. Rossovia source and dependency changes remain owned by that task; this publication pass did not edit that checkout. This receipt and README status are a documentation-only follow-up and do not replace the published source SHA or frozen tarballs.
