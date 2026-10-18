# Local migration receipt

> Historical record: this page fixes the `meowui` candidate and acceptance identity as they were at the time; the original package name, source, and hashes are not rewritten after the rename. The current standalone UI package has been renamed to `meowtail`; this round's renamed-candidate build, installed-state acceptance, and release status are recorded separately, and old results do not pass as evidence that the new package has been published.

Status: this round's local implementation and bounded independent acceptance are complete. The source commit is `543a5773e412c8fa396b2de6975321c1983033ee`, from Rossovia's `046b044e1bfde8c79b186fab2948ba2260371790`. This page closes only on local results; it does not imply a public release, the Rossovia product switch, or full platform acceptance.

## Scope completed this round

The five packages are `meowjsx`, `meowcss`, `meowui`, `meowbook`, and `meowpress`. The Web source is merged into MeowJSX and consumed explicitly via `meowjsx/web`; the core root and types do not load the DOM. MeowCSS extracts the shared generation mechanism and necessary adapters; concrete themes, semantic layouts, and the complete Assistant remain in MeowUI.

`meowui/chat` provides the complete Assistant composition; default messages, safe Markdown, code, process, composer, attachments, activity/work details, and pending questions use the same implementation. The host continues to provide data, actions, permissions, and persistence; the Rossovia backend is not migrated in.

JSON builds the same components via `meowjsx/json` and a finite `meowui/json` catalog. The first slice is not a full UI schema or automatic reflection of arbitrary TS Props; by default there is no local File ingestion, and arbitrary HTML, code execution, or resolution of arbitrary host object paths is not exposed. JSON text interactions, bindings, and actions still use the host's explicit registration contract.

## Same-source and installed-state evidence

The author ran one same-source build of the five packages, root types, and pack from the frozen source; all exited 0. The source manifest contains 545 files, and an independent byte-by-byte check found no differences; earlier first/mixed-phase results were not used to stand in for this version.

- Source manifest: `/tmp/meowland-final-candidate.xYtXbO/source-final.sha256`, SHA256 `bbacf0bf805e7877aa48b6af1b1bb5d74af3df13c22b02bfe6c0d98cb4127859`.
- Five-package artifact manifest: `/tmp/meowland-final-candidate.xYtXbO/tarballs.sha256`, SHA256 `bf536dc3019251659c3a9cfb063b16106f2201c8791bade5df77c0b42636118a`.
- Independent acceptance: `/tmp/meowland-final-consumer.QEzSbr/ACCEPTANCE.md`, SHA256 `5f5f0dacf75b8a7d79d07a0353162733abc6fd90f5e328e718769f0d4da954f2`.
- Complete identity: `identity.json` in the same directory, SHA256 `d45b60ac570dc6a52f88efbbc0835040b8e574edc3ee8119c5c03dd6967ad74d`, binding the source, the five tarballs, fixtures, browser results, and seven images.

The independent consumer installed only these five exact tarballs; third-party dependencies used the already-downloaded cache, with no source aliases, original-repository node_modules, or workspace escapes. All 579 installed files matched the tarballs byte for byte, and the 10 canonical symlinks were neither dangling nor escaping their directories.

The actual environment was Bun 1.4.2, TypeScript 7.0.2, Node 26.8.1, and Chromium 153.0.8010.12. The DOM-free public types, browser public Assistant/JSON types, real Node shared-module identity, and installed-state browser build all passed; Bun was not passed off as Node.

Six groups of browser behavior passed, and the independent acceptance reviewer actually viewed the seven final images. Coverage includes the same Assistant across JSX/JSON, long processes and paginated reading, returning to the latest message within the message area, retaining later drafts/real Files after accepting the send snapshot, activity details and question actions, and light/dark plus focus in narrow/short windows. JSON has no attachment entry by default; text sends really invoke the fixture host actions.

Book/Press did not rerun the old green matrix: the final Book differs from the verified fixed version only in the README, and Press's final tarball is identical; existing installed-state CLI, Book capture/public host types, and Press's MDX/font/OFL evidence with no product-image dependency are reused by identity. CSS changed only in the README and in one import trailing-comma format fix, and this version's browser actually used the new adapter. The independent report keeps the first failure, the fix, and the reuse scope; `--help` printing Usage and exiting 1 is not reported as a passing help command.

## Not yet complete and blockers

- Did not rerun the full matrix of all unit tests, all browser configurations, WebKit/Firefox, the native app, or real touch/IME/assistive-technology coverage; there was no real backend, upload, message, model, or user browser profile operation.
- The user explicitly chose MIT for our own code, but retries through the same `apply_patch` path were still rejected with `user withheld`; work stopped and no alternative write method was used. LICENSE and the five packages' license fields have not yet landed in files. Font OFL and original notices such as Lucide are retained and are not overridden by the intended MIT.
- The official registry returned a 200 unpublished-package stub for `meowpress`; the owner, historical content, and republication rights remain unknown. `meowsite`, `meowpages`, and `meowpub` returned 404 at the time; they are only candidates, with no guarantee of registration or publication rights. No package names were changed automatically.
- No new GitHub remote, push, npm publish, release credentials, or CD restoration was created. Rossovia's original repository source was not deleted; official dependencies, remotes, and the Go module have not been switched. The original repository stays at `b594e403`, and three unpushed documentation commits on the local branch are retained.

This time only the root README and this receipt are closing documentation changes; they do not change compilation inputs or the verified five-package artifacts. Runtime evidence remains bound to `543a5773` and the manifests above; no rebuild, test, repack, or model call was performed for the documents.
