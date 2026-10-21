# Value bindings: owned state and one signal at the boundary

Status: design proposal and follow-up to the [agent-era usage design](2026-10-20-agent-era-component-usage.md).
Nothing here is implemented. It changes a documented ownership convention, so it needs an independent
challenge before any component contract changes.

## The request

The user wants a Python-like declarative style: a component that takes a value should not force the
caller to declare a Signal and pass it in; the value should be reachable when needed. The sketch is a
per-component ref: render `<Input label="Email" />`, later read the value through the ref. The user
also wants the same treatment wherever the library currently asks for `value` plus `onValueChange`.

This document separates the two things that request mixes: **ownership** (who holds the value) and
**access** (how the caller reaches it). The proposal is one uniform `bind` protocol instead of a ref
on every component.

## What the repository establishes today

- A component body is setup that runs once per mount; there is no re-render. A later change reaches
  the DOM only through a bound Signal (packages/meowtail/AGENTS.md, "Component model").
- `WritableSignal` already exists and is public. `signal`, `derived`, `mapSignal`, `unwrap` and
  `keyed` are the reactive vocabulary (packages/meowjsx/src/reactive.ts).
- Value components follow one convention: a `MaybeSignal` `value` is the controlled read source, a
  `defaultValue` seeds local state, and an `onValueChange` callback reports user changes. The
  component never writes a passed signal (packages/meowtail/AGENTS.md; `Tabs`, `ChoiceGroup`,
  `NumberInput`, and the Assistant draft in packages/meowtail/ASSISTANT.md).
- About ten components carry a `value` + `onValueChange` pair: `Tabs`, `ChoiceGroup`, `ChoiceSelect`,
  `SegmentedControl`, `NumberInput`, `Slider`, `Accordion`, `PathPicker`, `Select` (native change),
  and the checkbox/switch `checked` family. `Table` has the same shape for selection.
- `ref` on a host element is a DOM callback ref: the web strategy calls it with the element
  (packages/meowjsx/web/strategy.ts:48). Components that spread props to a native control
  (`Input`, `Textarea`, `Select`) forward it, so `ref` on those components already means the DOM
  node. Static HTML rendering drops `ref` entirely (packages/meowjsx/web/html.ts:33).
- The Form proposal already owns a values store internally; a host can submit without declaring any
  Signal, and `values` + `onValuesChange` is the controlled variant.

## The Python analogy has a limit

In Streamlit, `name = st.text_input("Name")` works because the script runs again on every
interaction: the widget call returns the current value. Python GUI variables work because the
program is imperative and reads the variable when it needs it.

MeowJSX deliberately does not re-run the component. So "read the value when needed" splits into two
different needs:

- **Event-time reads.** A submit handler, a toolbar action, a log call: a plain handle or ref is
  enough.
- **Render-time dependencies.** A live preview, a dependent field, a character count that updates
  as the user types: the read has to be reactive, so it must be a Signal bound into the DOM.

A ref gives the first and not the second. That is why a ref-only design cannot deliver the
declarative feel it promises; the value has to be a writable Signal at the boundary, and the
component has to be allowed to write it.

## Design space

| Option                        | Shape                                                                          | Feasibility                                                                      | Cost and verdict                                                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-component value ref       | `const email = valueRef<string>(); <Input ref={email} />`; `email.value` later | Yes: setup can call a callback with a handle; cleanup clears it                  | `ref` already means the DOM node on input-like components; every component would need its own handle type and lifecycle; a plain handle is not reactive; static render has no refs. Rejected |
| Bind prop                     | `const email = signal(""); <Input bind={email} />`                             | Yes: the component reads and writes an existing `WritableSignal`; no core change | One uniform prop, one declaration only where the caller needs the value; two-way writes change the "component never writes host signal" rule. Recommended, with a challenge                  |
| Form-level model              | `const values = signal<FormValues>({}); <Form bind={values}>…</Form>`          | Yes: the form binds each field to the record by name                             | Zero per-field declarations; one declaration for live access; submit-only usage needs none. Recommended                                                                                      |
| Implicit registry / auto-refs | children register their values in an ancestor; host queries later              | Technically possible with Context                                                | Magic naming, lifecycle and duplicate-name problems; not discoverable from props; agents cannot predict it. Rejected                                                                         |
| Return-value API              | `const email = textInput({ label: "Email" })` returning `{ element, value }`   | Possible outside JSX                                                             | A second UI paradigm, breaks JSX composition and the story/docs model. Rejected                                                                                                              |
| Type-directed two-way         | pass a `WritableSignal` to `value` and let the component write it              | Possible                                                                         | Silent semantic change for existing callers; a host that passes a writable signal today expects control. Rejected for the existing prop                                                      |

## The recommended protocol: `bind`

A value-bearing component accepts one optional prop:

```ts
bind?: WritableSignal<T>;
```

Mode precedence is explicit: `bind` > `value` > `defaultValue` > internal state.

- **No bind, no value** — the component owns its state, as today. This is the default and needs no
  declaration.
- **`value` (readable Signal or plain value)** — one-way control, host owns it, component never
  writes, as today. This stays for cases where the host must vet or derive the value.
- **`bind` (WritableSignal)** — two-way. The component reads the signal for display and writes it on
  user change. An optional `onValueChange` still reports the change, but the signal is the value.

The caller declares one variable only when it needs to reach the value:

