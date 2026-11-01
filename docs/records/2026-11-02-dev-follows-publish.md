# The `dev` alias follows each alpha publication, 2026-11-02

The maintainer asked for the release tooling to follow mainstream practice after a survey of roughly forty open-source projects. That survey found that projects almost always apply a channel tag at publish time with `npm publish --tag`, and that post-publish dist-tag moves are rare; the repository's separate pinned `tag-dev` operation was the only surveyed design that committed a target version, tarball SHA256, registry SHA512 and expected previous tag to source and aborted on any mismatch.

## What changed

- `scripts/release.ts` now points `dev` at each selected package's published version during an alpha run. The stable channel never touches `dev`.
- `scripts/release-tag-dev.ts` and its test are removed, together with the workflow's `tag-dev` job and its `operation` input. `.github/workflows/npm-release.yml` again has exactly three inputs (`source_sha`, `packages`, `channel`) and two jobs (`prepare`, `publish`); the prepare job keeps the repository, ref and source-SHA guards, and only the publish job has `id-token: write`.

## Why the change kept four guards the survey said nobody else has

An independent review of the first draft found four blocking problems, all of which are handled here:

1. The publication visibility wait cannot be reused for `dev`; it returns as soon as the alpha tag matches. The dev move has its own poll with its own read budget, and it re-asserts integrity, `latest` and `alpha` on every read.
2. A preflight capture alone would leave `dev` unguarded for the length of the visibility wait. The run re-reads every relevant tag immediately before the move and fails if anything changed.
3. A `dev` that is already newer must fail at preflight. The first draft checked it after publishing, which would publish and then fail on every rerun while starving later packages in the batch.
4. Removing the workflow's `operation` input without stripping `inputs.operation == 'publish'` from the job conditions would have made the whole workflow a silent no-op. The conditions were removed and the workflow-shape test now asserts the three inputs, the prepare guard, the publish permissions and that no `tag-dev` job exists.

## Behaviour

- `dev` only moves forward: the preflight refuses the whole batch, before the first mutation, when a selected package's `dev` is already newer than the version being published.
- The move is idempotent: a package whose `dev` already equals the published version is reported as `already` and not touched.
- A selected package whose version is reused still has `dev` re-ensured at that version, so re-dispatching an accepted batch repairs a partially failed run.
- An uncertain `npm dist-tag` outcome stops the run without a retry. The version is published at that point; the recovery is re-dispatching the same accepted batch, never a second blind `npm dist-tag`.
- The verified receipt records `devBefore`, `devAfter` and `devAction` (`moved`, `already`, or `null` on the stable channel). A read-only run prints the planned action per package.
- Advancing a cohort's `dev` requires selecting every member of the cohort. A partial selection moves only the selected packages and no longer detects drift on unselected ones; that narrowing is accepted.

## What this removes

The ability to move `dev` without a release, the ability to point `dev` at an older-but-intended cohort, and the all-five drift check before every tag change. The replacement for a bad newer pointer is a higher alpha version or a manual out-of-band correction; there is no in-tool retreat.

The 2026-11-01 cohort is unaffected: `alpha` and `dev` already point at the same version for all six packages, and the historical pinned `tag-dev` runs (receipts `41324566169` and `41324670419`) remain recorded in the [cohort receipt](2026-11-01-alpha-cohort-publication.md).
