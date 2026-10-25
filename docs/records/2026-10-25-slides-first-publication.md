# MeowSlides first npm publication

The user authorized the first publication of `meowslides@0.1.0-alpha.1` and handled npm's browser 2FA challenges. Before the operation, the public npm registry returned 404 for `meowslides`, and the local working tree was clean at `41908ad1324e959e4696a76d8af308d68a268212`. This was a one-time direct npm CLI bootstrap, not a run of the repository's normal OIDC release workflow. No persistent Trusted Publisher was added.

## Exact artifact and publication

The published file was the previously accepted `meowslides-0.1.0-alpha.1.tgz` from [source `c6d6fd4`](https://github.com/lidessen/meowland/commit/c6d6fd4846c2c3184e3b5914aa83dcbfbe1e85c5), SHA256 `f1d21322a5ec2c0a949d430028661027ed8021ad9e21f358fbfb1d8cd7be7684` and SHA512 integrity `sha512-4igE17syFjNUlc9Yz7Og9tIRixrv5bTWbxyKi6qQCAVZ636oOfzP2m5YkwhEsKgk/lmHtrJKFgECxub8CGmFEw==`. Its packed peers require JSX/CSS `^0.2.0-alpha.0` and Tail `^0.3.0-alpha.0`; their exact versions existed publicly, and the five sibling local tarball integrities matched the public registry. The ignored local `artifacts/releases/2026-10-24-authoring-alpha-c6d6fd4/consumer-receipt.json` had passed for the frozen six-tarball batch. Current `main` Slides source was not repacked under this version because it imports `meowjsx/signal`, which published JSX `0.2.0-alpha.0` does not export.

Using npm 11.20.0, the operator ran direct `npm publish <frozen-tarball> --tag alpha --access public --ignore-scripts` with an isolated temporary npm configuration. npm required browser authentication; the user completed 2FA without sharing a code. The CLI returned `+ meowslides@0.1.0-alpha.1` once. No second publish, `npm stage publish`, Git tag or GitHub Release was attempted. The public registry then exposed `0.1.0-alpha.1` with the exact SHA512 integrity, and a fresh download had the same SHA256 as the accepted local file.

After the version appeared, the operator ran `npm dist-tag add meowslides@0.1.0-alpha.1 dev` through the same temporary login; the user completed a second browser challenge. The public registry and `npm view` both resolved `alpha` and `dev` to `0.1.0-alpha.1`.

## Registry state and consumption

The first direct publication unexpectedly caused npm to expose `0.0.0-stage` while the accepted version was still being processed. After processing, the public packument retained both `0.0.0-stage` and `0.1.0-alpha.1`, with `latest`, `alpha` and `dev` all targeting `0.1.0-alpha.1`. The operator did not request staging or edit `latest`; an authenticated `npm stage list meowslides` returned no pending staged versions. No version was unpublished and no tag was removed or retargeted. This registry-created stage version and `latest` assignment remain for a separate decision.

An empty directory outside the repository installed exact public npm versions of Slides `0.1.0-alpha.1`, JSX/CSS `0.2.0-alpha.0` and Tail `0.3.0-alpha.0` with scripts disabled and empty npm configuration. Native Node ESM imported Slides root, registry, theme and MDX entries plus the JSX/CSS peers, and the installed `meowslides` CLI built a two-slide MDX file with HTML and finite slide metadata. This is registry consumption of the published bytes; it does not claim a browser behavior test or adoption in a consuming product.

The temporary npm CLI login was revoked with `npm logout`; a subsequent `npm whoami` failed, and the temporary authentication directory was removed. The normal release contract remains manual Actions plus npm OIDC for later versions, subject to separately authorized Slides Trusted Publisher configuration.
