# Local npm releases

Each package uses independent SemVer, and the maintainer or an Agent explicitly determines the selected packages, versions, and dependency ranges. The single release algorithm `scripts/release.ts` consumes already-accepted tarballs; it does not automatically change versions, expand the package selection, build, pack, commit, or push. Stable releases explicitly use `latest`; prereleases must be `x.y.z-alpha.N` and explicitly use `alpha`. Other prerelease formats such as `*-slides.*` are never mapped to alpha. `meowslides@0.1.0-alpha.1` has completed its user-authorized first npm publication; the root and showcase are not published. Its public tarball is the frozen artifact from `c6d6fd4`. The new `meowslides@0.2.0-alpha.0` candidate requires the published JSX/CSS `0.3.0-alpha.0` and Tail `0.4.0-alpha.0` cohort, but its OIDC publication is blocked by `ENEEDAUTH`; do not describe it as available on npm.

Regular pushes/PRs continue to run only build/lint; subsequent npm releases use the manual `workflow_dispatch` of `.github/workflows/npm-release.yml`, with npm Trusted Publishing OIDC and no `NPM_TOKEN` or personal npm login state. The user-authorized first Slides publication was a one-time direct CLI bootstrap with user-handled 2FA and a revoked temporary login; see the [receipt](records/2026-10-25-slides-first-publication.md). That exception does not configure Slides' Trusted Publisher or authorize future direct CLI releases. The script does not create Git tags, GitHub Releases, or deployments. Historical tags/Releases and the [original publication receipt](records/2026-10-17-tail-book-press-publish.md) remain as they are. The current flow supports explicit subsets of `meowjsx`, `meowcss`, `meowtail`, `meowbook`, `meowslides`, and `meowpress`; wiring the package selection does not constitute release authorization. The four packages and the new Slides/Press can be selected separately; unselected packages are not released in the batch. Press's `0.1.1-alpha.0` candidate expresses the host owner of shared modules via required CSS/JSX peers and retains compatible ranges for both stable and explicit alpha; an ordinary CSS dependency once produced a second copy of stable CSS in a real mixed install graph, so actual tarball acceptance must still check module identity, CLI, font license, and custom themes, and loosening ranges is not a substitute for identity verification.

## Preparation and pinned inputs

1. Identify the affected packages and their independent versions, and update the source manifest plus necessary dependency/peer ranges. The script uses node-semver's normal prerelease semantics to validate dependencies and peers separately; a stable range usually does not accept alpha, so explicitly add the corresponding alpha baseline range. It never forces all packages to the same version or infers coupling.
2. Complete the necessary checks per [development checks](development-checks.md), build/pack, and install the actual tarballs in an empty directory outside the repository to verify public entry points, resources, CLI, and affected behavior. Packing does not mean the build is done; local tarball consumption is not the same as registry consumption.
3. Commit the candidate source and pin the candidate's full SHA and the SHA256 of the accepted tarballs. Tool commits may follow the candidate; the candidate must be an ancestor of the tool HEAD. The tracked working tree/index must be clean, and origin must match the input repository. Untracked content (including unknown `data/`) does not participate in checks and is not read or cleaned.
4. Store the input JSON and exact tarballs in the ignored `artifacts/releases/<batch-name>/`, then do not repack or alter hashes to pretend it is the same batch.

When other tasks have WIP, keep their original directories and content, and use an independent clean checkout of the committed candidate to build and accept; do not stash/reset, copy unaccepted source, or modify input hashes to mix it in. After the new ESM fix, the candidate must use a new commit and exact hash; the old `857c0fb` four-package input must not be released further. See the record for that run for the specific batch and consumer receipt.

Input example (replace hashes and SHAs with actual values):

```json
{
  "repository": "lidessen/meowland",
  "commit": "Full 40-character candidate Git commit SHA",
  "packages": [
    {
      "name": "meowtail",
      "version": "0.2.0-alpha.0",
      "file": "./meowtail-0.2.0-alpha.0.tgz",
      "sha256": "64-character SHA256 of the accepted tarball",
      "notes": "Optional: batch note, stored in the local input"
    }
  ]
}
```

