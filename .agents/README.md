# Development skills entry point

These skills are for developing and maintaining Meowland; they are not a runtime protocol and grant no extra permissions. First establish the current contract from the root AGENTS file and package READMEs, then choose the method that changes how you approach this action.

| Natural task                                                                                                                 | Skill                                                            | Main material                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Change JSX/reactive, lifecycle, Web renderer, generic JSON descriptions or CSS generation/adapters                           | [jsx-css-development](skills/jsx-css-development/SKILL.md)       | MeowJSX and MeowCSS READMEs; generic JSON contract                                                             |
| Build or fix components, the complete Assistant or the finite UI JSON catalog; check real layout and interaction             | [ui-development](skills/ui-development/SKILL.md)                 | Meowtail component model and styling sections, Assistant/JSON docs; Meowbook visual evidence as needed         |
| Change public exports, types, dependencies, package resources or CLI; verify tarballs or prepare a local release             | [package-delivery](skills/package-delivery/SKILL.md)             | Package manifests/READMEs, development checks, local release contract                                          |
| Plan cross-package work; stress-test responsibilities/public contracts/lifecycle; choose sufficient verification             | [design-change](skills/design-change/SKILL.md)                   | This request, affected contracts and real counterexamples                                                      |
| Co-author or locally revise browser presentations/courseware with people; iterate narrative, visuals, assets and interaction | [presentation-authoring](skills/presentation-authoring/SKILL.md) | Meowslides, the work's README, [MDX authoring example](../examples/presentation/README.md), Meowbook as needed |
| Review overall responsibilities, package relationships or the shape of a system | [architecture](skills/architecture/SKILL.md) | Current project and package contracts |
| Write, revise or translate project documentation | [doc-writing](skills/doc-writing/SKILL.md) | Verified facts, intended readers and existing documentation |
| Name a concept, module, type or public API | [concept-naming](skills/concept-naming/SKILL.md) | Responsibility and terminology in the affected package |
| Compare research or external methods with the project's actual needs | [research-synthesis](skills/research-synthesis/SKILL.md) | Original sources, project goals and explicit limits |

Routine button copy does not need package release acceptance, and a local implementation does not need an architecture design first. The JSON core's description/reference mechanism belongs to the first item, while concrete UI catalog and Assistant usage belong to the second; tasks spanning both only read the junction. Meowbook tooling source belongs to development tasks by actual mechanism, while watching scenarios and capturing screenshots belongs to the UI skill.

The single entry point for check commands is [docs/development-checks.md](../docs/development-checks.md), and the single entry point for release commands is [docs/releasing.md](../docs/releasing.md). Skills do not maintain a second command table, project progress or release status; check the root README and the current receipt for current package names, license blockers and similar, and do not turn historical failures into permanent rules.

The five project-owned skills remain here. The four general methods above are installed from the public
[lidessen/skills](https://github.com/lidessen/skills) repository with the official Skills CLI 1.7.4 in
project-level copy mode. Their upstream content keeps its source language; project-authored guidance
and documentation remain English. Keep `skills-lock.json` under version control and make general
skill changes upstream, rather than customizing the installed copies.

The [development pack](https://skills.sh/p/SazSJU8yDLRSqIF5) groups ten general methods for projects
that need a wider selection. Meowland currently uses only `architecture`, `concept-naming`,
`doc-writing` and `research-synthesis`; adopting the other methods is an explicit project choice.
Pack installation has not passed local acceptance: download rate limits interrupted verification,
and the available validation copies are incomplete. Keep the repository installation below until
the pack's four-skill selection and supporting files can be verified in a complete download.

To reinstall or update, first verify that those copies have no local customizations, then run this exact
command from the project root:

```sh
npx --yes skills@1.7.4 add lidessen/skills --skill architecture doc-writing concept-naming research-synthesis -a codex --copy -y
```

In this CLI version, `check` can write state and `update` does not preserve the explicit agent/copy
choices when invoking its child `add`. Use the explicit command above for reviewed updates.
