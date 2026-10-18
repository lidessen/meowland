# Component showcase

This app uses `meowbook` to display the public component scenarios in `packages/meowtail/stories` and does not depend on the Rossovia backend.

Run from the repository root:

```sh
bun run build
bun run --cwd apps/showcase dev
bun run --cwd apps/showcase check
bun run --cwd apps/showcase build
```

The local development address is `http://127.0.0.1:13003`; the static build outputs to `apps/showcase/dist`.
Scenarios only pass data, control props or arrange variants; component structure, styles and interactions come from the Meowtail implementation.
Preview styles own the showcase container and do not fill in default styles that components are missing.

Browser specs live in `tests/`; run `bun run --cwd apps/showcase test`.

## Presentation component showcase

The standalone `meowslides` scenario uses a separate Meowbook config; the generic UI gallery does not depend on the presentation package in reverse:

```sh
bun run --cwd apps/showcase dev:slides
bun run --cwd apps/showcase check:slides
bun run --cwd apps/showcase build:slides
```

The development address is `http://127.0.0.1:13006`, and static artifacts are in `apps/showcase/slides/dist`.
`slides.preview.ts` installs the generic UI and the presentation registry through public entry points and assembles the complete `presentationTheme`.
Both showcases are for developing and accepting components; ordinary scripts start from the [minimal MDX work](../../examples/presentation/README.md) and authors are not required to copy the Meowbook config.
