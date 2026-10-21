# Changelog

## 0.2.0-alpha.3

Candidate for the next alpha publish. This version is not on npm until the manual release workflow runs.

`meowjsx` stays `0.1.1-alpha.1` and `meowcss` stays `0.1.1-alpha.0`. Neither package's source has changed since those versions were published, so this candidate does not republish them.

### Added

- `Section`, `Page`, `Modal`, and `NavList`, which are on main and were missing from published `0.2.0-alpha.2`.
- `Alert` tone `neutral`, and `marker` `"dot" | "none"`. The defaults stay `tone="info"` and `marker="dot"`, so existing bars keep the status dot. `marker="none"` removes the bar dot. Block layout still draws no dot.
- `EmptyState` `illustration`. Omitting it keeps `DoodleCat`. `null` and `false` leave the illustration part out. Presence is fixed for the mount.
- `uiTokens.fontDisplay` (`--ui-font-display`), a serif stack for page and section titles. Hosts override the variable. Body text stays on `uiTokens.font`.
- `PageHeader` `leading`, a mark before the title. Omitting it keeps the title as a direct child of the copy block. `Page` forwards `leading` into that header.

### Changed

- `standardTheme` and `createMeowUI` no longer load the code-block highlighter. The package sets `sideEffects` to `false`, and the contracts those entries need live in modules that do not import Shiki. Importing `CodeBlock`, `ReadBlock`, `JsonBlock`, or `AssistantView` still loads Shiki. `standardTheme.cssText` stays one complete stylesheet.
- Page and section titles use `uiTokens.fontDisplay`. Their size and weight are unchanged.
