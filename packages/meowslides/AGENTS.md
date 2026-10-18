# MeowSlides development

This package owns the presentation runtime, the page/step/activity Context, the media lifecycle,
presentation content components, themes and the trusted local MDX authoring tools. Read the README,
the root AGENTS and the owning skill first. UI, ordinary layout and the standard UI theme are still
provided by Meowtail.

- The runtime root, `/registry` and `/theme` do not import build, CLI, the MDX compiler, the filesystem
  or Meowbook; `/mdx` only provides the runtime adapter for generated content.
- A new presentation Context, contract, token or fragment has exactly one owner; do not keep a reverse
  export from Meowtail or inline a second copy of core.
- Out-of-package consumption uses public exports only. Theme assembly reuses the original
  `standardThemeTokens` and `standardThemeStyles` objects; do not rebuild identity from CSS text.
- MDX, configuration and local components are trusted code; do not automatically execute
  uploaded/generated text, and do not turn finite JSON into an evaluator.
- Source code, tests and documentation are written in English. Stories only consume shared components,
  pass data and drive interactions; they do not copy the player.
- Unit tests live in `tests/unit/`, type cases in `tests/types/`, real browser tests in `tests/browser/`;
  tool-side tests live in `tests/build/`. Unify the build first, then run consumer-side checks.
