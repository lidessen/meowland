# Meowtail selected targets: first contracts

Status: design for the first implementation of six selected targets from the
[component catalog](../../packages/meowtail/COMPONENTS.md#selected-targets): Autocomplete, Token
field, Tree view, Command palette, Form and Chart. The user asked for all six to be designed and
implemented. Each contract below is the smallest one that serves the task the catalog states; what
is left out is listed so a later change can extend it deliberately.

Shared rules for all six:

- The host owns data, decisions and side effects. A component reports intent through a callback and
  changes visible state only through the props it is given, except purely local view state (an
  open list, an active option, a draft) that the host does not need to own.
- Props the host may change are `MaybeSignal`. Lists render with `keyed()` so focus and drafts
  survive updates. Nothing returns a VNode from a Signal.
- Each component has its own module, `meta.parts`, a theme fragment in
  `src/theme/components/<name>.styles.ts`, a story, unit tests and a browser spec, and registers in
  `meowUIComponents`.
- English default copy, every label overridable.

## Autocomplete

Task: type a path, a variable name, a command or a query; optionally accept a suggestion; custom
text stays valid.

- `value: MaybeSignal<string>` with `onValueChange(text)`, or `defaultValue` for a local draft.
  Typing and accepting a suggestion both report the new text.
- `suggestions: MaybeSignal<readonly AutocompleteSuggestion[]>` (`{ value, label?, description? }`).
  The host filters; the component never filters or fetches. `onAccept?(suggestion)` reports an
  accepted suggestion after its value is written to the text.
- `loading?: MaybeSignal<boolean>` shows a loading row; `emptyMessage?` shows an empty row only
  when the host says loading finished and the text is not empty. Without either, an empty list
  simply stays closed.
- ARIA 1.2 combobox with list autocomplete: the input keeps focus (`role="combobox"`,
  `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`); the popup
  is a `listbox` of `option`s in the existing `Popover`.
- Keys: ArrowDown/ArrowUp open the list and move the active option (wrapping); Enter accepts the
  active option and otherwise is left to the form (submit stays native); Escape closes an open list,
  and clears the active option, without changing the text; Tab closes without accepting. Pointer
  selection keeps focus in the input. Typing opens the list and clears the active option, so Enter
  never accepts something the reader did not choose.
- Native form participation: the element is a real `input` with `name`, `required`, `form`, so
  validation and reset stay native. Rest props (`id`, `aria-describedby`, `aria-invalid` from
  `Field`) go to the input.
- Out of scope: inline completion (`aria-autocomplete="both"`), grouped suggestions, async
  debouncing (host), constrained selection (that is the editable-combobox question).

## Token field

Task: add and remove several recipients, labels, filters or references while continuing to type.

- `tokens: MaybeSignal<readonly TokenFieldToken[]>` (`{ id, label, invalid? }`), host-owned.
- `onAdd(text)` is called with trimmed, non-empty draft text on Enter, or on a `separators`
  character (default `[","]`), or on paste containing separators (one call per piece). The host
  decides: it resolves, deduplicates or rejects, and updates `tokens`. The component clears the
  draft after calling `onAdd` unless `onAdd` returns `false`, which keeps the draft for correction.
- `onRemove(id)` from a token's remove button, Backspace on an empty draft (removes the last
  token), or Backspace/Delete on a focused token.
- Keyboard: ArrowLeft at the start of the draft moves focus to the last token; ArrowLeft/ArrowRight
  move between tokens and back to the draft; Home/End jump. A token is one focusable remove button
  labelled "Remove {label}", so each token is reachable and its action is named. Focus after a
  removal goes to the next token, or the draft.
- The draft is a real `input` (rest props and Field wiring land on it). `name` emits one hidden
  input per token id, so a native form submits the values.
- `disabled` disables the draft and remove buttons. `invalid` on a token marks it with
  `aria-invalid` and the danger edge; the host supplies the reason elsewhere.
- Out of scope: suggestions (compose with Autocomplete later), drag reordering, editing a token.

## Tree view

Task: explore files, nested tasks or an outline with expansion, selection and keyboard navigation.

- `items: MaybeSignal<readonly TreeViewItem[]>` (`{ id, label, icon?, description?, disabled?,
  children? }`). A node with `children` (even empty) is a branch.
- `expanded?: MaybeSignal<readonly string[]>` with `onExpandedChange(ids)`, or `defaultExpanded`.
- `selected?: MaybeSignal<string | undefined>` with `onSelect(id)`; single selection, reported, not
  owned (the host may ignore it). `label` names the tree.
- WAI-ARIA tree pattern with roving tabindex: `role="tree"`, `treeitem` with `aria-level`,
  `aria-setsize`, `aria-posinset`, `aria-expanded` on branches, `aria-selected`; children in
  `role="group"`, hidden when collapsed (the subtree stays mounted).
