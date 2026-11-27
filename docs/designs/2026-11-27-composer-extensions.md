# Composer extensions: choices, triggers and references

Status: accepted after an independent challenger review, 2026-11-27. Owner: Meowtail. First consumer: the Workcells task composer; second:
the complete Assistant.

## Problem

`ChatComposer` is a sound writing surface (one native form, one rounded surface, attachments above
the field, actions below, an external hint), but every capability beyond typing is left to the host:

- **Keyboard submit.** `AssistantComposer` and Workcells each wire their own Enter handler with
  their own IME guard.
- **Inline triggers.** Workcells hand-rolled `@` task references: caret parsing, an absolutely
  positioned list, arrow-key precedence over Enter, text splicing and caret restore. A `/` command
  menu or a second trigger would copy all of it again, with different keyboard and ARIA behavior.
- **Context choices.** The Assistant uses `ChoiceSelect` for model and reasoning; Workcells used
  `MenuButton` for project and priority. Neither is wrong alone, but there is no rule, so a host
  adding model selection next to project selection has to invent the arrangement.

Each new capability (model choice, project choice, mentions, commands) must plug into one place,
share one keyboard order, and leave state with the host.

## Decision

`ChatComposer` stays the single writing surface and gains three host-facing contracts. It does not
gain business state.

### 1. Text ownership: `onValueChange`

`ChatComposer` takes the Autocomplete ownership shape: `value?: MaybeSignal<string>` is controlled
when present; otherwise a local signal starts at `defaultValue`. `onValueChange(text)` is called for
every edit and for every text change the component makes itself (accepting a suggestion, a native
form reset). `onInput` remains the raw native event. Trigger detection always reads the textarea's
own `value` and `selectionStart`, never the signal.

### 2. Keyboard submit: `submitOn`

`submitOn: "none" | "enter" | "mod-enter"`, default `"none"` (today's behavior: Enter inserts a
newline). `"enter"` submits on Enter and keeps Shift+Enter for a newline; `"mod-enter"` submits on
Cmd+Enter or Ctrl+Enter (either key, on every platform). The key path first checks the same blocked
state as the submit button (`disabled`, `readOnly`, `submitDisabled`) and then calls
`form.requestSubmit(submitButton)`, so `onSubmit` and native validation stay the single path; a
blocked composer swallows the key without inserting a newline. IME composition (`isComposing`,
keyCode 229) never submits. `AssistantComposer` drops its private handler and passes `submitOn="enter"`.

### 3. Inline triggers: `triggers`