`file` is relative to the directory containing the JSON. `--packages` must explicitly select unique package names again; only the selected set is published, and other packages in the input are not included automatically. Package names/versions must match both the candidate commit's manifest and the tarball, public exports/bin targets must be complete, no unresolved workspace dependencies may be present, and the root MIT LICENSE must be included. Internal dependencies are published before their consumers, and a dependency cycle in the selected set fails the run. The candidate manifest is never replaced by a new manifest from a later tool commit.

## Manual dispatch and local dry run

First rehearse locally against the accepted full source SHA; omitting `--execute` does not access the network or trigger the workflow:

```sh
bun run release:dispatch --commit <full-HEAD-SHA> --packages meowjsx,meowcss,meowtail,meowbook --channel alpha
```

After the approved-pushed source and workflow are on remote `main` and the user has configured npm trust, the same command with `--execute` requests a run:

```sh
bun run release:dispatch --commit <full-HEAD-SHA> --packages meowjsx,meowcss,meowtail,meowbook --channel alpha --execute
```

This is a trigger command; success only means the run was requested, not that npm has published. GitHub CLI uses existing GitHub login permission; the script does not log in, expand permissions, or push. The source SHA must equal local HEAD and remote main; the workflow SHA, checkout HEAD, and input SHA must also match exactly. A regular push does not publish packages. Stable releases use the same entry with `--channel stable` and an explicitly prepared stable version; the tool does not automatically upgrade alpha to stable.

### Pinned `dev` aliases for the published signal-entry alpha

The same manual workflow also has an explicit `tag-dev` operation. Select exactly `meowjsx,meowcss,meowtail,meowbook,meowpress`, set `channel=alpha`, and set `source_sha` to the full SHA of the current remote `main` workflow run. This operation does not pack or publish the current source. It points only `dev` at the five published signal-entry versions: `meowjsx`, `meowcss`, `meowbook` and `meowpress` at `0.3.0-alpha.0`, and `meowtail` at `0.4.0-alpha.0`. Their tarballs came from release source `622af70`; `dev` does not imply later `main` changes. `meowslides` is not part of this five-package operation and retains its own older `dev` alias until its new version can be published.

The tag job reads public npm metadata for all five packages, checks the current `alpha` targets and the exact published SHA512 integrities and downloaded tarball SHA256 hashes, then rechecks the tags before each change. It accepts `dev` only at its pinned previous version or the new target; a correct target is left alone, while a missing or unexpected tag stops the batch. It verifies that `alpha`, `latest` and all other tags keep their original values, and fails if a concurrent publisher moves them. npm OIDC must allow `npm dist-tag` for each package; a workflow failure does not grant permission to switch to a saved token or silently retry a mutation. Read the registry after the run to confirm every tag target.

The workflow's prepare job builds and checks the source with a pinned Bun on a GitHub-hosted runner, explicitly packs the selected packages, generates input containing commit/version/SHA256, actually installs the tarballs outside the repository to verify public entry points, types, shared identity, and necessary CLI, then uploads the manifest/tarballs/consumer receipt. The publish job downloads the same artifact, does not repack, and publishes after checks by the same release algorithm. Both jobs pin the source SHA; the publish and separate `tag-dev` jobs get `id-token: write`, while preparation and repository permission remain `contents: read`. Releases and tag changes in the same repository queue serially, and an in-progress operation is not canceled.

A purely local check of already-packed artifacts can still be run:

```sh
bun run release --manifest <release-input.json> --packages meowjsx,meowcss,meowtail,meowbook --channel alpha
# With --check, only public registry metadata is queried; does not prove the OIDC trust config is correct
```

`release --execute` only allows the exact `lidessen/meowland`, `main`, `npm-release.yml` manual workflow and a GitHub-hosted OIDC context. It does not log in locally, read credential files, or fall back to a token; npm runs in a temporary empty directory with empty user/global config, strips traditional npm auth variables and `npm_config_*` overrides, and preserves the Actions OIDC context. The official registry and disabled scripts/workspaces are all specified explicitly by the command.

OIDC does not use `npm whoami/access` as a permission precheck: public metadata/dependencies/bytes can be checked read-only, but trust, direct publish, and dist-tag permissions can only be decided by their corresponding operations. Authentication, network, invalid JSON, and historical unpublished-package failures all stop; no arbitrary error is treated as unpublished, and there is no automatic fallback to another authentication method.