- Keys: Up/Down through visible items; Right opens a closed branch, or moves to its first child;
  Left closes an open branch, or moves to the parent; Home/End; Enter/Space select; `*` opens all
  siblings; printable characters jump to the next visible item whose label starts with them.
  Clicking a branch's chevron toggles; clicking the row selects.
- Out of scope: multi-selection, lazy loading, drag and drop, virtualization (the catalog asks for
  their own evidence).

## Command palette

Task: search grouped workspace actions, see shortcuts, run one, and return focus.

- `open: MaybeSignal<boolean>` + `onOpenChange`, like `Modal`; the host registers the global
  shortcut. Built on the native `Dialog`, so focus is trapped and returns to the opener on close.
- `commands: MaybeSignal<readonly Command[]>` (`{ id, label, group?, keywords?, shortcut?,
  disabled?, icon? }`). `onRun(id)` runs through the host; the palette then asks to close
  (`onOpenChange(false)`). Disabled commands are shown and skipped by navigation.
- Filtering is local and plain: every whitespace-separated query term must appear in the label,
  group or keywords (case-insensitive); order and grouping stay as given. No fuzzy ranking.
- The search input is a combobox controlling a listbox (`aria-activedescendant`); groups are
  labelled `role="group"`s. Keys: ArrowUp/Down (wrapping), Home/End, Enter runs, Escape closes;
  the query resets on each open. An empty result shows `emptyMessage`.
- Out of scope: nested pages, recent commands, async command sources.

## Form

Task: complete a settings or connection form, see validation, submit or cancel without losing
edits. The catalog says: no store, no schema engine, no submission owner.

- A native `form`. The host keeps value ownership in its controls (Field + Input and the rest).
- `onSubmit(data: FormData, event)` is called only after native constraint validation passes;
  the browser's default submission is prevented. The component never resets fields.
- Invalid submit: the browser's own reporting is replaced by focusing the first invalid control and
  marking `aria-invalid` on it; `Field` already shows host messages. The native message is surfaced
  in the form's error summary only when the host gives no `error`.
- `busy?: MaybeSignal<boolean>`: `aria-busy` on the form, the submit button shows `busyLabel` and
  ignores activation, and a second submit is not reported. Controls stay enabled so focus and
  values are untouched.
- `error?: MaybeSignal<Child>` shows a danger `Alert` (`role="alert"`) above the actions;
  `status?: MaybeSignal<Child>` shows a polite receipt (`role="status"`).
- Actions: `submitLabel` (default "Save") and, when `onCancel` is given, a Cancel button
  (`cancelLabel`). `actions?` replaces both for a custom row. They sit in an `ActionRow`, primary
  last.
- Out of scope: dirty tracking, navigation guards, field-level async validation.

## Chart

Task: compare categories, follow a trend, or inspect a distribution in host results. The first
types are the two that cover comparison and trend.

- `type: "bar" | "line"`, `categories: MaybeSignal<readonly string[]>`,
  `series: MaybeSignal<readonly ChartSeries[]>` (`{ id, label, values: readonly (number | null)[] }`).
  `null` is a missing value: no bar, a gap in the line, "No value" in the table.
- `label` names the chart (`figure` + `figcaption`), `description?` adds a caption line,
  `unit?` and `formatValue?(value)` format ticks, tooltips and the table.
- Rendering is SVG in a measured width (ResizeObserver; static output uses a default width). The
  value axis is linear, includes zero for bars, and uses "nice" ticks. Series take
  `chartTokens.series1…8` in order; a ninth series throws.
- Not color alone: a legend with each series name is shown whenever there is more than one series;
  line series also differ by marker shape. Every chart has a data table alternative ("Show data",
  a native `details` holding a `Table`), and the SVG is `aria-hidden` with the figure labelled.
- Pointer and keyboard inspection: the plot is one focusable region; ArrowLeft/ArrowRight move a
  category cursor and a tooltip lists each series value for that category. Pointer hover does the
  same.
- Out of scope: stacking, dual axes, pie, scatter, zoom, streaming animation.

## Challenger review and adopted changes

An independent review challenged the draft above against the APG patterns, the existing prop
conventions and the MeowJSX model. Every required change was adopted; the contracts as implemented
are:

- Shared: live slots that take a Signal are `MaybeSignal<string | undefined>`, never a Signal of a
  VNode. Every list item has a unique `id` or `value`; keyed rows and ARIA ids depend on it.
- Autocomplete: loading and empty text live in a `role="status"` region beside the listbox, never
  inside it. `emptyMessage` shows only when `loading` was passed and is false, the list is empty
  and the text is not empty. Accepting with Enter prevents the form's submission. A native form
  reset reports `defaultValue` through `onValueChange`, so a controlled host follows it. The
  active option clears when it leaves the list. Alt+ArrowDown opens without moving.
- Token field: `invalid` is carried in the token's name and description, not `aria-invalid` on a
  button. Tokens are a labelled `role="list"` with a roving tab stop: Tab reaches the draft and one
  token. Focus moves only after the host actually removes a token. `required` is enforced with
  custom validity on the draft while `tokens` is empty. The first Backspace on an empty draft
  focuses the last token; the second removes it.
