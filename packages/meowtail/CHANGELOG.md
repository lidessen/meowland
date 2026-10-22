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
- Nested `Section` titles (h3 and below) keep `uiTokens.font`; the serif stays on page and top-level section titles.
- `Table`: the last column fills the remaining width and the table keeps the sum of column widths as its minimum, so the selection column stays 44px instead of scaling with the data columns.
- `Alert`: lighter tinted hairline and tighter title/body rhythm; tone `info` uses `uiTokens.info` instead of the near-black primary.
- Menus and popovers use a 90% opaque surface so text underneath stays out of the way where backdrop blur is unavailable, and a solid surface under `prefers-reduced-transparency`.
- Active `Pill` filters take the accent selection colors; `SegmentedControl` options size from their labels and the selected thumb uses a hairline shadow.
- `NavList` icons center on the label line when a row has a description.
- `AssistantView` wraps user text parts in `ChatBubble`, matching `ChatMessage`.
