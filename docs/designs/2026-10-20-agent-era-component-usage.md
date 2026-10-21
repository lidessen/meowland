# Lowering meowtail's usage cost for agents

Status: design proposal, revised after an independent challenge. Nothing here is implemented; it
records the problem, the recommended surface, the alternatives that were rejected, and the checks
that would make the decision ready to implement.

## The problem

`meowtail` exports 122 component values and registers 121 contracts. That is useful for a human
building a product: each position in the interface has one owner, and unusual layouts can be
assembled from primitives. It is a poor shape for an agent that writes a screen once and moves on.

Discovery is thin as well. The generated agent index (`apps/docs/dist/llm.txt`) is 149 lines of
route names and a short content rule, not API guidance; the 126 generated component pages are
mostly story source (68% of their words), with an API reference made of style axes and DOM parts
rather than props, and no page exists for forms at all. An agent that wants to build a form today
has to infer the composition from the primitive pages, the stories or the package README, and then
assemble it correctly on the first try.

The cost an agent pays is not mostly tokens. An agent-written screen behaves more like a program
that has to be correct on the first run than like code a human will iterate on, so the surface is
judged by the minimum correct program it forces, not by the number of features it offers. Measured
on the library's own form-like scenes, most of that program is mechanical wiring that carries no
product meaning: pairing `htmlFor` with an input `id`, choosing a description/error id, assembling
the field label around the control, wrapping fields in a layout, deciding who owns the value,
preventing the native submit, and remembering whether the select takes children or options. An
agent that has never used a component before has to get all of that right on the first attempt, and
a human reviewer then has to verify it. The components already promise that a correctly integrated
instance gets usable defaults; the missing piece is a default that finishes a whole task instead of
one part of it.

The numbers are small but consistent. A three-field settings form (text, select, switch) currently
needs at least five distinct names: `Field`, `Input`, `Select`, `Switch` and `Stack`; six with a
`FieldGroup`, eight with a `Container` and a submit `Button`. The package has at least six
form-like stories (`foundations`, `language`, `dialog-form`, `dialog-layout`, `foundation`,
`toggle`): the field-based ones pair `htmlFor` with `id` on every field and write their own form
wiring, and the toggle scene hand-builds its own submit and reset row. The three sampled in this
document carry three to eight form-relevant imports each. The proposal's target for the same three
fields is two names, three field elements and no id pairs.

The user's sketch is the right shape:

```tsx
<Form>
  <FormItem label="Visibility" type="select" options={visibilityOptions} />
</Form>
```

The interesting part is not the shorter spelling. It is that one element decides a field, and one
element decides a form, so the author supplies content and values rather than assembly. This
document generalizes that idea into a rule for where the library should grow next, and then
proposes the first concrete component family under that rule: `Form` and `FormField`.

One field of the notification scene in `packages/meowtail/stories/foundations.stories.tsx` shows
the difference. Today:

```tsx
<Field label="Alert frequency" htmlFor="notification-frequency">
  <Select id="notification-frequency">
    <option>Only when attention is needed</option>
    <option>Every time work completes</option>
  </Select>
</Field>
```

Under the proposal:

```tsx
<FormField
  name="frequency"
  label="Alert frequency"
  type="select"
  options={[
    { value: "attention", label: "Only when attention is needed" },
    { value: "complete", label: "Every time work completes" },
  ]}
/>
```

The author no longer decides where the label goes, how it is associated with the control, which
component the select is, or what the submitted value looks like. The field is still one element per
field in the form, and the options are data in both versions; what disappears is the per-instance
assembly and the ownership question.

## What the repository already does

The direction is not new to this codebase; it is the one place where the library has been growing
deliberately:

- `AssistantView` is a complete composition: the host passes messages, a draft signal and submit
  callbacks, and the library owns the entire screen (packages/meowtail/ASSISTANT.md).
- `ChatComposer` and `ComposerPanel` take the whole input region, and `ChatConversation` owns the
  scroll region; the host supplies content and callbacks, not the internal structure.
- `Tabs` takes `items`, `Table` takes `columns` and `rows`, `ChoiceGroup` takes `options`
  (packages/meowtail/src/components/tabs.tsx, table.tsx, choice-group.tsx). These are small
  examples of the same move: repeated structure goes in data, slots stay for exceptions.
- The presentation layer chose six lightweight recipes over six template components, because the
  repeated part there was content, not wiring (docs/records/2026-10-18-ui-foundations.md).

