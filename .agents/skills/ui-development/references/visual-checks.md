# Meowbook visual and interaction evidence

Read this page only when actual viewing, screenshots or interaction evidence is needed. The full CLI and photography contract belongs to the [Meowbook README](../../../../packages/meowbook/README.md); do not copy all parameters into the skill.

## Establish a comparable scene

Confirm this run's source/installed artifacts, real components, configuration and container; an existing server does not mean this version was rebuilt. The shared showcase configuration is `apps/showcase/meowbook.config.ts`; the package's own Meowtail configuration also works. First discover the actual story ids, for example by calling the current source CLI from the repository root:

```sh
bun packages/meowbook/src/cli.ts list --config apps/showcase/meowbook.config.ts --query assistant --json
```

Source-CLI evidence does not replace acceptance of the installed CLI after packing; the root workspace does not guarantee a `meowbook` bin. Installed-state tasks prepare exact artifacts per [development checks](../../../../docs/development-checks.md) and call the consumer's installed CLI from its directory, so `bunx` does not implicitly download another version with the same name from the registry. Then choose this run's subject from the discovery results and enter the needed state with the README's `capture` or `serve --capture`; capturing one control does not mean capturing the whole catalog by default.

Identical content, theme, viewport, DPR and preceding state help comparison. Look first at the whole-screen reading axis, region proportions and cumulative whitespace, then at details in the original image; choose narrow/short windows, light/dark and expanded states according to the question. Canvas padding, constrained heights and temporary host styles change results; do not treat scene patches as component defaults.

## Evidence and interpretation

`capture` is the initial state; use the actual browser path for keyboard, input, expanded and scrolled states, then call `capturePage` from `meowbook/playwright` on the same page. When readiness is needed, wait for the `story-state` ready attribute/attached state; it is hidden after being marked ready, so do not wait for it to be visible. Do not use forced clicks to bypass controls that are genuinely unreachable.

Take evidence from the receipt's directory, manifest and actual image paths; do not guess the "latest screenshot". Actually open the original image; measurements, ARIA, component trees and guides are used to explain doubts, and image count or "no overflow" does not equal a visual pass. Full images, partial crops and full-page captures have different scopes; internal scrolling, lazy loading, native popups and iframes cannot be extrapolated from one long image.

Reduced motion and simulated devices only support the corresponding observation; dark media parameters do not prove the page adopted a dark theme. A focus-processed image does not prove original contrast, and a browser screenshot does not prove the native window/system control experience.

When tools or environment are missing, report the specific unverified parts and continue the work that is not affected; do not infer a visual pass from source and do not take another path around a tool rejection. Put artifacts in this run's temporary/ignored directory; clean up only previews confirmed by identity to have been started by this run, without affecting existing services or real data.
