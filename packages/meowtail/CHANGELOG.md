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
- `Text` with `variant` `body | secondary | caption | eyebrow` and `as` `p | span | div`: copy between components in a theme text role. `eyebrow` is the small-caps group label.
- `TaskList` (`items` of `{ id, label, state, progress? }` with `ChatExecutionState`, `title`, `defaultOpen`): an agent's plan with dashed, current, done, waiting, failed and canceled markers, a done count and a shimmering current step. Mask tokens `checkMask`, `arrowMask`, `crossMask`.
- `ChatReasoning` (`label`, `doneLabel`, `text`, `active`): streaming reasoning that keeps the newest lines under a fading top edge and folds into one disclosure row when done.
- `Prose` with `measure` `reading | fill` and `as` `div | article | section`: long-form reading content. Tokens `uiTokens.proseGap` and `uiTokens.measure`.

### Changed

- Bolder neutral pass, measured against kobra.systems: every grey is a true neutral (ink `#0a0a0a`, secondary `#6b6b6b`, fills `#f5f5f5`, dark surfaces without a blue cast); edges are crisp 1px lines (`lineTokens.width` 0.5px → 1px) and in-flow cards are flat (`shadowRaised` is `none` in light); the accent is a clearer blue (`#2563eb`). Chat reads at 14px on a 24px line with 12px between blocks and 24px between messages; inline code is 13px on an 8px-radius fill; the user bubble is 8px × 14px. The composer is a filled bar on a 1px edge. TextShimmer sweeps a band of full ink across muted text instead of a translucent overlay. TaskList: progress donut header, a strike drawn across finished steps, faded-foreground ink, transitions instead of switches. ChatReasoning: a nine-dot lattice glyph, 14px text on 1.625 leading, fading edges top and bottom.
- Tool rows keep color for states that need the reader: running and finished rows are neutral, waiting and errors keep warning and danger. The composer's quiet model trigger fills when its menu is open, and model group headings use the shared small-caps label.
- One reading rhythm (`src/theme/shared/prose.styles.ts`) for Prose, chat message content, chat bubbles and rendered assistant markdown. Chat h2/h3 are 1.15em/1.05em with an 8px lead instead of 1.08em with 24px; rendered markdown spaces blocks by `proseGap` instead of browser margins, its code blocks use the recessed CodeBlock surface, table rows use divider hairlines, and links use the accent ink of `Link`.
- Content layout conventions (AGENTS.md): text roles, one header unit, one start edge per region, Prose for reading, labeled groups. Stories follow them through `stories/specimen.tsx`: component stories start on the canvas edge instead of centering, every group of variants carries a small-caps label, and receipts share the caption role.
- The docs app renders package overviews and page copy with `Prose` instead of its own `.docs-prose` rules; the site keeps only its reading size, heading scroll offset and MDX callout styling.

