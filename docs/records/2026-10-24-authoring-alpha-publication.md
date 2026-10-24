# Authoring alpha OIDC publication

The source is [`c6d6fd4`](https://github.com/lidessen/meowland/commit/c6d6fd4846c2c3184e3b5914aa83dcbfbe1e85c5). The [manual Actions run 40099046507](https://github.com/lidessen/meowland/actions/runs/40099046507) completed successfully with both prepare and publish jobs green. It selected the five existing npm packages and the `alpha` channel. The private root, docs and showcase workspaces were not selected. The prepared `meowslides` package was not selected because it has not had its first npm publication.

## Published versions and bytes

| Package   | Published alpha | Latest before and after | SHA256 of the published tarball                                    |
| --------- | --------------- | ----------------------- | ------------------------------------------------------------------ |
| meowjsx   | 0.2.0-alpha.0   | 0.1.0                   | `108aec8f979ad035c9ca58b7756b7ff66ad515675edc0ec04acc8f85cde98146` |
| meowcss   | 0.2.0-alpha.0   | 0.1.0                   | `67f049403c22bde1443b50834603686a2a220ac6a1c10a135a48808ff21a827e` |
| meowtail  | 0.3.0-alpha.0   | 0.1.0                   | `f28e4d513bb8cf9d19a532c604e374f167268b37867f0f6c8295cfe4d4cf5e27` |
| meowbook  | 0.2.0-alpha.0   | 0.1.1                   | `21f67070e1d7d1ee0e4fad36fc484ee7a239bba55460b651e10f3d249903f9f1` |
| meowpress | 0.2.0-alpha.0   | 0.1.0                   | `3f1f784281970b0be00eba87c921cac12266f8b587b805cf0d0bcfe82f7bfaa8` |

The local and runner tarballs have identical SHA256 hashes for all five selected packages. The public registry's SHA512 integrity values match those same runner files, and its `alpha` tags point to the versions above. The `latest` tags did not move. Each npm publish invocation used the existing GitHub Actions OIDC trust and returned HTTP 202; the workflow waited for public version and tag visibility before continuing. No token fallback, npm security-setting change, Git tag or GitHub Release was made.

## Checks and consumption

On the exact source commit, frozen Bun 1.4.2 installation, `bun run build`, and `bun run check` passed. The full check included formatting, lint, types and 586 unit tests across 122 files. Focused Chromium Dialog, Drawer and utility-style checks passed 10/10. The six prepared local tarballs, including Slides, passed the repository's isolated consumer check for public exports, strict types, shared runtime/theme identity, Book and Slides tools, and Press builds. That local check did not publish Slides.

The Actions prepare job rebuilt, checked, packed and independently installed the five selected tarballs before its publish job reused that artifact. After publication, a new directory outside the repository installed the five exact versions from the public npm registry with lifecycle scripts disabled. Every declared public export imported under Bun 1.4.2; the runtime entries also imported under native Node v26.12.0, excluding the documented Bun-only tool entries. Installed package manifests contained the expected exact versions and no unresolved `workspace:` dependencies. This registry installation checks the published packages themselves; it does not claim a complete browser or consuming-product migration.

## Slides and docs

`meowslides@0.1.0-alpha.1` was built and accepted as a local tarball from this source. The public npm registry still returns 404 for the package name. A first publication needs package bootstrap, maintainer approval when staging requires 2FA, and trusted publisher setup for `lidessen/meowland` and `npm-release.yml`. No placeholder, new persistent trust or Slides publication was created in this run.

The existing Vercel `meowland` project automatically deployed the release source commit as [production deployment `dpl_5kpWpX6qpc5eway3CWp1gHFm2Un9`](https://vercel.com/lidessen/meowland/5kpWpX6qpc5eway3CWp1gHFm2Un9). It was Ready with the `meowland.dev` alias. HTTPS home, Button and meowtail docs pages, the gallery canvas and a linked CSS asset returned 200. This receipt is a documentation-only follow-up; the npm artifacts remain tied to `c6d6fd4`.