The publishing subprocess records the actual npm executable and realpath, version, exit/signal status and output byte counts. It extracts only allowlisted package success markers, publish PUT status codes and limited error facts from output held in memory; raw npm logs, authentication URLs and credentials are never printed. The command explicitly disables dry-run. Neither an exit code of zero nor a successful PUT response replaces registry integrity/tag verification; retain the original artifacts and investigate a verification failure without automatically republishing.

## One-time npm trust configuration by the user

This is a persistent release authorization; it must be configured by the user or an approved operator after explicit confirmation at the time of the user action. This repository's implementation and dry runs never write npm security settings. Each of the four existing packages adds GitHub Actions under npm Settings → Trusted publishing:

| Field                | Exact value                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Organization or user | `lidessen`                                                                                                       |
| Repository           | `meowland`                                                                                                       |
| Workflow filename    | `npm-release.yml` (filename only)                                                                                |
| Environment          | Leave empty; this workflow does not declare an environment                                                       |
| Allowed actions      | Explicitly allow `npm publish`; to fix alpha/latest tags when retrying the same bytes, also allow `npm dist-tag` |

The packages to configure are `meowjsx`, `meowcss`, `meowtail`, and `meowbook`. A new trust currently allows staging by default; do not mistake the default for direct publish being enabled. The workflow pins Node 24/npm 11.21.0, which covers the version needed for dist-tag OIDC, and uses a GitHub-hosted runner. The first successful publish must complete within two days after the new trust is created; otherwise the user must reconfigure it. Saving trust does not mean the server has verified a match; only the first actual publish establishes validity. No long-lived npm token is needed, and no npm one-time password is required for each run.

Slides' first public version now exists, but the direct bootstrap did not configure Trusted Publishing. A future OIDC release requires a separate, explicitly authorized trust binding for `meowslides` with the same repository and workflow identity; it is not automatically covered by the four-package authorization. The direct first publication used `npm publish`, not `npm stage publish`. npm nevertheless created a public `0.0.0-stage` version and automatically assigned the new package's `latest` tag to `0.1.0-alpha.1`; neither state was manually changed after publication. See the [first-publication receipt](records/2026-10-25-slides-first-publication.md) before deciding how to handle these registry states.

Press already has a stable package, so preparing a new `0.1.1-alpha.0` does not need a new-package placeholder; if it is selected for release, confirm whether that package's trusted publisher is configured and fill in the required authorization with the same exact repository/workflow/allowed actions. Press's release and persistent authorization are also not automatically covered by the original four-package authorization. Confirm the new targets and actions in one place; do not re-request the same authorization per package for what has already been granted.