The other repository constraints still apply. Shared components are implemented once in
`packages/meowtail/src/`; the theme owns the visual rules; the story only supplies content; the
finite JSON catalog is not a general UI runtime; and a new composition must not become a second
visual implementation of the components it arranges.

## Cost model

An authoring surface can be judged on five costs. The Form proposal is aimed at the middle three.

| Cost     | What the author pays                                            | What lowers it                                              |
| -------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| Discover | finding the right names and reading enough docs to trust them   | a small set of canonical entry points, one story each       |
| Decide   | choosing among props, owners, layouts and states                | a closed set of field kinds, defaults that need no decision |
| Assemble | writing the wiring that is identical in every instance          | one component that owns labels, ids, ARIA, layout, submit   |
| Verify   | checking that the assembly is correct                           | native semantics; a canonical example to compare against    |
| Repair   | finding and fixing a wrong prop, missing id or broken ownership | typed closed sets; one obvious way to do the common case    |

The rule that follows: **a complete composition is justified when the repeated part is mechanical
wiring, not when it is visual expression.** Labels, ids, ARIA, value ownership, validation and
submit state are mechanical; the parts inside a `Card`, a menu or a page header are expressive, and
those should stay composable. This is also why the proposal starts with forms and does not add a
tier of "agent components" for every screen region.

The small features do not disappear. Human authors still compose unusual interfaces, and removing
variants that already have consumers would break the library without making the default path
cheaper. What changes is placement: the complete compositions lead the README, the package guide
and the agent index; the primitives and their options stay documented as the second level. The
budget rule for new work is simple: a prop or a variant on a complete composition is justified only
when it removes a decision from the common case or opens a real escape; a customization knob that
the common case never needs is not added.

## What the prior art says

The external evidence points the same way, and it also sets limits on what to copy:

