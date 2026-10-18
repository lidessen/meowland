# UI Improvement · MeowUI experiment

Independent scene copies of real MeowUI components, the standard theme, and Meowbook. baseline keeps the
select, dialog, and layout scenes from before work started on 2026-10-04; trial is for an independent
Agent to diagnose, modify, and re-verify with skills. It is not part of the default stories directory,
connects to no real service, and is not another theme or component library.

Start an ordinary Web preview from the repository root:

```sh
bunx --no-install meowbook serve --config packages/meowtail/prototypes/skill-trial/baseline.config.ts --port 13015
bunx --no-install meowbook serve --config packages/meowtail/prototypes/skill-trial/trial.config.ts --port 13016
```

The standalone canvas is `/canvas.html?story=<id>`. Original ids: select-states, dialog-form,
layout-composition, layout-stack, layout-inline, layout-grid, layout-container.
trial also includes delivery-choice, which demonstrates a concrete selection use case and keeps the
native selection capability comparison. Restart the server after source changes;
`story-state[data-status=ready]` is the visually hidden state node.

```sh
bunx --no-install meowbook check --config packages/meowtail/prototypes/skill-trial/trial.config.ts --json
```

See the [Rossovia historical experiment](https://github.com/lidessen/rossovia/blob/046b044e1bfde8c79b186fab2948ba2260371790/docs/tooling/ui-meowui-trial-2026-10-04/brief.md) for the full task and the evidence at the time; it does not depend on a neighboring product checkout.
The components and theme did not change because of this trial; trial results need independent verification
and do not replace real application wiring or user acceptance.