Official docs also offer a [new-package staged creation](https://github.blog/changelog/2026-10-02-npm-staged-publishing-now-supports-creating-new-packages/) path: stage the first version with the user's local login session, then have the maintainer review and approve with 2FA; no long-lived token or token bypass is required. For a nonexistent package, staging creates a public `0.0.0-stage` placeholder, and the real version can only be installed after approval; see [staged publishing](https://docs.npmjs.com/staged-publishing/). This is a new-package bootstrap flow with its own public impact, not the normal OIDC automatic publish of the existing four packages, and it is not wired into this script; the first bootstrap, maintainer approval, and subsequent trust binding should be described in one explicit authorization, and it cannot be assumed that a package that does not yet exist already has usable trust. OIDC itself is compatible with publishing settings that forbid traditional tokens and does not require enabling Bypass 2FA.

Do not weaken account 2FA, and do not recommend enabling bypass. The npm 2026-07-31 announcement states that bypass management permissions have been restricted and direct publish is also being deprecated; this flow adopts short-lived OIDC directly. If old tokens are to be deleted or package publishing access adjusted later, separate authorization is required; this does not happen automatically with configuration.

The version selection stays pinned to Node 24/npm 11.21.0; the latter covers the OIDC dist-tag support this flow needs and is not automatically upgraded with npm's `latest`. The [2026-07-08 announcement](https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/) provided by the user states that npm 12 does not run dependency install scripts by default, does not resolve Git and remote URL dependencies by default, and is expected to remove direct publish with bypass tokens around January 2027. That time is the announcement's expectation; long-lived bypass tokens are not treated as a prerequisite for the new flow.

The current prepare job installs with a pinned Bun, frozen lock, and `--ignore-scripts`; npm's own install and actual publish also explicitly disable scripts. Release targets are exact local tarballs, inter-package dependencies are registry semver, and the source repository URL is only repository metadata, not a Git install dependency. When upgrading to npm 12, revalidate the fully locked transitive dependencies and the install/publish commands, and do not automatically add `--allow-git`, `--allow-remote`, or install-script permission; this round does not claim the npm 12 runtime matrix is complete. The two-day first-successful-publish deadline for a new trust does not constitute release authorization: configure/execute only after the candidate and authorization are ready; if it expires, reconfigure with authorization, and never publish on your own to beat the deadline.

## Execution and recovery

Start any change only after all selected packages pass local, workflow-context, registry, full-bytes, and dependency checks. Before each change, recheck the tool HEAD, tracked state, origin, input, and all tarball hashes, and confirm the current tags have not been changed by another publisher. Do not start a second publisher concurrently or modify the input.

- Exact version that does not exist: run only `npm publish <absolute-tgz-path> --access public --tag alpha|latest --ignore-scripts`; the same runner pins registry/config, and npm exchanges short-lived OIDC credentials automatically.
- Exact version already exists with the same SHA512: skip publish; if the selected tag does not point at that version, fix only the selected tag. Different bytes stop immediately; do not overwrite, change hashes, or automatically switch versions.
- The selected tag already points at a newer version: refuse to move it backwards. Alpha always writes only `alpha`; after publishing and tag fixes, confirm `latest` matches the precheck exactly, including the case where it did not exist before. A detected concurrent change fails the run; `latest` is never automatically changed back.
- After each package change, check exact integrity and the selected tag. npm [publish-time scanning](https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/) delays installation availability: a successful publish or HTTP 202 does not mean the version is publicly available. Send the mutation only once, then read the public registry at most 41 times with 30 seconds between reads (about twenty minutes of pauses, plus request time). Wait only for the expected version/tag, without uploading again. Different integrity, a changed latest during alpha publication, a selected tag outside its original/target values, network errors or invalid JSON stop immediately. A timeout reports availability as not yet verified; scanning, manual review or blocking may still be involved. Do not promise eventual publication or automatically repair tags, republish or roll back.
- On failure, retain the same input and tarballs, investigate read-only, then resume. Prefer re-running the failed publish job of that Actions run to continue downloading the original artifact; if a new dispatch rebuilds different bytes, the exact integrity check rejects it, and hashes cannot be altered to pass it off as the same batch. The registry's actual version/integrity/tags are the recovery source of truth; no second progress ledger is maintained.

When the publish response is unknown or the version is temporarily invisible, do not blindly resend just because the script exited non-zero. Confirm the official registry state first; re-entry checks the same bytes and skips already-succeeded versions. After all scripts succeed, an independent consumption acceptance must install the exact version from the registry before real publication and consumption results are reported; building, packing, a dry run, or read-only checks are not the same as published.

## Verification and references

The targeted test `bun test scripts/release.test.ts` uses real temporary tarballs and isolated Git repositories, mocks the registry boundary, and covers channels, dependencies/peers, topology, select-all precheck, partial-failure recovery, same-bytes/tag fixes, latest protection, input changes, and OIDC context plus traditional-authentication isolation; dispatch tests check the purely local rehearsal, zero triggers on a remote SHA mismatch, pinned main parameters, and manual workflow permission. Mock passes do not mean real trust, Billing, or publishing passed.

Official references: [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/), [bypass restriction announcement](https://github.blog/changelog/2026-07-31-restricting-npm-bypass-2fa-granular-access-tokens/), [workflow_dispatch](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onworkflow_dispatch), [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/), [dist-tag](https://docs.npmjs.com/cli/v11/commands/npm-dist-tag/), [npmrc config precedence](https://docs.npmjs.com/cli/v11/configuring-npm/npmrc/), [variable placeholders](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow/), [node-semver](https://github.com/npm/node-semver).
