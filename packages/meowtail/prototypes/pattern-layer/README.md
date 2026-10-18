# Composition reference scene

Status: 2026-10-19. This directory is now a **no-style reference scene**, not a separate pattern layer. It drove the public composition layer and keeps the authoring contract executable after publicization.

## What the scene uses

- `ComposerPanel` + `MetaRow` for a 720 dark composer page, plus public `Button`, `IconButton`, `Badge`, and `Icon` for its actions.
- `PageFrame` + `AppBar` + `Alert` + `ComposerPanel` for a 375 light conversation page, plus the public conversation components for its body.
- `ActionRail` remains a public composition primitive; this scene gets the same action row through `ChatComposer`.

The author pages are [composer-page.tsx](src/pages/composer-page.tsx) and [mobile-page.tsx](src/pages/mobile-page.tsx). They contain no `style`, `className`, `class`, CSS import, or raw layout elements. The check statically scans both pages and then uses Chromium to assert the composition relationships. [styles.ts](src/styles.ts) is scene chrome only (the page background and the 720 stage); it does not implement any component.

## Publicization history

The prototype originally carried local `SurfacePanel`, `ComposerPanel`, `ActionRail`, `MetaRow`, `Toolbar`, `Notice`, `PageShell`, and five intent leaves. They were resolved as follows:

- `ActionRail`, `MetaRow`, `ComposerPanel` became public components.
- `PageShell` became `PageFrame`'s `notice`/`footer` slots.
- `Toolbar` became the public `AppBar`.
- `Notice` became `Alert` with `layout="bar"` and its existing `actions` slot.
- `SurfacePanel` is covered by `ComposerPanel` and `Card`.
- The intent leaves are covered by public `Button`, `IconButton`, `Badge`, and `ChatComposer` slots; no duplicate chat leaves were added.

## Run

```sh
cd packages/meowtail/prototypes/pattern-layer
bun build src/main.tsx --target browser --outdir dist
bun check.ts
```

Screenshots are written to `artifacts/pattern-layer/shots/` (gitignored). Current check result: `author no-style findings []`, `PASS`.

## Evidence

- Composer at 720 dark: [composer-dark-900x500.png](../../../../artifacts/pattern-layer/shots/composer-dark-900x500.png)
- Mobile at 375×667: [mobile-light-375x667.png](../../../../artifacts/pattern-layer/shots/mobile-light-375x667.png)
- Mobile at 375×420: [mobile-light-375x420.png](../../../../artifacts/pattern-layer/shots/mobile-light-375x420.png)
- Public app shell story: [app-shell.stories.tsx](../../stories/app-shell.stories.tsx)

The scene is covered by `packages/meowtail/tsconfig.json`, so `tsc -p packages/meowtail/tsconfig.json` checks it; the default browser suite does not load it.

## Boundaries

- It validates static composition and zero-style authoring only. Picker, menu, focus, draft, keyboard avoidance, and submit behavior are not implemented.
- Real iOS WebKit, dark mobile pages, dynamic type, VoiceOver, and user acceptance are not covered.
- The agent eval in [EVAL.md](EVAL.md) ran against the pre-publication local patterns; the reference scene now uses public exports only.
