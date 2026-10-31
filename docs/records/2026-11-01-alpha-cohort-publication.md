# Alpha cohort publication, 2026-11-01

The maintainer authorized this batch on 2026-11-01: publish every outdated package to the `alpha` channel, include `meowslides`, commit and push to `origin/main`, and do not republish `meowjsx`. The release source is [`2588524`](https://github.com/lidessen/meowland/commit/2588524d79654c609310102f6011205da51d2fc6), the `main` commit that the dispatch pinned. It contains the version-bump commit [`4ece4c1`](https://github.com/lidessen/meowland/commit/4ece4c1a231c88e2eb6256bf9e240c83c00ff492) plus three later `main` commits that touch only `packages/meowtail/stories` and the docs site; the packed tarball SHA256 values are byte-identical at both commits, so the accepted bytes and the published bytes are the same.

## Version selection

| Package      | Previous public version | New version     | Reason                                                                                                          |
| ------------ | ----------------------- | --------------- | --------------------------------------------------------------------------------------------------------------- |
| `meowjsx`    | `0.3.0-alpha.0`         | not republished | Source unchanged since `622af70`; the rebuilt tarball is byte-identical to the published one                    |
| `meowcss`    | `0.3.0-alpha.0`         | `0.3.0-alpha.1` | Adds the `meowcss/bundle` subpath and `removeLegacyIsFallbacks`                                                 |
| `meowtail`   | `0.4.0-alpha.0`         | `0.4.0-alpha.1` | Adds the `meowtail/web` subpath, the Journal and Meow themes, the new components and the focus-modality work    |
| `meowbook`   | `0.3.0-alpha.0`         | `0.3.0-alpha.1` | Rewritten gallery shell, gallery configuration and canvas scheme handling                                       |
| `meowpress`  | `0.3.0-alpha.0`         | `0.3.0-alpha.1` | Font manifest pipeline, `blogFonts`, `SiteFont`                                                                 |
| `meowslides` | `0.1.0-alpha.1`         | `0.2.0-alpha.0` | First publication of this version; the source has moved to the signal entry and the current JSX/CSS/Tail cohort |

`meowbook`, `meowpress` and `meowslides` import `meowcss/bundle`, and `meowbook` and `meowslides` import `meowtail/web`. Their `meowcss` and `meowtail` peer baselines were raised to `^0.3.0-alpha.1` and `^0.4.0-alpha.1` so those consumers cannot resolve the older cohort. Every `meowjsx` peer stays `^0.3.0-alpha.0`, because that version already carries the signal entry.

## Local acceptance before the dispatch

- `bun run build` and `bun run check` both exited 0; the unit suite reported 821 passing tests and 0 failures.
- `oxfmt --check` passed on the five edited manifests.
- `bun run pack` produced these tarballs, and the same six hashes were reproduced after the later `main` commits:

| Package      | Tarball SHA256                                                     |
| ------------ | ------------------------------------------------------------------ |
| `meowcss`    | `1e25d23720e64f76b2c005c7d8a803d4051dbf76e4432af75682923e5e6e604a` |
| `meowtail`   | `d0d8450014d1a4b8a56770b13da66419fd2f9ca2fd93db65978af42e2a1ba859` |
| `meowbook`   | `c0c46c6becb275eb6f1f4c124fb9a1a1306213dee036c75278a8563f1d53eeaa` |
| `meowpress`  | `683866862417a82d5d3b866b487fa46a0f8fafb122f25d6918e2bb5f9ead71a4` |
| `meowslides` | `7a24cdb013d3c3cb52ae7b04490ea4421447ec27ed62c542d50e5407f23df23f` |
| `meowjsx`    | `db1c7aec34dde0bbe3734681f02713eb02f1168741b63aaf1121e4a494fa4c4c` |

- The five tarballs were installed in an empty directory outside the repository with lifecycle scripts disabled. The installed-state acceptance passed 17 of 17 checks: every public entry point imported, `meowcss/bundle` returned a result, `meowtail/web` exposed `installFocusModality`, the three CLI binaries existed, the installed versions were the expected cohort, and no nested duplicate runtime copies appeared.

## CI

`checks.yml` run `41241220233` for `4ece4c1` and run `41241426135` for `2588524` both concluded with success, including every browser matrix entry.

## Publication

The [release run](https://github.com/lidessen/meowland/actions/runs/41241679942) prepared successfully and published four packages. Each publish returned HTTP 202 and was verified against the registry integrity and the `alpha` tag:

| Package     | Published version | Registry integrity                                                                                | `alpha` before → after            | `latest` before → after |
| ----------- | ----------------- | ------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------- |
| `meowcss`   | `0.3.0-alpha.1`   | `sha512-zeR1RZkVwihwhBYEKUjSyoKawIJo/BQ21AOfCiUXJZAdJdwzx5RwUwF/WwFJXaT+DsER9CgFSQU+56+y2mBrag==` | `0.3.0-alpha.0` → `0.3.0-alpha.1` | `0.1.0` → `0.1.0`       |
| `meowtail`  | `0.4.0-alpha.1`   | `sha512-2HB9x9HJH3p/fdE0CKzB8cCqeP2bmOHWi75xm+Jv8cpyxnYBIK7xfjA+V8HF7xdE/YACGmUnjl9hCGil+EYH1A==` | `0.4.0-alpha.0` → `0.4.0-alpha.1` | `0.1.0` → `0.1.0`       |
| `meowbook`  | `0.3.0-alpha.1`   | `sha512-GzQ8WInrQiSfwpgj0oPMvQK0p1pOS5Cx8YyXS/PWgzyWIgeHyy3gd/fepM+FoydJivaQXAPc5Wj/e6xvSMZhRQ==` | `0.3.0-alpha.0` → `0.3.0-alpha.1` | `0.1.1` → `0.1.1`       |
| `meowpress` | `0.3.0-alpha.1`   | `sha512-I2rBhokL7pnkhnN0QorZiRNWllVSJOKX2kttKue4IRiXvL4evzUGZlxHB0GhPNS8+ilVbeqpLSYLw7uCmf3dEg==` | `0.3.0-alpha.0` → `0.3.0-alpha.1` | `0.1.0` → `0.1.0`       |

An independent public registry readback confirmed the four versions, their integrity values, the moved `alpha` tags, the unchanged `latest` tags and the unchanged `dev` tags. The published versions were then installed from the registry in a clean directory outside the repository; the installed-state acceptance passed 15 of 15 checks against the registry bytes.

## Slides remains unpublished

`meowslides@0.2.0-alpha.0` was selected in the same batch and packed and accepted with the others, but its publish exited with `ENEEDAUTH` and produced no publish response, so the run failed at that package. The registry has no `0.2.0-alpha.0`; `alpha`, `dev` and `latest` still point to `0.1.0-alpha.1`. The other four packages had already been published and verified before that point, so the batch is partially complete by design, not by fallback.

The cause is unchanged: the first Slides publication did not configure a persistent npm Trusted Publisher for the package. To finish it, configure `meowslides` on npm for GitHub Actions with repository `lidessen/meowland`, workflow filename `npm-release.yml`, no environment, and allowed actions `npm publish` and `npm dist-tag`. Then re-dispatch the same source SHA and package selection. The release algorithm skips the four versions that already exist with matching integrity and publishes only Slides, so no repack or second publish of the other packages is needed.

## The `dev` alias still points at the previous cohort

The `dev` tags were not part of this batch and remain on the `622af70` cohort (`meowjsx`, `meowcss`, `meowbook` and `meowpress` at `0.3.0-alpha.0`, `meowtail` at `0.4.0-alpha.0`). The `tag-dev` operation is pinned in `scripts/release-tag-dev.ts` with explicit versions and integrity values, so pointing `dev` at the 2026-11-01 cohort requires updating those pinned targets first. `alpha` already carries the new code.
