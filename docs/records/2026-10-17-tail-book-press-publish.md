# Tail, Book and Press release receipt

Date: 2026-10-17 (Beijing time). With the user's explicit authorization, this batch performed a regular push and published `meowtail@0.1.0`, `meowbook@0.1.1` and `meowpress@0.1.0`. All three packages were actually installed from the official registry for acceptance, and official GitHub Releases were completed after acceptance.

## Exact sources and artifacts

| Package         | Source candidate bound by tag and Release  | tarball SHA256                                                     |
| --------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| meowtail 0.1.0  | `9ced4b9c4083ae8a9c1b80628330df857bf22256` | `c28809b605355a77eb8a7892edf5ff2f128a3c98849884c644a6a186bc4e3281` |
| meowbook 0.1.1  | `04b9256d7addc1bb11ebd8fb05b9c230e09a678f` | `74186f86e69a88a566c8d66481c04350765fb4585c06fb707a7f7d235c14d186` |
| meowpress 0.1.0 | `16745c148b9e740db6815c6ad0a34fe90cd33d5b` | `8fb23cef85d988da53e3d4a06703e0214ca590c864ec558dacd5fb0a46893b96` |

The release tooling ran on the normally pushed `04b9256d7addc1bb11ebd8fb05b9c230e09a678f`, and the candidate and tool commits were verified separately per the local release contract. This time Book changed only its version, neutral README install notes and the necessary lock; among the new package's 66 files only manifest.version and README changed, and the other 64 files were byte for byte identical to the previously accepted Book package. The isolated build, types and pack passed, the 688 dependency links had no escapes; the already-established 314 source test matrix was not repeated.

Stable local inputs and SHA256:

- `artifacts/releases/meowtail-0.1.0/release-input.json`: `f95eff98a01892fe62c81b88b1bddc37faf6abf4852eb123d123a0bacec9da9c`.
- `artifacts/releases/meowbook-0.1.1/release-input.json`: `4f3539721bfbf9106f785f50765d4a6d54ac9556ed506e45e72e8ed5074e5aa4`.
- `artifacts/releases/initial-0.1.0/release-input.json`: `3cadbdc0ab36c76c69f2e86319bff5d54453637968958a98db334f3bec73c50f`, this time selecting only Press; the original input was not changed.

The published JSX/CSS packages, original tags and assets were not touched. The old UI and Book 0.1.0 draft/tag were kept; Book was released as the new 0.1.1, and the old identity was not moved. The unknown `data/` was not read, staged or published.

## Actual publishing and interruption recovery

The source rename `9ced4b9`, the stage document `4969f58` and the Book preparation `04b9256` were pushed normally; the first automated approval rejected the push because it did not accept relayed authorization, and the remote had no changes at that time. After the user then directly confirmed the exact commit, the same regular push succeeded and the remote SHA read back consistently; there was no force or alternate path to bypass the rejection.

Each of the three packages went through the same `scripts/release.ts` algorithm checks and exact tag/draft/asset preparation, then ran the native npm publish; when personal verification was needed, only the official npm page was opened and the user completed it, with no OTP/token filled in on their behalf. After confirming the old E409 and that the target version still did not exist, and with this round's explicit approval, Press retried exactly once using the original candidate, input and tarball.

All three native commands showed accepted processing and `+ name@version`, but the immediately following exact query temporarily returned 404, which made the combined script exit 1 overall. Those exits were not treated as grounds for republishing. Then a read-only wait verified that the official exact metadata, SHA512 integrity and real archive bytes all matched; after independent consumption completed, finalization proceeded from the original inputs.

The temporary invocation guard for finalization still used the same release algorithm, allowed only the `draft=false` operation for the single package verified at that time, and forbade another npm publish, tag/push, asset creation or rewrite; the guard received an independent limited source read review and did not become a new release implementation or an in-repo state ledger. All three finalizations exited 0 and no package was published again.

## Independent registry consumption

Each consumer started from an empty directory, the official exact version and a new cache; it first downloaded the official archive and checked it byte for byte against the frozen tar, then installed normally from the registry. There was no local file/override, source alias, old node_modules, old lock or workspace hoist patch.

| Package | Actual scope passed                                                                                                                                                                                                         | Independent receipt SHA256                                         |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Tail    | 497 public files, fresh install of 52 packages, real ESM same core, public types, representative Assistant/JSON actions; two frames actually viewed                                                                         | `04a0249fe49f078e8c917149b0e34da6ee3b5cb7e7165c88c089eff909fc717c` |
| Book    | Four official package archives, 563 files, 6 links without escapes, fresh install of 67 packages, types and same Node core, public buildStories and real CLI list/check/capture; 1 request/1 success, frame actually viewed | `8198c708ede62e59b7bd9b905f4fe01f0e683cdeb556345f4f8d117c0dbdd9ac` |
| Press   | 94 files, 4 links, fresh install of 138 packages; real CLI in a non-root cwd, MDX, 5 font assets and OFL, page actually viewed                                                                                              | `2169e25bd84cbf5af141d9b97327c55e71c7197d81ece7c5b126e8ef9ba4e725` |

Tail's first browser fixture chose the wrong temporary tool path, and Press's first fixture wrongly expected a body H1 that the original rules would remove; only the temporary verifier was fixed and the corresponding browser step was added, without changing source, tar or installed package bytes, and the original misjudgments remain in their respective receipts. The final success was not used to erase the earlier failures.

The final GitHub verifier at one point treated the Release's `target_commitish: main` as the tag's actual commit; after correction it checked the real tag ref, Release body and asset bytes. The field itself is not a pointer to an existing tag, and the remote records were not changed to pass the checks.

## Official Releases and scope

- [meowtail@0.1.0](https://github.com/lidessen/meowland/releases/tag/meowtail%400.1.0)
- [meowbook@0.1.1](https://github.com/lidessen/meowland/releases/tag/meowbook%400.1.1)
- [meowpress@0.1.0](https://github.com/lidessen/meowland/releases/tag/meowpress%400.1.0)

Tags, candidates and public assets were checked against their respective inputs; finalization does not claim the repository-wide Latest. Actions only build/lint and did not deploy the product or static sites. Package publishing and representative browser acceptance do not equal native app, WebKit, real business, model, all-platform or Rossovia product-switch acceptance.

This receipt and the post-release Press README are follow-up documents; the original README bytes of the published 0.1.0 are not repacked or replaced. Release candidates, inputs and archive identities remain as in the table above, and the final documentation HEAD cannot stand in for a common source candidate for all packages.
