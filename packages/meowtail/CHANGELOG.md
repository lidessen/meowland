# Changelog

## Unreleased

- Remove the `DoodleCat` illustration and its public export.

- Add `journalTheme`, a second concrete theme for blogs and long-form reading, assembled from the
  standard rules with Journal values for the same `ui` roles. Export `journalUiTokenValues`,
  `journalUiTokens`, `journalThemeTokens`, `standardUiTokenValues` and the `UiTokenValues` /
  `TokenValues` types so a theme values every role and nothing else.
- Add `uiTokens.type.display`, `type.reading`, `type.readingSize`, `type.weight.display`,
  `type.quoteStyle` and `ink.reading`. Titles and Prose headings use `display` at `weight.display`;
  Prose copy and `ui.text.reading` use `reading` at `readingSize`; Prose copy takes `ink.reading` under
  `ink.primary` headings, and quotations take `quoteStyle`. The standard values are the UI face, the
  body size, `semibold`, `ink.primary` and `normal`, so the standard theme renders as before; this
  reverses the earlier removal of `type.display` only as a theme role, not as a standard serif.
- Add `EntryList` and `Entry` (L1) for content entries such as posts, notes and releases: a kicker,
  a heading that can link to the entry, a standfirst and its facts, separated by hairlines on the
  surrounding surface. An Entry is a list item in an EntryList and an article alone, and its heading
  level follows the region. `size="feature"` marks the lead entry.
- Add `meowTheme`, a red-and-black recolor of the standard theme after the Meowland mark: black
  ink, actions and inverse surfaces with one red accent. Only colors differ from the standard values.
  Export `meowUiTokenValues`, `meowUiTokens` and `meowThemeTokens`.
- The Meowbook gallery's Theme control switches every story between Standard, Journal and Meow.
- Add `journalFonts` and the `ThemeFont` type: the Fontsource packages that carry the faces Journal
  names. Meowtail ships no font files. The gallery paints Journal stories with those faces.

## 0.3.0-alpha.0

Local breaking authoring candidate; no npm release is implied. It includes the previous unreleased
candidate and requires MeowJSX and MeowCSS `^0.2.0-alpha.0`.

- Components become ordinary functions with static `meta` and finite `Context<typeof Component>.parts`.
  Bind parts through native JSX `ref`; nested ref arrays compose caller refs and local callbacks.
- Registration takes component functions. `createMeowUI({ components })` and
  `installMeowUI({ components }, runtime)` require explicit selection; `meowUIComponents` is the
  complete catalog for hosts that want it. The selective factory retains no complete catalog or
  optional engine graph.
- Themes use type-only component imports with `parts<typeof Component>(name)` and share options from
  implementation-free modules. Component tokens bind through option attributes.
- `ui` from `meowtail/theme` supplies built-in class values. Public `cx` from `meowcss` composes values
  that can be used in `className` or expanded into declarations in `css`. The shared utility fragment
  is last and once in standard, extended and presentation theme assembly.
- Remove the old `*Contract` exports, component definer/part-construction authoring surface,
  `partSelector`, and `surface`/`text`/`interactive`/`focusRing` recipe functions and types without aliases.
  Components forward class lists and composed refs while preserving their existing identities,
  options, Signal updates and lifecycle.
- Importing `uiTokens` or `ui` alone no longer loads the Alert component, the JSX runtime or the theme
  rules, and `standardTheme` is droppable when unused. `DialogPanel`, `DialogHeader` and
  `DialogActions` move to their own modules; `./dialog` and the package entries still export all
  four, so a `Dialog` import no longer keeps the others.

## 0.2.0-alpha.3

Candidate for the next alpha publish. This version is not on npm until the manual release workflow runs.

`meowjsx` stays `0.1.1-alpha.1` and `meowcss` stays `0.1.1-alpha.0`. Neither package's source has changed since those versions were published, so this candidate does not republish them.

### Added

