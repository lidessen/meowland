---
name: ui-development
description: Build, refine or review Meowtail components, complete Assistant views and the finite UI JSON catalog, using real Meowbook scenes for relevant visual and interaction evidence.
---

# UI development and real-scene walkthroughs

Read the [Meowtail README](../../../packages/meowtail/README.md), the [component development conventions](../../../packages/meowtail/AGENTS.md) and nearby components. First clarify what users read, compare or operate here, then judge structure, visuals and feedback; local polish under an existing design language does not need a full product redesign.

## Default experience and implementation owner

Generic structure, interaction, standard themes and complete compositions are implemented in `packages/meowtail/src/`. Stories/showcase only provide content, state and out-of-scope host actions; they must not hide missing default capability with dedicated CSS, a copied composer or a whole fake page.

Judge the reading axis, proportions, cumulative whitespace, control relationships and states against real theme tokens/parts. Using tokens does not automatically prove harmony; first fix one relationship that affects the task, then return to the same scene after the change. Do not judge aesthetics with hardcoded pixel assertions for color or size, while interaction contracts are still protected by meaningful tests.

For complete compositions read the [Assistant contract](../../../packages/meowtail/ASSISTANT.md): default layout and common interactions should be usable directly, with slots replacing only local parts. Distinguish local UI state from host facts; controlled/local drafts have only one owner; accepting a submission consumes only this snapshot, does not clear later edits, and does not treat "returned" as goal completion. Sources, execution, question eligibility, uploads and persistence are still provided by the host.

For concrete JSON usage read the [UI catalog](../../../packages/meowtail/JSON.md). JSON and JSX use the same components/themes; do not build a second UI. Extend only the finite fields that are actually supported, and keep schema, catalog and component types joined; handle File, function slots and similar capabilities per the current contract, and do not bypass limits through arbitrary props or renderer escape hatches. To change the generic description/reference mechanism, read [JSX/CSS development](../jsx-css-development/SKILL.md) instead of re-reviewing core for every UI field.

## Choose sufficient observation and regression

Look first in a real component scene, then check the affected composition; representative content should cover long text, errors, waiting and disabled states that change layout or action, and placeholder images do not stand in for complete capability. Cover keyboard/focus, scrolling, input drafts and cleanup according to the change; do not mechanically re-run every scene.

Read [visual-checks.md](references/visual-checks.md) as needed for actual screens, photography and interaction evidence. When only doing a visual review, do not expand it into a source audit or full test run by default; when the user asks for a fix, trace it to the component, theme or host owner and re-verify the original action after the change. Automatic check entries are in [development checks](../../../docs/development-checks.md), and passing them does not replace looking at images and operating the UI.

Return the most important visible relationships, changes and real evidence: the corresponding scenes/states, actual theme and size, the original images viewed and operations performed, check results and uncovered scope. State recommendations, actual fixes, limited browser behavior and user acceptance separately.
