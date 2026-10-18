---
name: design-change
description: Plan cross-package work or challenge changes to responsibilities, public contracts and lifecycle mechanisms. Use real counterexamples and proportionate tests; skip routine implementation or wording fixes.
---

# Planning and mechanism stress-testing

Use this for work whose goal still needs decomposition, or where responsibilities/public contracts/state or lifecycle must change. Local fixes and copy changes under an existing contract are handled directly; they do not require a written plan, a form or a full team first.

## First find the questions that change the choice

Start from the real request, consumers, existing contracts and failure windows; distinguish user-set direction, source facts, candidates and unknowns. Briefly state the expected observable behavior, why the current state is insufficient, and the next unknown that would change the decision; do not work backward from "add a layer/package/state".

Prefer comparing a fix to existing wiring, smaller alternatives and keeping the status quo. When introducing or removing a mechanism, state who continues to carry the necessary responsibility, which callers switch together, and which owner catches failure and recovery; do not merely delete a name, hand complexity to users, or keep old and new fallbacks side by side.

Before implementing a mechanism, have a challenger independent of the author/implementer check the exact boundary with real counterexamples and smaller alternatives. Record a brief rationale and conclusion alongside the current task or original design location; do not build a permanent approval table. Do not repeatedly re-review within existing consensus; only new counterevidence or mechanism drift reopens the affected decisions. When independence or environment is missing, report accurately, continue the parts that can proceed independently, and do not let the author pose as independent approval.

## Make plans and tests reduce rework

Split complex tasks into work packages by real dependencies, name the file writer explicitly, and run independent work in parallel; if an existing task plan can carry the work, do not create another ledger. Each slice has an observable result and the necessary consumer closure; do not treat a summary, a Git SHA or an unrelated governance debt as a new blocker.

Tests first answer "which input goes wrong, what the consumer loses, and which assertion detects it". Prefer reusing real entry points and existing fixtures; mock out-of-scope dependencies without replacing the mechanism this work needs to prove. Do not match source wording, copy an algorithm to compute expectations, or mechanically chase coverage; copy, styles and simple pass-through do not automatically get new tests.

A defect regression should fail when the original error is present; type environments, real DOM and installed resources each use the minimal check that can detect that error. Stop adding tests once necessary risk has evidence; re-run only for new changes, failures or unresolved risks; get the checklist and actual commands from [development checks](../../../docs/development-checks.md).

Deliver the choice that drove the design, how counterexamples changed it, the necessary responsibilities and remaining verification. Report reasoning, implementation, automated checks, visual/interaction observation and user acceptance separately; when only a plan is requested, do not automatically start implementation or release.