- `standardTheme` and `createMeowUI` no longer load the code-block highlighter. The package sets `sideEffects` to `false`, and the contracts those entries need live in modules that do not import Shiki. Importing `CodeBlock`, `ReadBlock`, `JsonBlock`, or `AssistantView` still loads Shiki. `standardTheme.cssText` stays one complete stylesheet.
- Page and section titles use `uiTokens.fontDisplay`. Their size and weight are unchanged.
- Nested `Section` titles (h3 and below) keep `uiTokens.font`; the serif stays on page and top-level section titles.
- `Table`: the last column fills the remaining width and the table keeps the sum of column widths as its minimum, so the selection column stays 44px instead of scaling with the data columns.
- `Alert`: lighter tinted hairline and tighter title/body rhythm; tone `info` uses `uiTokens.info` instead of the near-black primary.
- Menus and popovers use a 90% opaque surface so text underneath stays out of the way where backdrop blur is unavailable, and a solid surface under `prefers-reduced-transparency`.
- Active `Pill` filters take the accent selection colors; `SegmentedControl` options size from their labels and the selected thumb uses a hairline shadow.
- `NavList` icons center on the label line when a row has a description.
- `AssistantView` wraps user text parts in `ChatBubble`, matching `ChatMessage`.
- One control ladder: `uiTokens.controlHeight` is 36px and `controlLarge` 44px, equal to the button sizes. Input, Select, ChoiceSelect, SearchInput, NumberInput, Tabs and SegmentedControl are 36px by default (Input was 33px, Select/ChoiceSelect/SearchInput 32px, Tabs 42px, SegmentedControl 38px), so mixed rows line up. The chat composer keeps its own lengths.
- Field surfaces share one definition of rest, hover, read-only, focus (focus border plus a soft `focusRing` halo), invalid and disabled; native Select draws the same chevron as ChoiceSelect. New tokens: `fieldPaddingInline`, `borderStrong`, `focusRing`, `selectChevron`, `shadowThumb`, `trackInset`.
- Tabs and SegmentedControl share one track: 3px inset, concentric radii, the same thumb shadow and 14px/500 labels.
- Type ramp tokens `fontMicro` (11px), `fontCode` (12px), `fontLabel` (13px) and `fontHeading` (20px); every theme size maps to the ramp (12.5px and 13.5px become 13px and 14px, code text 11px becomes 12px). Library controls inherit typography instead of the browser's 13.33px default.
- `radiusTokens.mark` (4px) for small marks; off-scale radii (3, 5, 9, 11, 12 and 16px) map to the scale by element size.
- Shape and depth (documented in AGENTS.md): actions, fields, tracks and thumbs stay rounded rectangles with concentric radii; button labels are 500 weight. Depth tokens `shadowRaised` (in-flow surfaces: Card, ListGroup, ResourceCard, WorkCard, Table, Accordion, ResourceLink, Chat Question), `shadowField` (fields at rest) and `shadowFilled` (primary and danger buttons) join `shadowAction`; disabled controls drop their shadow and pressed buttons settle by half a pixel. Neutral fills (`surfaceMuted`, `hover`, `active`, `primarySoft`, `codeSurface`, `sunken`) are true greys. Card, Section, EmptyState, ResourceCard and Dialog titles use -0.01em tracking; Dialog titles are 600 weight.
- NavList group titles use the shared small-caps label role, like Menu and ChoiceSelect group headings.
- Stories, the docs app and the Meowbook gallery use the same tokens and roles: small-caps sidebar labels, divider hairlines, compact toolbar selects, docs examples framed as one specimen with the code recessed under the preview, and gallery specimens raised on a sunken stage.
- Menus, popovers, ChoiceSelect lists and dialogs use a solid `uiTokens.surface` with `shadowFloat` instead of the translucent `menuSurface`. Menu and ChoiceSelect items take concentric 8px fills, 14px labels, small uppercase group headings and full-bleed separators.
- The user message bubble is neutral (`surfaceMuted` with a quiet hairline) instead of the accent tint.
- One material per role (documented in AGENTS.md): Card moves onto `layerTokens.raised` and the `lineTokens.edge` hairline like its siblings (its dark surface was lighter than theirs); Chat Question, attachments and outline Item use the same hairline; `layerTokens.sunken` and `codeSurface` share one tone; markdown code in messages uses the recessed CodeBlock surface.
- Current selection uses `accentTokens.selected` everywhere: NavList, NavItem, ChoiceGroup and multi-row Select now match Table, IconRail, Pill and Tag.
- Avatar initials and the chat message mark use the soft glyph tile instead of a solid inverse block.
- Tabs and SegmentedControl thumbs use `thumbSurface`, lighter than the track in dark mode.
- JsonBlock and OutputBlock summaries draw Disclosure's rotating chevron (`chevronMask`) instead of the native triangle. JSON colors come from `codeHighlightTokens` and `uiTokens`; Menu, StateDot, Tooltip, HoverCard and ANSI magenta no longer hardcode `light-dark()` or hex colors.
- ImagePreview loading and failure states sit in a recessed, bounded frame.
- `PageFrame` with `variant="page"` reserves symmetric scrollbar gutters, so centered content stays aligned with the header when the platform draws classic scrollbars; workspace frames (Dialog, Drawer) keep their body on the header's edge. `PageHeader` centers its actions on the identity block.