```ts
interface ComposerTrigger {
  /** One character that opens the list: "@", "/", "#". Unique within one composer. */
  char: string;
  /** "anywhere": at the start or after whitespace. "start": only as the draft's first character. */
  position?: "anywhere" | "start";
  /** Accessible name of the suggestion list, such as "Tasks" or "Commands". */
  label: string;
  /** Host-filtered suggestions for the text typed after `char`; the component never filters. */
  suggest: (
    query: string,
    context: ComposerSuggestContext,
  ) => readonly ComposerSuggestion[] | Promise<readonly ComposerSuggestion[]>;
  /** Shown when a finished lookup returns nothing. Omitted: the list stays closed. */
  emptyMessage?: string;
  /** Turns this trigger off, for example while a command runs. A Signal stays live. */
  disabled?: MaybeSignal<boolean>;
  /** Called after the component has written the accepted suggestion into the text. */
  onAccept?: (suggestion: ComposerSuggestion) => void;
}

interface ComposerSuggestContext {
  /** Aborted when the query changes or the list closes before the lookup settles. */
  signal: AbortSignal;
}

interface ComposerSuggestion {
  /** Stable identity, unique in one list. */
  id: string;
  label: string;
  description?: string;
  /** A decorative mark before the label: a state dot, a type icon. */
  leading?: Child;
  /** A short fact after the label: an id, a shortcut. */
  meta?: string;
  /**
   * Text that replaces `char` + query. Default: `char + id`. `""` removes the trigger text, which is
   * how a command that acts (`/clear`) leaves the draft clean before its `onAccept` runs.
   */
  insert?: string;
  /** Add one space after a non-empty insert unless whitespace already follows. Default true;
   * false keeps the list open so a path can be drilled into (`#src/`). */
  trailingSpace?: boolean;
  disabled?: boolean;
}
```

The component owns, for every trigger the host declares:

- **Detection.** The caret's word (the text between the last whitespace before the caret and the
  caret) must start with a declared `char`; the rest is the query. `position: "start"` also requires
  that only whitespace precedes the word in the whole draft. A query longer than 64 characters does
  not open a list. `input` (except pastes), `keyup` for caret keys, `pointerup`, `focus`, a change
  of the `value` signal and a native `reset` re-evaluate; `blur`, `disabled` and `readOnly` close.
- **Occurrence.** One occurrence is one trigger character at one index. Escape or an outside click
  dismisses that occurrence; it stays closed until the character is removed or the caret leaves
  the word and comes back to a different occurrence.
- **Lookup.** `suggest` runs inside an effect, so a synchronous result re-runs when a Signal it read
  changes (the host's task list refreshes while the list is open). Each run aborts the previous
  run's `AbortSignal` and drops its late result. A pending Promise shows the loading status.
- **Static triggers.** `triggers` is fixed for the mount, like other structural props; the host
  turns one off with its `disabled` Signal.
- **The list.** One listbox in a `Popover` anchored to the writing surface (not the caret) by the
  surface's id. The Popover renders no trigger of its own and sits after the surface in a
  `suggestions` part with `display: contents`, so the `root > surface` structure and its layout do
  not change. It matches the surface's width; `suggestionPlacement` (default `"top"`) flips when
  there is no room. Options use the Item visual language: leading mark, label, description and
  trailing meta. Loading and empty messages are a status line inside the panel.
- **Keyboard order** (one table for every trigger; see below).
- **Insertion.** Accepting replaces `char + query` with `insert ?? char + id` plus one space, puts the
  caret after it, calls `onValueChange`, then the trigger's `onAccept`.
- **ARIA.** The textarea keeps its textbox role (a multiline combobox is poorly supported) and gains
  `aria-autocomplete="list"` and `aria-haspopup="listbox"`; `aria-controls` and
  `aria-activedescendant` are present only while the list is open. Because `aria-expanded` is not
  valid on a textbox, a visually hidden polite live region announces "Tasks: 3 suggestions" or the
  loading and empty messages. Options are `role="option"` with `aria-selected`; focus never leaves
  the textarea. `aria-activedescendant` does not cross shadow roots, so the list lives in the same
  root as the textarea.

| Key (list open)               | Effect                                                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ArrowDown / ArrowUp           | Move the active option, wrapping. The first enabled option is active on open.                                                                               |
| Enter / Tab                   | Accept the active enabled option. With none (loading, empty, all disabled), the key falls through: Enter to `submitOn` or a newline, Tab to focus movement. |
| Escape                        | Close the list for this trigger occurrence; the event does not reach a dialog.                                                                              |
| Anything else                 | Normal text editing, which re-evaluates the trigger.                                                                                                        |
| Any key while composing (IME) | Ignored by the list and by `submitOn`.                                                                                                                      |

With the list closed, `submitOn` decides Enter, and Escape is left alone.

### References stay with the host

The textarea holds plain text (`@t-105`). The component reports accepted suggestions; it does not
keep a reference set, render chips or parse text into tokens. A host that needs structured
references (Workcells `dependsOn`) records them in `onAccept`, renders chips in the existing
`attachments` slot, and prunes references whose token no longer appears in the text. Inline atomic
tokens would require a `contenteditable` editor; that is out of scope and listed under rich text in
the catalog's deferred candidates.

### Choices: one rule, one component

Context choices are values the draft is submitted with (model, reasoning, project, priority). They
are `ChoiceSelect` controls in `trailing`, controlled by the host, `searchable` when the list can
grow (models, projects), with `placement` matching the composer's position. One-off actions (save
as draft, insert a template) are a `MenuButton` beside them. A trigger is for something that becomes
part of the text; a choice is for something that applies to the whole draft. The README states
this rule; `AssistantComposer` already follows it.

Two `ChoiceSelect` gaps block that rule and are closed with it: `disabled` becomes
`MaybeSignal<boolean>` so a choice follows a pending submit, and `ChoiceOption` gains an optional
`description` line for model and project lists. Opening a choice from a command (`/model`) and a
free-form "create" entry are deferred until a consumer needs them; until then a host offers an
"Other…" option and its own field.

## Rejected alternatives

- **A separate `Composer` controller component.** It would duplicate `ChatComposer`'s surface or wrap
  it with a second keyboard owner. Two owners of Enter is the failure this design removes.
- **Signal suggestions plus `onQuery` (the Autocomplete shape).** It works for one field, but with
  several triggers the host would have to route queries and reset lists per trigger. A per-trigger
  function keeps routing and staleness inside the component.
- **Caret-anchored popups.** Measuring the caret in a textarea needs a mirror element and breaks
  across fonts and wrapping. Anchoring to the surface is stable and matches the list's width.
- **Component-owned references.** Pruning and serialization rules differ per host (ids, paths,
  users), and owning them would make the draft a business record.

## Challenger review

An independent review on 2026-11-27 found no reason to change the shape (one keyboard owner,
per-trigger functions, host-owned references) and tightened its edges. Adopted: blocked-submit and
`readOnly` handling for `submitOn`; the Autocomplete ownership shape for text; re-evaluation on
external text changes and reset; Enter and Tab falling through when no option is active; removable
and space-free inserts for commands and paths; a live region instead of `aria-expanded`; tracked
synchronous suggestions and an `AbortSignal`; a per-trigger `disabled`; the Popover structure; the
two ChoiceSelect gaps; ignoring pastes; either modifier for `mod-enter`; the meaning of
`position: "start"`. Deferred: opening a choice from a command and a free-form ChoiceSelect entry,
both until a consumer needs them.

## Verification

- Unit: detection (start, after space, mid-word ignored, `position: "start"`, query limit), insertion
  and caret, stale async results, `submitOn` modes, the IME guard and a blocked submit, ARIA
  attributes.
- Browser: Enter while results are loading, a command that removes its token, a path insert that
  keeps the list open, an external text change and a form reset.
- Browser: keyboard order in a story with `@` and `/` triggers and model/project choices, in light and
  dark, wide and narrow; Assistant Enter still submits; existing composer specs unchanged.
- Consumer: Workcells task composer moves to `triggers`, `submitOn`, `onValueChange` and
  `ChoiceSelect` choices, and deletes its own caret parsing, popup and key handling.
