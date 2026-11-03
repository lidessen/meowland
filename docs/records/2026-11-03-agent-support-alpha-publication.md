# Agent-support alpha publication, 2026-11-03

The maintainer authorized this batch on 2026-11-03: merge PR
[#31](https://github.com/lidessen/meowland/pull/31) and publish the changed packages to the `alpha`
channel. The release source is
[`7cbfee9`](https://github.com/lidessen/meowland/commit/7cbfee97c23ab6aa020e740e9a7a7764cb1b7a43),
the `main` commit that PR #31's rebase merge produced and that the dispatch pinned. Its tree is
identical to the accepted branch head `2c19034`.

## Version selection

| Package     | Previous public version | New version     | Reason                                                                                        |
| ----------- | ----------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| `meowjsx`   | `0.3.0-alpha.0`         | `0.3.0-alpha.1` | Adds the `prepareContainer` runtime plugin hook, called by the Web renderer around each mount |
| `meowcss`   | `0.3.0-alpha.1`         | `0.3.0-alpha.2` | `mountStyles` shares one `<style>` per document and stylesheet text                           |
| `meowtail`  | `0.4.0-alpha.1`         | `0.4.0-alpha.2` | Adds `createMeowUITheme` (theme delivery and page painting) and ships `AUTHORING.md`          |
| `meowpress` | `0.3.0-alpha.1`         | `0.3.0-alpha.2` | Per-page Markdown copies, the llms.txt-shaped index with an agent guide, and `llms-full.txt`  |

`meowtail`'s peers rose to `meowjsx@^0.3.0-alpha.1` and `meowcss@^0.3.0-alpha.2`: the theme plugin
needs the new hook and the shared stylesheet count, and on the older versions it would silently do
nothing. `meowbook` and `meowslides` were not republished; their sources are unchanged and their peer
ranges accept the new versions. The design behind the theme plugin is
[2026-11-03-theme-delivery-plugin](../designs/2026-11-03-theme-delivery-plugin.md).

## Local acceptance before the dispatch

- `bun run build` and `bun run check` exited 0; the unit suite reported 847 passing tests and 0
  failures.
- `bun run pack` produced these tarballs at `2c19034`:

| Package     | Tarball SHA256                                                     |
| ----------- | ------------------------------------------------------------------ |
| `meowjsx`   | `7949543d671d7b89ae418483580c054d3a602674023f0e2ba9a25d589ad28f5d` |
| `meowcss`   | `89abc7d52c113d28ba006e2ba3e8ff33071a27b6df411247d732ac718b89d230` |
| `meowtail`  | `e0bb14d0f2dbf1df545f838cdc3d60b0b8c16b627c158fc4aada345bbcf37107` |
| `meowpress` | `717027fadfc1765d2e9e0f6ce29fdb3091b3a003be3693990bf27cd59f238d8e` |

- The four tarballs were installed in an empty directory outside the repository with lifecycle
  scripts disabled. The installed versions were the expected ones, no nested duplicate `meow*`
  copies appeared, `meowtail` contained `AUTHORING.md`, `meowpress/build` exported
  `sitePageMarkdownFile`, and a strict TypeScript check of an app using the automatic JSX runtime
  passed. In Chromium the two-plugin setup rendered styled controls with one stylesheet, a live
  switch to the dark scheme painted the whole page (`#121212`, `color-scheme: dark`), the form and
  counter worked, and unmount removed the stylesheet and restored the document element, with no
  console errors.
- `bun run release:dispatch --commit 7cbfee9… --packages meowjsx,meowcss,meowtail,meowpress
  --channel alpha` (read-only) produced the dispatch command.

## CI

`checks.yml` run [`41587414983`](https://github.com/lidessen/meowland/actions/runs/41587414983) for
`2c19034` concluded with success, including every browser matrix entry.

## Publication

The [release run](https://github.com/lidessen/meowland/actions/runs/41587786424) was dispatched with
`source_sha=7cbfee9…`, `packages=meowjsx,meowcss,meowtail,meowpress` and `channel=alpha`. Its prepare
job built, checked, packed and consumer-tested the source; its publish job published the inspected
bytes through npm OIDC and concluded with success at 06:20 UTC after the registry verification.

| Package     | Published version | Registry integrity                                                                                | `alpha` / `dev` after | `latest` |
| ----------- | ----------------- | ------------------------------------------------------------------------------------------------- | --------------------- | -------- |
| `meowjsx`   | `0.3.0-alpha.1`   | `sha512-reigvE0VNvyEytv6C0VpTqx/eC4kXlNZryOOaxaQxw8vnvSCIpD3fNMd2S6fEVX59lI9Ny0Kqig3HkES+F98uA==` | `0.3.0-alpha.1`       | `0.1.0`  |
| `meowcss`   | `0.3.0-alpha.2`   | `sha512-Myaj2UbfcYgIS3ytfXzZVyoQDZKjur4+inY0fOhpn2PHoej9do07zJ9rW505Z9cUOLwYLFjoxaBXo+AhyL/wUQ==` | `0.3.0-alpha.2`       | `0.1.0`  |
| `meowtail`  | `0.4.0-alpha.2`   | `sha512-T3dgJCRgcFfR4CcCD6/+BPWbb7kp/3E9rN11PACExiG3CEAbu0ozUvpB2qXu/dvz2KDspX8DkC5qi8IpOGSjbA==` | `0.4.0-alpha.2`       | `0.1.0`  |
| `meowpress` | `0.3.0-alpha.2`   | `sha512-agXNWMIqMNxcngZkZbtHnyok2Lhh+I9Gm1PbMqw4GKwoPDvotUBbW+89x1Ip1B45SBKjIOd/rI010aYNhFKb/g==` | `0.3.0-alpha.2`       | `0.1.0`  |

`latest` was unchanged for all four packages; `meowbook` and `meowslides` kept their tags.

## Registry consumption

`bun add --ignore-scripts meowtail@dev meowjsx@dev meowcss@dev meowpress@dev` in a clean directory
outside the repository installed the four published versions. The same checks as the local
acceptance passed against the registry bytes: versions, no duplicate runtime copies,
`AUTHORING.md`, the TypeScript check, and the Chromium run (styled light page, full-page dark
scheme, working interactions, clean unmount, no console errors).

The documentation site at [meowland.dev](https://meowland.dev) had already redeployed from `main`;
its `llms.txt`, per-page Markdown copies, `llms-full.txt` and `/skills/meowland/SKILL.md` were served,
and its install lines read `bun add meowtail@dev meowjsx@dev meowcss@dev`.

## Scope

No Git tags, GitHub Releases or stable versions were created, and `latest` was not touched. The
skill's manual setup for `meowtail@0.4.0-alpha.1` and earlier stays, for projects pinned to those
versions.