- `Section`, `Page`, `Modal`, and `NavList`, which are on main and were missing from published `0.2.0-alpha.2`.
- `Alert` tone `neutral`, and `marker` `"dot" | "none"`. The defaults stay `tone="info"` and `marker="dot"`, so existing bars keep the status dot. `marker="none"` removes the bar dot. Block layout still draws no dot.
- `EmptyState` `illustration`. Omitting it uses the new `EmptyStack` (three receding cards from the surface ladder with one accent spark, exported from the icons); `DoodleCat` stays exported for hosts that want it. `null` and `false` leave the illustration part out. Presence is fixed for the mount.
- `MermaidDiagram` (`source`, `title`, `caption`, `actions`, `zoom`, `limits`, `onCopy`): Mermaid diagrams drawn as SVG by Pele 1.9.0 (MIT, a new pinned dependency, see THIRD_PARTY_NOTICES.md), loaded only when a diagram mounts. The theme maps every Pele variable to library roles and the chart series to `chartTokens`; server output and failed sources show the source as text. A unit test now keeps optional engines (Shiki, Pele) out of the theme, the registry and the package root.
- `chartTokens` (`--chart-series1` … `--chart-series8`, from `meowtail/theme`): the categorical series colors every chart shares, eight hues in a fixed order validated for color-vision deficiency in both schemes. In light mode slots 3–5 sit below 3:1 on the raised surface, so a chart using them labels its marks or draws a legend.
- `ActionRow` (`align` `start | end`): a row of actions that stays on one line while it fits and otherwise stacks whole, each text action on a full-width line in DOM order with icon actions kept together. `CardFooter`, `DialogActions` and `ChatQuestion` actions use the same fit, measured on the client after layout; server-rendered output keeps a plain wrapping row. AGENTS.md gains the action-row rule.
- The type ramp ([which text style where](README.md#which-text-style-where)): `uiTokens.type.line.*` (the line box of each size, with `bodyCompact` for dense rows and `reading` for long-form copy), `uiTokens.type.weight.*` (`regular`, `medium`, `semibold`) and `uiTokens.type.hero`. The `text()` recipe gains `label`, `heading` and `reading`, and every role binds size, line box, weight and tracking to tokens. `Text` gains `variant="label"`. `standardAuditRules` also rejects literal line heights, literal weights and literals inside the `font` shorthand.
- `PageHeader` `leading`, a mark before the title. Omitting it keeps the title as a direct child of the copy block. `Page` forwards `leading` into that header.
- `Text` with `variant` `body | secondary | caption | eyebrow` and `as` `p | span | div`: copy between components in a theme text role. `eyebrow` is the small-caps group label.
- `TaskList` (`items` of `{ id, label, state, progress? }` with `ChatExecutionState`, `title`, `defaultOpen`): an agent's plan with dashed, current, done, waiting, failed and canceled markers, a done count and a shimmering current step. Mask glyphs `uiTokens.glyph.check`, `glyph.arrow`, `glyph.cross`.
- `ChatReasoning` (`label`, `doneLabel`, `text`, `active`): streaming reasoning that keeps the newest lines under a fading top edge and folds into one disclosure row when done.
- `AssistantView` history: a composer button gathers the reader's own questions into one column over the blurred transcript and jumps back to the chosen turn (`history`, default on; labels `history`, `closeHistory`). Finished replies carry Copy and, with `onMessageAction(messageId, "good" | "bad" | "regenerate")`, the host's feedback intents. `ChatComposer` layout `bar`: one rounded row of attach, draft, trailing choices and send. `IconButton` `label` accepts a Signal. Icons `check`, `thumbs-up`, `thumbs-down`. Shadow role `shadow.dock`.
- Authoring floor for host components ([AUTHORING.md](AUTHORING.md)): recipes `surface`, `text`, `interactive` and `focusRing` from `meowtail/theme`; `standardAuditRules` for `meowcss`'s new `auditCSS`; `extendStandardTheme({ tokens, styles })` assembles a host theme after the standard families; `standardFoundationStyles`. Three typechecked shadcn-style ports live in `tests/fixtures/authoring`. Role `uiTokens.type.touchField` (the 16px iOS no-zoom size).
- `uiTokens.motion.enter` (`--ui-motion-enter`), the arrival curve: dialogs and modals rise out of a slight scale over a fading scrim, toasts rise into place once when mounted, and popovers, menus and the drawer now arrive on the same curve. Reduced motion turns each off.
- A selected `Item` takes the shared selection tint (`accent.selected`) like navigation, tables and choices instead of the pressed gray, and hovering it keeps the tint; an open disclosure item stays the pressed gray.
- Assistant `process` parts take an optional `state` (JSX and JSON): the header shows the shared state badge after the title and keeps `statusText` as a quiet fact beside it. The badge's presence is fixed by the part's first value; later states update it in place. Parts without `state` render as before.
- `highlightCode`, `highlightLanguage` and `HighlightSpan` from the package root: CodeBlock's own highlighter, for hosts that render code ahead of time, such as a static site build. Its colors are the theme's code variables.
- `Prose` with `measure` `reading | fill` and `as` `div | article | section`: long-form reading content. Tokens `uiTokens.space.prose` and `uiTokens.layout.measure`.

### Changed

- Breaking: `external-link` leaves the semantic icon set (`IconName`, `iconNames`, JSON `icon` values); `arrow-up-right` is the one "open elsewhere" icon. New icon `box` is the default glyph for a tool of unknown type, replacing the wrench. [Which icon where](src/icons/README.md#which-icon-where) maps every semantic icon to one intent with placement rules, and a unit test keeps the map and the set in step.

- Breaking: the design system is one role tree, `uiTokens` (surface, inverse, line, ink, state, action, control, accent, status, type, space, icon, radius, shadow, motion, layout, glyph; CSS names `--ui-<group>-<key>`). `palette.ts`, `layerTokens`, `lineTokens`, `accentTokens`, `statusTokens`, `radiusTokens`, every flat `uiTokens` key and every alias are removed. Colors are literal scheme pairs; each status has one text-safe color shared by text and markers (the bright marker greens and the separate success ink are gone); `chatTokens` keeps only chat measures (`leading`, `listGap`, `listMaxWidth`, `userMaxWidth`, `bubbleRadius`, `readingInset`, `leadingGap`, `rowLine`, `fontBody`).

- The theme starts from a foundation fragment (replacing the control-font rule): border-box sizing, contained media, mono code, inherited control type, one focus outline and one thin control-line scrollbar inside a Meowland region; it resets no margins, headings or lists. The 2px focus outline and Card's raised surface now come from the recipes. The lightbox ink uses `inverse.ink`. Meowslides places the foundation before its own fragments.
- One state badge across the library: `Status`, tool rows and `ChatTask` headers show a state as a dot and its word on a soft tint of the state's ink, placed right after the title or target; the host's longer account becomes a caption fact line under the title (new parts `chat-tool-call/fact`, `chat-task/fact`; `ChatTask`'s badge now shows the execution word and its `statusLabel` moves to the fact line). Long `Status` labels wrap inside the badge instead of truncating. Tool rows keep a neutral type glyph in every state; the verb is weight 500 and keeps its words; the target truncates first. Assistant tool parts take an `icon`. Icons `circle-alert`, `circle-pause`. The global corner-shape default now loads before the families, so round dots stay round. `ChatStatus`, the `ChatMessage` status and `TerminalBlock`'s unclean exit join the same badge (each writes `data-tone`; the terminal's Pill becomes a dot and the prompt dot steps aside); Timeline's state word becomes a tertiary caption beside the colored rail dot. Stories no longer use `Badge` for a state. `ProcessGroup` drops the one-dot-per-step strip: `status` takes the state badge right after the name, `trailing` is one quiet tabular fact (a duration or "2 / 4"), and the summary wraps naturally instead of moving the outcome to a second row in narrow containers. `CredentialSource` lists checked variables as a `ListGroup` with a state badge per row (Available, Not set, At runtime) and shows a saved key as one row with a Saved badge and a small Replace action. The `ChatMessage` avatar is a raised disc with a hairline ring, centered on the author line. `SegmentedControl` and the `Tabs` track hug their choices (tabs stay equal width at the widest label) instead of filling the row. New `AssistantMark` (icons): an ink disc with the Meowland silhouette knocked out, flipping per scheme, for the assistant's avatar.
- The Assistant reads like a conversation (after kobra.systems chat-history): no visible names or times, the question in a full-radius fill bubble without an edge, plain replies on the shared prose gap, a top fade on the transcript and a docked bar composer. The nested message list no longer adds a second reading inset; a wide part (a diff, a path) scrolls inside itself instead of widening the column. The `agent-workflow` scenes are now conversations in `AssistantView` instead of a grid of task cards. Assistant composition styles load after the chat families they compose.
- Every component rebuilt against the roles (rules in AGENTS.md, Component rules): `resourceCardTokens` is removed; tracking, radius (`radius.full`), shadows (`shadow.pressed`, `shadow.sheet`, `shadow.knob`), durations (`motion.instant` … `motion.sweep`) and glyph sizes (`icon.small`, `icon.size`, `icon.large`) come from roles; ad hoc gaps sit on a 4px grid; compact rows pad `space.insetBlock` / `space.insetInline`. Titles are 600 for containers and 500 for rows; DetailSection's title is the small-caps label; Accordion headers are card-level 44px rows; hover and expanded states use the translucent `state` overlays, painted over raised surfaces instead of replacing them; read-only fields drop their control line; focus outlines sit at 2px. Tooltip-variant shortcut keys carry their own inverse ink.
- Surface ladder (documented in AGENTS.md): every background is one of `uiTokens.surface` canvas, reading, raised, overlay, fill or field, and every line one of `uiTokens.line` edge, divider or control. The page ground is `#fafafa` so raised cards read as a layer; the chat transcript keeps a white reading surface. Fills take no edge (ProcessGroup, avatars, tool output); misused tokens are repointed (outline Item and ChatQuestion are raised, AppBar is canvas, HoverCard is an overlay, halos and mixes use `surface.knockout`). Secondary ink is darkened to keep 4.5:1 on fills. Docs and gallery split regions with edges; the gallery stage is a recessed fill holding the specimen page.
- Bolder neutral pass, measured against kobra.systems: every grey is a true neutral (ink `#0a0a0a`, secondary `#6b6b6b`, fills `#f5f5f5`, dark surfaces without a blue cast); edges are crisp 1px lines (`line.width` 0.5px → 1px) and in-flow cards are flat (`shadow.raised` is `none` in light); the accent is a clearer blue (`#2563eb`). Chat reads at 14px on a 24px line with 12px between blocks and 24px between messages; inline code is 13px on an 8px-radius fill; the user bubble is 8px × 14px. The composer is a filled bar on a 1px edge. TextShimmer sweeps a band of full ink across muted text instead of a translucent overlay. TaskList: progress donut header, a strike drawn across finished steps, faded-foreground ink, transitions instead of switches. ChatReasoning: a nine-dot lattice glyph, 14px text on 1.625 leading, fading edges top and bottom.
- Tool rows keep color for states that need the reader: running and finished rows are neutral, waiting and errors keep warning and danger. The composer's quiet model trigger fills when its menu is open, and model group headings use the shared small-caps label.
- One reading rhythm (`src/theme/shared/prose.styles.ts`) for Prose, chat message content, chat bubbles and rendered assistant markdown. Chat headings sit on the type ramp with an 8px lead instead of 1.08em with 24px; rendered markdown spaces blocks by `space.prose` instead of browser margins, its code blocks use the recessed CodeBlock surface, table rows use divider hairlines, and links use the accent ink of `Link`.
- Content layout conventions (AGENTS.md): text roles, one header unit, one start edge per region, Prose for reading, labeled groups. Stories follow them through `stories/specimen.tsx`: component stories start on the canvas edge instead of centering, every group of variants carries a small-caps label, and receipts share the caption role.
- The docs app renders package overviews and page copy with `Prose` instead of its own `.docs-prose` rules; the site keeps only its reading size, heading scroll offset and MDX callout styling.

- `standardTheme` and `createMeowUI` no longer load the code-block highlighter. The package sets `sideEffects` to `false`, and the contracts those entries need live in modules that do not import Shiki. Importing `CodeBlock`, `ReadBlock`, `JsonBlock`, or `AssistantView` still loads Shiki. `standardTheme.cssText` stays one complete stylesheet.
- Every line height and weight in the theme comes from the type ramp; off-rhythm line boxes (14, 15, 17, 19px and multipliers such as 1.4 or 1.65) land on the nearest step, and the ANSI bold in terminal output is semibold. All titles use the UI face; there is no serif display face. Standalone Prose reads on a 24px line with h2 at `heading` and h3 at `title`; inside a conversation h2 is a `title` and h3/h4 are semibold body.
- `Table`: the last column fills the remaining width and the table keeps the sum of column widths as its minimum, so the selection column stays 44px instead of scaling with the data columns.
- `Alert`: lighter tinted hairline and tighter title/body rhythm; tone `info` uses `uiTokens.status.info` instead of the near-black primary.
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
