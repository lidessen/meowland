# Browser presentations and courseware

The works below are all built and started from the repository root according to their own README, each on its own port; they are not PPTX files or published sites.

| Work                                                                | Entry point and launch instructions                                 | Default local address     |
| ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------- |
| Grade 8 Volume 1 Unit 5 · Wild animals — Reading: Protecting pandas | [Protecting pandas reading courseware](protecting-pandas/README.md) | `http://127.0.0.1:13014/` |
| Grade 8 Volume 2 Unit 6 · Sunshine for all — Welcome                | [Sunshine Welcome](sunshine-welcome/README.md)                      | `http://127.0.0.1:13012/` |
| MDX authoring starter example                                       | [Presentation authoring](presentation/README.md)                    | See the work's README     |
| Image loading: same image, different waits                          | [Complete interactive explainer](image-loading/README.md)           | See the work's README     |

Works own their content, classroom state and sources; the shared presentation canvas, content layouts, media and navigation come from Meowslides, and generic UI and layout come from Meowtail.
Preview one key segment first, then keep revising based on feedback; record asset and source verification, browser behavior and actual classroom results separately.

The complete Panda courseware is in `examples/protecting-pandas`, independent of the MDX starter example and the image-loading explainer. Once same-version dependencies/package builds are ready, run from the repository root:

```sh
bun examples/protecting-pandas/build.ts
bun examples/protecting-pandas/serve.ts
```

Open `http://127.0.0.1:13014/`; see the [Panda courseware README](protecting-pandas/README.md) for teaching content, asset evidence and revision workflow.