```tsx
const email = signal("");

<Input bind={email} label="Email" placeholder="you@example.com" />;
// later, anywhere: email.value
```

Selection components use the same prop:

```tsx
const tab = signal("all");

<Tabs bind={tab} id="views" label="Views" items={views} />;
```

### The form case

The form is where the declaration disappears completely. Uncontrolled (no `bind`) already submits
without any Signal. When the page needs live values, one record signal serves every field:

```tsx
const values = signal<FormValues>({ email: "", visibility: "private" });

<Form bind={values} onSubmit={(submitted) => save(submitted)}>
  <FormField name="email" label="Email" type="email" required />
  <FormField name="visibility" label="Visibility" type="select" options={visibilityOptions} />
</Form>;
// values.value.email is live; submit still filters hidden and disabled fields
```

This replaces the first Form proposal's `values` + `onValuesChange` pair with one prop. The submit
handler and the hidden/disabled filtering rules stay as they are. `onValuesChange` survives only as
an optional notification for side effects such as autosave.

### Naming

`bind` is chosen because it describes the action (bind a writable value to a control) and is familiar
from Vue's `v-model` and Svelte's `bind:value`.

- `model` is already taken in this codebase: `AssistantView` uses `model` for the LLM model
  selection (`model`, `onModelChange`), so a generic value prop named `model` would collide in the
  most agent-heavy component.
- `ref` is taken by the DOM callback ref, and only exists in the mounted DOM (not in static HTML).
- `value` overloaded as two-way would silently change existing callers and break the
  "host has the final say" rule.

## Counterexamples and costs

- **The convention changes.** The repository currently says a component never writes a passed
  Signal. `bind` deliberately breaks that for one explicit mode. It needs an independent challenge
  and a documented rule, not a quiet widening of `value`.
- **A host cannot veto a change for free.** In `bind` mode the component writes first. If the host
  rejects the change, it has to write the signal back synchronously in the notification, and the
  component has to reconcile its DOM afterwards (the `ChoiceGroup` pattern exists for radios). The
  spike decides whether veto belongs in `bind` or stays exclusive to `value`.
- **Reset.** A native reset inside a bound form has to write the defaults back into the signal.
  Today the controls do not agree on reset behavior; `bind` gives the library one place to define
  it.
- **Async initial values.** `signal` is writable, so loaded values can be written after mount and
  the controls update; no mount gate and no controlled callback are needed.
- **Unmount.** The signal is host-owned and outlives the component. A component that unmounts stops
  writing it; nothing clears the value, which is usually what the host wants but must be documented.
- **Static HTML.** `bind` values render their current value; there are no events and no writes.
  This is fine, but a ref-based design would have no value at all in static output.
- **Reading during setup.** A ref or a form handle is only available after the child mounts, so it
  cannot be read in the parent's setup body. A `bind` signal exists before render, which is another
  reason to prefer it.
- **Agent surface.** One prop on each value component is learnable; a different handle type per
  component is not. The whole point of the agent-era simplification is that the same small protocol
  applies everywhere.

## Staging

1. **Pilot.** Add the `bind` mode to four controls (`Input`, `Select`, `NumberInput`, `Switch`) and
   to `Form`, behind one small shared helper that resolves `bind` / `value` / `defaultValue` and
   performs the write. Add a focused story and tests: user change writes the signal; an external
   signal write updates the control; precedence holds; reset writes defaults; a rejected change
   reconciles or is documented as unsupported.
2. **Measure.** Re-run the five authoring scenarios from the Form design, with and without `bind`,
   and record names, lines, wiring points and decisions. The claim to verify is "the common case has
   no callback plumbing".
3. **Challenge.** An independent reviewer tests the ownership change with real counterexamples:
   rejection, reset, two components bound to one signal, async values, static render, and the
   existing `value` callers.
4. **Widen or stop.** If the pilot holds, apply the same mode to the remaining value components and
   make `bind` the agent-facing default in docs while `value` stays the advanced path. If it does
   not, keep the uncontrolled form path and the read-time handle only.

No MeowJSX core change is needed: a Signal is already writable, and the renderer already binds
Signal props to host attributes and properties. The work is a meowtail component convention plus the
shared helper, and it is additive until a later documentation decision makes `bind` canonical.

## Open questions

- **Is `bind` the canonical controlled path, or does it coexist with `value` + `onValueChange`?**
  The proposal is coexistence with `bind` as the agent-facing default; removing the pair would be a
  separate breaking decision.
- **Does the Form family replace `values` + `onValuesChange` with `bind`?** Yes if this protocol is
  adopted; the submit and filtering rules do not change.
- **Is veto required?** A two-way binding that can reject changes is more expensive in every
  control. The spike compares "host writes back synchronously" with "no veto in bind mode".
- **Which components get `bind` first?** The four pilot controls are the ones the form scenes use;
  selection components follow if the pilot holds.
- **Does a per-component ref have any remaining use?** Only for imperative behavior that is not a
  value (focus, scroll, open/close). Those already exist as DOM refs or controlled props and should
  not be merged into the value protocol.

## Recommendation

Do not add a ref to every component. Add one `bind` prop with explicit two-way semantics, make the
Form own a record binding so standard forms need no per-field declarations, and run the four-control
pilot plus an independent challenge before widening it. The Python-like result is real at the
boundary: no callbacks in the common case, one Signal only where the page needs to read the value,
and no hidden per-component state to discover.