- Tree view: `selected` / `defaultSelected` / `onSelectedChange(id)`, like Table. The chevron is a
  pointer-only, non-focusable mark. Disabled items stay focusable with `aria-disabled` and are not
  selectable. The tab stop is the selected item, else the first; when the focused item disappears
  or is collapsed away, focus moves to its nearest visible ancestor.
- Command palette: `label` names the dialog (default "Command palette") and the search input has
  its own label. Running closes first, letting focus return to the opener, then calls `onRun(id)`.
  The item type is `CommandPaletteCommand`. Groups follow their first appearance; after each query
  change the first enabled match is active. The combobox reports `aria-expanded="true"` while the
  palette is open, and a polite status announces the result count. Home and End stay with the
  text caret, so the arrow keys alone move through results.
- Form: the component never writes `aria-invalid`; Field and the host own it. Invalid submit
  focuses the first invalid control. The busy guard is on the form's `submit` event, so custom
  actions and implicit submission respect it. Cancel is `type="button"`. `FormData` includes the
  submitter. The native `onSubmit` is replaced, not forwarded.
- Chart: the SVG is `aria-hidden`; the focusable, labelled region is its wrapper, and the current
  category's values reach assistive technology through a polite live region. `type` is fixed for
  the mount. A ninth series and beyond are not drawn (a console warning, no throw), and values are
  padded with `null` or cut to the category count. Marks and ticks are keyed with
  attribute-bound derived signals; the width comes from a ResizeObserver into a signal.

## Markdown

Task: render Agent text independently of the complete Assistant, including incomplete streamed
syntax, and keep reading, selection and copying usable. The catalog asks to reuse the existing
renderer before considering another parser and to keep the Assistant content policy.

- `Markdown` takes `text: MaybeSignal<string>` and reuses the Assistant's `marked` configuration:
  GFM, line breaks, raw HTML and images shown as text, and only explicit `http:`, `https:` and
  `mailto:` links navigate (new tab, `noreferrer`). No other parser is added and nothing executes.
- Blocks, not one HTML string: the text is split into top-level blocks and each block is its own
  element (the `p`, `ul`, `pre` … itself), keyed by its position and opening tag. A streamed chunk
  rewrites only the block whose output changed, normally the last one, so a selection or a copy in
  earlier blocks survives; the shared prose styles still see blocks as direct children.
- `streaming?: MaybeSignal<boolean>` repairs the open tail before parsing, so incomplete syntax
  does not flash as raw markers: an unclosed inline code span, `**`, `~~` or `*` is closed, and a
  half-typed link shows only its text until it is complete. An open code fence already renders as
  code. Repair never runs on finished text, and the root reports `aria-busy` while streaming.
- `renderCode?(block)` lets a host draw fenced code with `CodeBlock` (copy, highlighting) by
  receiving a Signal of `{ code, language }`; without it fences stay a themed `pre`, so importing
  Markdown does not pull the highlighter.
- `AssistantMarkdown` becomes a thin use of the same block renderer, and the Assistant passes
  `streaming` for the last text part of a streaming message, so the Assistant gains the same
  selection and tail behavior. Its part name, styles and content policy are unchanged.
- Out of scope: math, footnotes, Mermaid fences (the host can route them through `renderCode`),
  MDX and any HTML passthrough.

### Markdown review and adopted changes

An independent review challenged this section. Adopted:

- Blocks take their element from the token type, never from parsing renderer HTML; only the
  renderer's own escaped output is inserted, as before. Raw HTML and top-level text tokens become
  a `p`; space and definition tokens render nothing and do not count toward the key index.
- The whole text is lexed once per update with the link definitions applied to every block, and
  every block's output is compared, because a late definition can change an earlier block. Each
  block compares its HTML string before writing, so an unchanged block is never rewritten.
- The key carries the element and an ordered list's start, so a paragraph that becomes a heading,
  list or table, or a list whose start changes, remounts. `renderCode` is called once per fence
  mount with a Signal that follows the code and its language.
- The tail repair touches only the last paragraph and nothing inside an open fence, an indented
  code block, a code span, a URL or an autolink. Bullets, spaced operators (`5 * 3`) and escapes
  are not markers, only `](` marks a half-typed link (`array[0` and `[1]` stay text), and `_`
  and `__` are not repaired, so snake_case never gains a marker. Each rule has a test.
- Blocks stay direct children of the element carrying the `assistant-markdown` or `markdown` root
  part, so the shared prose rhythm applies unchanged; `AssistantMarkdown` accepts a plain string or
  a Signal like `Markdown`.
- Known limits: the block still being written is rewritten as it grows, so a selection inside it
  does not survive, and its repaired form re-renders once when streaming ends. `renderCode` covers
  top-level fences only; fences inside lists or quotes stay a `pre`. The whole text is lexed per
  update, as before.
