# Meowtail standalone package rename acceptance

Later status: this page keeps the original framing from the local acceptance stage of the rename; the push, npm publish, registry consumption and official Release results authorized afterward are in the [release receipt](2026-10-17-tail-book-press-publish.md).

Date: 2026-10-17 UTC. Result: the source rename, isolated build and limited installed-state acceptance of the local tarball passed; the new package had not been pushed or published yet.

## Inputs and compatibility boundaries

The baseline was `e471ef2882019edd94520a0205801c5a1a6a7b91`, and the rename source local commit was `9ced4b9c4083ae8a9c1b80628330df857bf22256`. `packages/meowui` moved to `packages/meowtail`, the standalone npm name changed to `meowtail`, and the initial candidate remained `0.1.0`; it was not merged into JSX or CSS.

All 382 tracked files of the old package had an explicit counterpart, of which 297 moved byte for byte, and all 210 production `src` files matched the baseline. The remaining changes were limited to integration such as package references, paths, descriptions, scene names and screenshot file names; the package manifest changed only name and description, and public exports, dependencies and peers kept the original contract. `createMeowUI`, `installMeowUI`, the plugin name `meow-ui`, the existing `data-meowui-*`, CSS tokens and Shiki theme identifiers were kept.

Meowbook, examples, showcase, and the build and release tooling already used the new package name; the lock replaced only that workspace package reference, and third-party resolution bytes were unchanged. The tracked package files of JSX, CSS and Press and the three regenerated tgz files were byte for byte identical to the original frozen inputs. The historical migration receipt only gained a header comment; its original body and identity were kept.

The release tooling allowed the historical `meowui` that was unselected in the old manifest, but both inspect and release refused to select the retired name and did not automatically map the old package, tag or tarball to the new package.

## Isolated build

The only complete check ran on a snapshot outside the repository. `source-inputs.json` records the path, content SHA256 and mode of 561 explicit source files, and its SHA256 is `ccbb91553fbec87d7d9e434e5a58ee0d42827a7208efa6b2f4ea24d59e8c8da9`. The unknown `data/`, old artifacts, `.git`, dist and the original node_modules were not included in the snapshot.

- The offline frozen, ignore-scripts install succeeded; the realpaths of 177 packages and 688 links all stayed inside the snapshot.
- `bun run build`, `bun run check` and `bun run pack` all exited 0.
- check covered format, lint, types, examples and 314 tests with 1950 assertions across 62 files, with 0 failures.
- After the checks, none of the 561 source inputs drifted from the live files or the frozen manifest; packing wrote only to the snapshot and did not overwrite the original release assets.

New candidate artifacts:

| Package        |  Bytes | SHA256                                                             |
| -------------- | -----: | ------------------------------------------------------------------ |
| meowtail 0.1.0 | 163307 | `c28809b605355a77eb8a7892edf5ff2f128a3c98849884c644a6a186bc4e3281` |
| meowbook 0.1.0 |  75146 | `7edef02a794f2ad149db99546028cdceee131ceb549dfe7f909c2a80f33f2ace` |

The build receipt is in the local temporary directory `meowtail-rename-final-t9izfa1g/ACCEPTANCE.md`, with SHA256 `24fdde0f17c4f37081eee6d5e831492f2747da2490e2a95993fe3d7d43b34537`. The temporary path locates the evidence for this round; it is not a replayable asset in the repository.

## Independent installation and actual visuals

An independent acceptance owner installed the new Tail, Book and the original JSX and CSS, four exact tgz files, from an empty directory. It reused only test fixture text, not the old node_modules, lock or dist; it installed offline from the existing third-party cache, with no source alias, root hoist patch or original product backend.

- The set of 563 installed public files and every byte matched the four tars, and the 6 links had no dangling targets or directory escapes; the old `meowui` and Press were not installed.
- Real ESM consumption on Node 26.12.0 verified the same physical JSX core, Fragment and runtime; Signal and Context actually updated after passing through finite JSON rendering, Tail JSON's AssistantView had the same identity as the public chat components, and out-of-bounds File capability was rejected.
- All three strict type configurations passed: neutral without DOM, the Assistant app and the Book tooling.
- The installed Meowbook public API `buildStories` and the CLI list, check and capture passed; capture had 1 request, 1 success and 0 failures at 390×844, DPR 1, and the process exited naturally.
- An isolated routing scenario in Chromium 153 actually verified shared Context, preservation of state and focus when appending after expanding a long process, no jump when appending after scrolling up, anchor preservation when prepending history, return to latest, and keeping a later new draft and focus after a pending action was accepted.
- JSON same-component text actions, no horizontal overflow at 390×700 dark and composer visibility passed; there were no backend or external requests, and page errors were 0.

The independent acceptance owner actually viewed the three images: wide-screen JSX, narrow dark JSON and Book capture; the coordinator separately viewed the wide-screen image. The images were kept locally only and were not uploaded to Library. The above are representative scenes, not a rerun of the old full visual matrix.

The first fixture check too broadly treated a legitimate Shiki theme string as an old import, and another CJS `require.resolve` probe did not apply to ESM-only exports. Only the temporary checker was corrected: it matched real import syntax and resolved with Node ESM; the source, tgz and installed package were not changed to pass the probe. The original failure and the correction remain in the independent receipt.

Independent install receipt: `/tmp/meowtail-installed-8e1hgbps/ACCEPTANCE.md`, SHA256 `e7686df73602c3afedc97ca602a6cc6d6a1eb4be433c0368d3d777392901851e`. The pinned source review receipt SHA256 was `4fe8bc55c6695d3160e07fa24ce393535b23e5046d6ad3ae77b988bf343ae172`. The install and visual results were obtained by an independent role; the full build/check/pack was obtained by the single build role, and the full matrix was not repeated.

## Release boundaries and uncovered scope

The new local candidate input is `artifacts/releases/meowtail-0.1.0/release-input.json`, SHA256 `f95eff98a01892fe62c81b88b1bddc37faf6abf4852eb123d123a0bacec9da9c`, selecting only Tail 0.1.0 and binding the above source commit and tgz. Book is not in that input.

An anonymous npm name query at 2026-10-17 02:39:41 UTC returned 404; this only describes the query result at that time and does not guarantee that the name can be registered or that the current account has publish rights. Pushing the new package and a real publish still need independent authorization; neither was executed this round.

Book's new 0.1.0 tar is for local acceptance only. The original `meowbook@0.1.0` draft/tag bound the old candidate `16745c148b9e740db6815c6ad0a34fe90cd33d5b` and cannot carry the new bytes; a later step must decide on a new Book version, or explicitly authorize handling the old unpublished draft/tag. This round had no version bump, remote deletion, move or overwrite.

The existing official release assets of JSX/CSS are unchanged. The user's own publish of Press returned E409; the exact version and archive were still not public within the earlier observation window, and the backend reason is unknown; this round did not republish, and Press registry consumption remained NOTRUN.

What passed this round is local exact tarball consumption, not a registry install under the new name; native apps, WebKit, a real business backend, models, all platforms and the Rossovia product switch were not verified. The four Rossovia issues the user separately reported were handed off separately and were not started under the rename task, nor are they denied by this round's limited acceptance.
