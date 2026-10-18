# Meowtail composition aesthetic pass

This pass followed the mechanical UI floor audit. It did not add new visual tokens or a second design language; it refined how the existing scale, surfaces and semantic pieces are composed.

## Composer reference

- The meta row is centered under the writing surface, matching the reference's reading axis; gauge, timer and database facts keep their separators and progress.
- In the stacked layout the model/voice cluster is now right-aligned beside send instead of being stranded after attach; the action row reads as one left group (add, Auto review) and one right group (model, effort, voice, send).
- The model cluster now uses an accent count badge and one effort chevron; Auto review keeps its shield and adds a disclosure chevron.
- The ComposerPanel submit keeps the theme's circular submit shape; the panel does not introduce a second button family.
- The prototype composer page remains zero-style: all of the above is public slots, Badge, Icon and MetaRow.

## App shell

- The conversation page now uses the public `ChatConversation` scroll owner instead of a bare `ChatMessageList`. The page opens at the latest message, keeps the header and notice fixed, and leaves the composer at the footer. Previously the story could open mid-transcript with a reply cut under the composer.
- The app shell and prototype mobile page share the same composition; `check.ts` confirms the body/footer invariants and no horizontal overflow.
- The compact notice remains `Alert layout="bar"`; no new `Notice` or device variant was introduced.

## Composer panel gallery

- The public ComposerPanel story uses icon actions (Add, Auto review) rather than text buttons at the narrow viewport, so the phone ChatComposer layout does not read as an accidental toolbar above the editor. The same story still shows the panel's meta row and accent model cluster at desktop width.
- The workspace composition was reduced to one focused task: a `Check the draft` page header, one draft card, and a checks section with contextual Options and Expand controls. The separate page-toolbar row, the second informational card, and the duplicate card title were removed; the page header and content share one content Container. This lowers the reading/operation count and makes the density comparable to the other composed pages.
- It now uses `PageFrame variant="page"` (page insets and 20px section gaps) instead of the app-shell `workspace` variant; the wide page aligns the header, card and checks on one content axis. The draft and checks remain one column at 390.
- Popover coverage stays in the checks header as a labelled icon action; the primary `Check the draft at the end` action remains after the checks list.

## Verification

- Composer at 900 dark and mobile page at 375 were reopened after the changes; screenshots are in `artifacts/pattern-layer/shots/`.
- Unit 190/190, browser 183/183, build, tsc, fmt/lint and the reference `check.ts` pass. A new composer-panel assertion protects the right-aligned trailing group at desktop width.
- The full 260-scene audit still has zero low-contrast, overflow, placeholder, unnamed-control or duplicate-ID findings; remaining clipping is deliberate ellipsis.
- No product API was added; the change is composition and public-story refinement only.