- **A complete field beats a field recipe.** MUI's `TextField` is documented as "a complete form
  control including a label, input, and help text" while the five-part `FormControl` composition is
  the customization path ([MUI TextField](https://mui.com/material-ui/react-text-field/)). The
  generative-UI catalogues do the same: json-render's `Input` packs label, checks, validation and
  an error paragraph into one component
  ([json-render catalog](https://github.com/vercel-labs/json-render/blob/main/packages/shadcn/src/catalog.ts)).
- **Fixed vocabulary, not free invention.** OpenUI, assistant-ui's `present` and json-render all
  restrict generation to a registered set of components; none lets the model invent components
  ([OpenUI](https://github.com/thesysdev/openui/tree/8d9c4c3b108a7b5352192a6a9d7327bdf7ea19b5),
  [assistant-ui](https://www.assistant-ui.com/docs/tools/generative-ui)). That matches the finite
  JSON catalog decision already in this repository.
- **The compound form is the expensive path, not the missing one.** In Ant Design a field is a
  `Form.Item` with a name path, rules and an injected child; in classic shadcn it is five
  coordinated parts around a controller. The documented failure points are the ones an agent hits:
  label/control id association, injected props into a wrapper, omitted `name` or default values
  ([Ant Design Form](https://ant.design/components/form),
  [shadcn form](https://v3.shadcn.com/docs/components/form)).
- **Some generative stacks make forms a data array.** OpenUI describes a form as
  `Form(name, buttons, fields?)`, with each field a `FormControl(label, input, hint?)` whose input
  is a closed union of controls
  ([OpenUI syntax](https://github.com/thesysdev/openui/blob/8d9c4c3b108a7b5352192a6a9d7327bdf7ea19b5/docs/content/docs/openui-lang/syntax.mdx)).
  That is the strongest external argument for the `fields` array alternative considered below; it
  is also a runtime DSL, not TSX, and Meowtail's path is code.
- **A registry and canonical recipes are discovery aids, not a contract.** shadcn ships a registry
  manifest, an MCP server and `llms.txt`; assistant-ui and Ant Design ship `llms.txt` too
  ([shadcn registry](https://ui.shadcn.com/docs/registry/registry-item-json),
  [llms.txt](https://llmstxt.org/)). These cut finding cost; they do not validate the result.

The parts worth keeping, in the order the evidence supports them: one complete field, a closed
input vocabulary, defaults that hide native wiring, and one canonical form example. The runtime
DSL, the hosted generator and the generic schema-to-form engines are rejected because they either
add an interpreter this repository does not want or turn business JSON into execution.

## Choosing the next composition

The rule gives a short checklist. A new complete composition is worth building when:

1. the task appears repeatedly in real scenes or agent-written screens;
2. the repeated part is mechanical: the same ids, ARIA, state ownership or submit wiring every
   time;
3. authors actually get it wrong, or review it every time;
4. the component can be assembled from existing parts without taking over their visuals;
5. one default instance completes the task, and content or slots remain for the exceptions.

Applied to the current families:

| Family                      | Repetition                        | Verdict                                                                                             |
| --------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| Form                        | labels, ids, ARIA, values, submit | Build this family; highest frequency and almost entirely mechanical                                 |
| Dialog                      | panel, header, actions, close     | Mechanical too, but native `<dialog>` supplies much of it and frequency decides; revisit after Form |
| Card                        | header/title/content/footer       | Parts are expressive; keep them composable                                                          |
| Page frame, header and rail | page regions and layout           | The existing shells already carry the common shapes; no new wrapper without evidence                |
| Chat and Assistant          | whole conversation regions        | Already complete compositions; the model this proposal copies                                       |
| Tabs, Table, ChoiceGroup    | repeated rows, options, columns   | Already data-first; the model for the field kinds                                                   |

The table is the reason this proposal does not add a general "agent kit": the next candidates have
to earn their place with the same evidence, and the form is the family where the mechanical part is
currently missing entirely. The Dialog row is deliberately not a decision: the rule says it is a
neighbour, and its frequency in real screens decides whether it ever becomes a component.

## The proposed surface

### `Form`

```tsx
import { Form, FormField } from "meowtail";

<Form
  defaultValues={{ name: "Meowland", visibility: "private" }}
  onSubmit={(values) => save(values)}
>
  <FormField name="name" label="Project name" required />
  <FormField
    name="visibility"
    label="Visibility"
    type="select"
    options={[
      { value: "private", label: "Only me" },
      { value: "members", label: "Project members" },
    ]}
  />
  <FormField name="alerts" label="Email alerts" type="switch" description="Send me a message." />
</Form>;
```

A controlled form uses the library's existing ownership convention: presence decides the owner,
and when the host passes a signal it must also accept changes through the callback.

```tsx
const values = signal<FormValues>({ name: "", visibility: "private" });

<Form values={values} onValuesChange={(next) => (values.value = next)} onSubmit={save}>
  <FormField name="name" label="Project name" />
</Form>;
```

The default `Form` renders: a native `<form>`, the children in a vertical field stack, and one
primary submit button. `actions` replaces the default button row; arbitrary content (an `Alert`, a
`FieldGroup`, a paragraph) can sit between fields. `submitLabel` changes the default button text
and defaults to "Save". There is no gap, alignment or width prop in the first slice: the theme
chooses the spacing between fields and before the action row, and a host that needs a different
arrangement uses the existing layout primitives inside the form.

| Prop             | Type                                      | Behavior                                                                                                                          |
| ---------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `onSubmit`       | `(values: FormValues) => void \| Promise` | Required. Runs after the browser has accepted the native constraints; a returned promise disables the submit entry while pending. |
| `defaultValues`  | `FormValues`                              | Initial values of an uncontrolled form.                                                                                           |
| `values`         | `ReadableSignal<FormValues>`              | Controlled values. The form never writes the signal; `onValuesChange` is required for the value to come back.                     |
| `onValuesChange` | `(values: FormValues) => void`            | Called when a field's committed value changes; number fields report on blur, Enter or step, not per keystroke.                    |
| `errors`         | `MaybeSignal<Record<string, Child>>`      | Host-owned field messages, usually from a rejected submit.                                                                        |
| `disabled`       | `boolean`                                 | Disables all fields and the submit entry.                                                                                         |
| `submitLabel`    | `Child`                                   | Default "Save".                                                                                                                   |
| `actions`        | `Child`                                   | Replaces the default submit row.                                                                                                  |
| native props     | `Props`                                   | `id`, `name`, `aria-*`, `noValidate`, `className` and so on pass through the `<form>`.                                            |

### `FormField`

| Prop                                | Type                         | Notes                                                                                           |
| ----------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `name`                              | `string`                     | Required. Key in the values record and the native field name; unique per form.                  |
| `label`                             | `Child`                      | Required for single controls; the group label in later kinds.                                   |
| `type`                              | `FormFieldKind`              | Closed union, default `"text"`.                                                                 |
| `description`                       | `MaybeSignal<Child>`         | Supporting text under the label.                                                                |
| `options`                           | `readonly FormFieldOption[]` | Required for `select`; not accepted for other kinds.                                            |
| `defaultValue`                      | `FormValue`                  | Uncontrolled only; overrides the form-level default.                                            |
| `required`, `disabled`, `readOnly`  | `boolean`                    | Native constraints; `disabled` also falls back to `Form.disabled`.                              |
| `hidden`                            | `MaybeSignal<boolean>`       | Field stays mounted but its value is omitted from submission.                                   |
| `placeholder`, `autoComplete`, `id` | `string`                     | Pass-through; `id` defaults to a generated one.                                                 |
| `min`, `max`, `step`, `precision`   | `number`                     | Number kind only; enforced by `NumberInput`, not the browser.                                   |
| `rows`                              | `number`                     | Textarea kind only.                                                                             |
| `children`                          | `Child`                      | Escape hatch: content after the control, still inside the field (for example an inline action). |
| `controlProps`                      | `Props`                      | Escape hatch: extra attributes for the underlying control such as `autofocus`; last resort.     |

`FormValue` is `string | number | boolean | undefined`; `FormValues` is
`Readonly<Record<string, FormValue>>`; `FormFieldOption` is
`{ value: string; label: Child; disabled?: boolean }`. The kinds convert values at runtime; the
submitted record is still `FormValues`, so the consumer narrows by key. A component generic over
the caller's values interface is not available: `defineComponent` fixes one props type, and
children of `Form` are rendered by the framework rather than flowing into the form as typed data.

The two escape props are a second props surface, not a second visual UI. They exist because real
form scenes already carry in-field extras (an inline action under a select) and control-level
attributes (`autofocus`); the alternative is to leave the field and lose the form binding. They
stay last-resort props, and the spike counts how often they are actually needed.

The closed kind set for the first slice:

| `type`                                                                                          | Control              | Value type            |
| ----------------------------------------------------------------------------------------------- | -------------------- | --------------------- |
| `text` (default), `email`, `password`, `url`, `tel`, `search`, `date`, `time`, `datetime-local` | `Input`              | `string`              |
| `textarea`                                                                                      | `Textarea`           | `string`              |
| `number`                                                                                        | `NumberInput`        | `number \| undefined` |
| `select`                                                                                        | `Select`             | `string`              |
| `switch`, `checkbox`                                                                            | `Switch`, `Checkbox` | `boolean`             |

A discriminated prop union is already idiomatic here (`SearchBlock` and `WebBlock` use one for
their content branches), but the precedent uses a required `kind`. A defaulted `type` weakens the
narrowing: text-like fields may omit `type`, so excess-property checks still catch `options` on a
textarea or `rows` on a select, but the implementation narrows explicitly. If the type tests show
that is too weak, the spike makes `type` required for every kind.

Radio and checkbox groups are deliberately absent from the first slice: their visible label is a
`fieldset` legend rather than a control label, so they need a separate label/ARIA model. They are
the first follow-up kinds once that model is tested. Custom controls are not collected by the form;
an exotic control stays a composition of `Field` and the control, with the host owning its value,
and is documented as such rather than being given a render prop.

### Ownership and behavior rules

- **Values are converted per kind at runtime.** A number field produces a number, a switch a
  boolean, an empty number `undefined`. Unknown keys that arrive through controlled `values`, and
  keys seeded in `defaultValues` without a field, pass through to `onSubmit`.
- **The submitted record and the live record differ.** The store keeps every field value,
  including hidden and disabled ones. `onValuesChange` reports the live record; `onSubmit` removes
  fields that are hidden or disabled, matching native form semantics. `readOnly` fields stay in
  the submission. This difference is documented and tested; it is the price of supporting
  conditional fields without a second state model.
- **Controlled and uncontrolled use one mechanism.** The form exposes a values signal to its
  fields: the host's signal when `values` is passed, an internal signal seeded from
  `defaultValues` otherwise. This is the same presence-decides-owner rule as `Tabs`, `ChoiceGroup`,
  `NumberInput` and `AssistantView`'s draft, not a new concept. When both `values` and
  `defaultValues` are passed, `values` owns and `defaultValues` is ignored.
- **`onValuesChange` cannot be enforced by the type.** The pairing with `values` is documented and
  checked in the spike; a development warning is possible but not promised. The library has no
  generic values parameter, so the signal type is the flat record, not the caller's interface.
- **Static props stay static.** `type`, `options` and `name` are fixed for the mount, like
  `Tabs.items`; options that arrive from a request have to be loaded before the form mounts.
  Changing values is live; changing a field's kind or option list means remounting the form.
- **Native behavior is the default behavior, with one exception.** The `<form>` element gives
  Enter-to-submit, `required`/`type` constraint validation, browser validation bubbles and focus on
  the first invalid field. `NumberInput` is a text-like control with a `role="spinbutton"`; its
  `min`, `max` and `step` are enforced in JavaScript and are not native constraints, so a number
  field cannot rely on the browser for range validation. No client-side validation framework is
  added; hosts that need rules beyond native constraints use the escape path or the controlled
  `errors` map.
- **Defaults finish the task.** Generated ids link label and control; description and error ids are
  wired through `aria-describedby`; invalid fields get `aria-invalid`; the default submit row is
  present; an async `onSubmit` disables its submit entry until it settles. An author who supplies
  nothing beyond `name`, `label` and `onSubmit` gets a usable, accessible form.
- **The host owns business facts.** Submission meaning, persistence, authorization, server
  validation messages and success navigation stay with the host. `errors` only displays what the
  host sets; the form does not infer failure from a rejected promise.
- **Form-level disabled is static in the first slice.** `Form.disabled` and `FormField.disabled`
  are booleans. The controls do not agree on live disabling today (`Select.disabled` accepts a
  signal, `NumberInput.disabled` is a plain boolean), so a live form-level state needs either a
  native `<fieldset disabled>` wrapper or per-control support. The spike tests that route only if a
  real scene needs live disabling; until then an async submit disables only the submit entry.
- **Hidden fields are not submitted.** `hidden` keeps the field mounted (so a dependent control can
  come back with its draft intact) but removes it from the submitted values. The control is also
  disabled while hidden, so a hidden `required` field cannot block native validation. This
  deliberately differs from a native hidden input and is documented.
- **Reset is intercepted, not left native.** A reset button inside `actions` must not let the DOM
  and the store diverge. `Form` listens for the native `reset` event, prevents the native reset and
  restores its store: the per-field defaults in uncontrolled mode, and `onValuesChange` with the
  defaults in controlled mode (the host applies it). The spike validates this against a real reset
  button; if it proves unreliable, the fallback is to document that reset is unsupported in the
  first slice rather than ship a silent desync.
- **A controlled host has the final say.** When the host passes `values`, the form calls
  `onValuesChange` but never writes the signal. A host that ignores a change leaves the visible
  control and the signal out of step; the controls already differ here (`Checkbox` and `Switch`
  reassert a controlled value on change, `ChoiceGroup` reconciles after a rejected radio change,
  while `Input`, `Select` and `Textarea` have no such pass). The spike compares a synchronous
  reconcile after the event against doing nothing; it does not need a microtask.
- **Dependent fields need an observable signal.** Uncontrolled forms expose their values only
  through `onValuesChange`; a host mirrors that into a signal for `hidden={derived(...)}`, or uses
  controlled `values`. This is the main reason controlled mode exists in the first slice.
- **`FormField` belongs to a form.** It exists to bind one value into the form's store; outside a
  `Form` it has no owner and should fail loudly, following the existing `Reveal` precedent. The
  spike decides whether this is a thrown error, a type-level requirement (not achievable through
  `Child` alone), or both.
- **Nested and duplicate forms are errors.** A `Form` inside another form root (`Form`,
  `DialogPanel as="form"`, `ChatComposer`, the Assistant question view) is invalid HTML; the
  component should detect a form context and fail in development. Duplicate `name` values are a
  host error and should be reported in development rather than silently overwritten.

### What the form is made of

`FormField` renders the existing `Field` for the label, description and control, and the existing
input family for the control. `Form` adds only the `<form>` element, the field stack and the action
row. The theme gets one new fragment for the form root, the stack and the action row; field
appearance stays owned by `field.styles.ts` and the control styles. There is no second error
message style and no copied input implementation.

`FormField` needs its own root part around `Field` for three things the current `Field` cannot
carry: the live `hidden` binding, the `className`/data attributes, and a generated id when two
forms use the same field names. `Field` keeps the label, description, error and control parts. The
generated id is also the natural place to decide the form's id namespace, because `Field` does not
generate one and MeowJSX has no `useId`; the existing module counters in `FieldGroup` and
`ChoiceGroup` are the precedent.

Two mapping details matter and belong in the spike. For a `switch` or `checkbox` field the visible
label belongs to the control itself (`Switch` and `Checkbox` render their own `<label>`), so
`FormField` passes an empty control label and lets `Field`'s label own the association through
`htmlFor`. That avoids nested labels, but it is a layout decision: the control's empty label span
still contributes its gap and the visible label sits above the toggle. The spike compares that with
a suppressed `Field` label and the control's own label, and keeps whichever scene reads correctly.
Radio groups do not map this way at all, which is why they are deferred.

`Form.actions` can contain any existing buttons; the default row is a `Button type="submit"`. A
form inside a dialog composes with `DialogPanel` whose `as` stays `"div"`; `DialogPanel as="form"`
remains for the simple case where the host does not use `Form`, because nested `<form>` elements
are invalid HTML. When the dialog needs its own action layout, the dialog's buttons belong in
`Form.actions`, not in a second row inside the field list.

## Enabling change: live field messages

`Field` currently decides at setup whether it has a description or error, and renders those parts
only when the prop is present (src/components/field.tsx:35-50). That is fine for static text and it
is why hosts today mount a new `Field` to show a server error. `Form.errors` is a signal, so the
message can appear after the submit; the field part has to exist to receive it.

The recommended change is bounded but not trivial. `Field.description` and `Field.error` accept a
`MaybeSignal<Child>`, and `Field.invalid` becomes `MaybeSignal<boolean>`. A signal keeps the part
mounted and binds `hidden` from emptiness; `aria-invalid` becomes live; and the merge that writes
`aria-describedby` must combine the host's existing value with the derived description and error
ids instead of replacing a static string, or the live wiring overwrites a host attribute. Static
props keep exactly today's behavior. The alternative — `FormField` owning its own error text and
ARIA outside `Field` — was rejected because it would create a second owner for field presentation
and let the two drift.

This is the only existing component whose contract changes in the first slice. It has no dedicated
test today (the current field coverage is static HTML in `contracts.test.tsx`), so it gets its own
`tests/unit/components/field.test.tsx` and counterexamples: message appears, changes and clears
after mount; `aria-describedby` follows and keeps a host value; `aria-invalid` follows; narrow and
dark scenes. The error text is associated with the control through `aria-describedby`; a separate
announced summary region is not part of the first slice.

## Alternatives considered

**Do nothing beyond docs and examples.** The cheapest option, and it is still worth doing: a story
with the canonical form composition gives agents something correct to copy. But the example is the
wiring; every copy carries the same id/ARIA/ownership decisions, and the failure mode is exactly
the thing that is hard to review. Docs alone do not remove the assembly.

**Smaller primitive fixes only.** Generate an id inside `Field`, inject it into the single control
child, and add a `FormActions` row. This is genuinely smaller and is kept as the fallback. It
removes some wiring but keeps the import list, the per-field control decision and the
value-ownership problem; the author still assembles.

**Native `FormData` collection.** The form could own only layout and submission: render a native
`<form>`, read `new FormData(form)` on submit, and parse values by the field registry, with no
values store. This removes the store, reset, hidden and disabled rules, and it is exactly how the
existing `dialog-form` story already works. The costs are: values arrive as strings and need the
same per-kind parsing; hidden fields participate unless explicitly disabled; controlled values and
dependent fields need a separate path anyway; and `onValuesChange` would be built from change
events rather than state. The spike compares this variant with the store before the state model is
fixed, because it may be the smaller first slice.

**A data array: `<Form fields={[...]} />`.** One component, one literal, no children. It follows
the `Tabs.items` precedent, the OpenUI shape, and is probably the shortest thing an agent can emit.
It was rejected as the canonical shape because it turns composition into configuration: inserting
a section, an alert or a custom block between fields becomes a schema extension, and the user's
phrase "composition over customization" points the other way. If evidence later shows that most
real forms are flat field lists, this can be added as a shorthand over the same implementation, not
as a second UI.

**JSON-first forms.** The finite catalog could gain a `Form` entry so an agent emits data instead
of TypeScript, the way OpenUI and json-render do. That is valuable for hosts whose model output is
structured data at runtime, which is a different problem from code generation, and the current
catalog deliberately stays narrow and action-shaped. It is left as a separate decision after the
JSX path proves the contract.

**A separate agent entry point or package.** `meowtail/agent`, or a new package with "blocks",
would add a second import path, a second place to look, and a module-identity risk for no gain. The
new components join the existing root export.

**A broad agent kit.** Building coarse components for every task at once has no evidence behind it
and would likely produce components nobody uses. The cost model and the mechanical-wiring rule
above are how the next candidate gets chosen; forms are simply the first, highest-frequency case.

## Staged plan

1. **Spike and challenge.** Implement the smallest `Form`/`FormField` in a scratch story and
   compare two state models: the values store described here, and native `FormData` collection.
   Cover native submit and validation, controlled and uncontrolled values, hidden omission, live
   errors, generated ids, a typed kind union (or a flat interface if the union makes the component
   contract hard to read), the two escape props, and multiple forms on one page. Ask the challenger
   to test the revised boundary before production code.
2. **Core slice.** Components, theme fragment, registration, exports, unit tests, type cases and
   the story scenes: settings form, form in a dialog, controlled values loaded after mount, error
   and pending states, a reset button, disabled fields, narrow and dark presentations.
3. **Field live messages.** The enabling change above, with `field.test.tsx` and a scene, or the
   documented fallback if the spike finds it is not worth the contract change.
4. **Agent-facing docs.** Two stories, not one: the canonical `Form` composition and a `FormField`
   gallery that shows the field kinds. One story maps to one component page, so without the second
   story the twelve kinds and the escape props stay invisible. The package README gets a short
   "start with a complete composition" section; the primitive-first form stories are labelled as
   the custom-composition path rather than removed. The component page shows story source, style
   axes and DOM parts rather than prop tables, so the stories have to be written to be read as the
   usage examples. No new documentation generator.
5. **Measurement.** Write the same five small scenarios with the old primitives and with the new
   family: a settings form, a create dialog, a login form, a form loaded from a signal, and a form
   with one custom control. Record imported names, source lines, manual wiring points and decisions
   per scenario. Two reference points are already known: the current three-field settings form
   needs five names and the target is two; a custom-control field is expected to stay four names
   plus the host merge, and that is accepted, not hidden. These numbers are the acceptance evidence
   for "lower usage cost"; they are recorded, not turned into a CI score.
6. **Follow-up decision.** Radio/checkbox groups; whether a `fields` shorthand or JSON entry has
   evidence; the next candidate from the same rule.

The implementation shape follows the existing ownership rules and adds no new mechanism:

- `src/components/form.tsx` holds the form context, `Form` and `FormField`; the fields delegate
  labels and descriptions to `Field` and render the existing input components.
- `src/theme/components/form.styles.ts` paints the form root, the field stack and the action row
  from `uiTokens`; field and control appearance stay in their current theme files.
- The contracts join `meowUIComponents` and the display-name map in `src/registry/index.ts`, the
  exports join `src/components/index.ts`, and the fragment joins `standardThemeStyles` in
  `src/theme/index.ts`. The docs pages then appear from the story manifest with no generator
  change.
- Tests live in `tests/unit/components/form.test.tsx` and, for the Field change,
  `tests/unit/components/field.test.tsx`; the type cases live in
  `tests/types/components.types.tsx`; the scenes live in a new `stories/form.stories.tsx`.

The family is additive. `Field` gains optional live forms of props it already has, and its static
usage keeps today's behavior; no export is removed or renamed. Choosing a version and publishing it
stay separate, explicitly authorized steps; this proposal changes no package version and no lock
file.

## Verification

- **Contract tests.** Values are converted per kind; uncontrolled defaults and controlled signals
  both submit correctly; unknown controlled keys pass through; hidden and disabled fields are
  omitted from `onSubmit` while `readOnly` is kept; `onValuesChange` reports the live record;
  disabled fields and form-level disabled produce no submission; duplicate ids do not appear across
  two forms; a changed values signal updates the visible control without remounting; a reset
  restores the defaults in the store; a duplicate `name` is reported in development.
- **Control-specific behavior.** A number field reports its value only on blur, Enter or step, not
  per keystroke; `min`/`max` are clamping rather than browser validation; `Input` and `Textarea`
  write back on input; `Select` change writes back; `Switch` and `Checkbox` reassert a controlled
  value after the handler; a hidden `required` field does not block validation.
- **Type cases.** Invalid kind/prop combinations fail where the kind union can express them; a
  consumer cannot assign `values.name` to `string` without narrowing; `MaybeSignal` props accept
  signals; `onSubmit` receives `FormValues`; a custom control is not collected.
- **Native and accessibility behavior.** Enter submits from a text field; an invalid required
  field blocks submission and focuses itself; error text appears and disappears with the errors
  signal; a live error keeps a host `aria-describedby` alongside the derived ids; label/control
  association, `aria-describedby` and `aria-invalid` hold; a switch field has one label and one
  focus target; Tab order is the document order; the form has an accessible name when one is
  supplied; `FormField` outside `Form` fails; a nested `Form` fails.
- **Real scenes.** The canonical settings form, a dialog form, a form with loaded values, an error
  state, a pending state and a reset action at 1440, 390 and dark; a second Enter during a pending
  submit does not double-submit; the browser pass looks at hierarchy, focus, error and narrow
  behavior rather than pixel gates.
- **Package surface.** The contracts are registered, the standard theme includes the new fragment,
  both docs pages are generated from their stories, and the built package contains the new
  exports. How the form appears in a real host is still the host's acceptance, not the library's.
- **Independent challenge.** A reviewer who did not write this document checks the revised
  boundary with real counterexamples: the smallest alternative, the FormData variant, the async
  and dependent-field cases, nested forms, the hidden/disabled rules, the reset rule and the Field
  change.

## The review

An independent challenger read the first version of this document against the actual components
and found contract-level problems rather than wording ones. They are addressed above; this is the
record of what changed.

- The claim that "native validation is the default" was too broad: `NumberInput` is a text-like
  control with JavaScript clamping, and `onValuesChange` cannot fire per keystroke for it. The
  document now separates native constraints from number clamping and states the commit point.
- "Values typed per kind" was stated as if the caller got key-level types. It does not: the
  submitted record is `FormValues`. The promise is now runtime conversion plus documented
  narrowing, not a generic.
- The reset, hidden/disabled submission and controlled-reconcile rules were unspecified and, in
  the first draft, mutually inconsistent. The document now defines the live record versus the
  submitted record, intercepts reset, and asks the spike to compare a synchronous reconcile with
  doing nothing.
- The draft had no escape for real in-field content and control attributes, so the "complete
  field" claim would have forced those scenes back to `Field` + control. `children` and
  `controlProps` were added, with the growth cost stated.
- The baseline count and the "only one native submit path" claim were wrong because the sample
  omitted other story files. The numbers were restated from the files actually counted.
- The state model itself was challenged: native `FormData` collection may be the smaller first
  slice. It is now a serious alternative that the spike must compare, not a footnote.
- The docs plan created only a `Form` page and left the `FormField` interface invisible; it now
  requires a second story and labels the primitive-first stories as the custom path.
- The naming question was sharpened: this component is a childless complete field, which is not
  exactly Ant Design's `Form.Item` (it wraps a control child) or shadcn's `FormField` (it is a
  controller wrapper); the recommendation is recorded with the prior it rejects.

The remaining risk is concentrated in one place: whether the values-store design earns its extra
rules compared with native `FormData`. That is the first thing the spike decides, and the answer
determines the shape of the controlled path.

## Open questions

- **`FormField` or `FormItem`?** `FormField` names one complete field and continues the existing
  `Field` vocabulary; `FormItem` is the closer Ant Design prior for a complete field, while in
  shadcn it is the layout part inside `FormField`. This component is childless and type-driven, so
  neither ecosystem name is exact. The recommendation is `FormField`, documented as a deliberate
  divergence; if Ant Design familiarity matters more, `FormItem` is acceptable and the API does not
  change.
- **`bind` instead of `values`?** The follow-up [value bindings](2026-10-20-value-bindings.md)
  proposes one writable-record `bind` prop that would replace `values` + `onValuesChange` in this
  family. It is a separate ownership decision and is not settled here.
- **Which state model?** The store (this document) versus native `FormData` collection. The store
  buys controlled values, dependent fields and typed live values at the cost of the reset, hidden
  and disabled rules; `FormData` buys a much smaller first slice at the cost of string parsing and
  a separate controlled path. The spike decides with the five scenarios.
- **How much of the controlled path belongs in v1?** If the store wins, the controlled signal is
  the same mechanism as uncontrolled and should stay; if `FormData` wins, controlled values may
  move to a second slice.
- **Are `errors` and the Field change in the first slice?** `errors` is the reason the Field change
  exists. If server messages are out of scope, both can be deferred together.
- **Does the library need a runtime/JSON form path?** This depends on whether hosts will feed
  model output into the UI at runtime or only use generated source. The answer changes the
  roadmap, not the Form contract.
- **Should the agent index grow prop metadata?** Today `llm.txt` lists routes, and component pages
  show story source plus style axes and DOM parts; neither can answer "which props does `Form`
  take" without reading the source. A prop-level machine-readable manifest is a separate mechanism
  (the registry has no prop data today) and should be judged on its own; the canonical story is the
  first, cheapest answer.
- **Which composition is next?** Candidates should be ranked with the mechanical-wiring rule:
  `Dialog` assembly is the closest sibling but native `<dialog>` supplies much of it; `Card` is
  deliberately not a candidate because its parts are expressive.

## Recommendation

Approve the direction and run step 1 as a bounded spike with the independent challenger, comparing
the store and native-`FormData` state models and settling the two escape props, the reset rule and
the naming before production code. Do not change package versions, publish, or touch the JSON
catalog as part of this proposal. The measurable claim to verify is that the five scenarios need
fewer names, fewer lines and fewer unverified wiring points while the existing primitives keep
working unchanged.
