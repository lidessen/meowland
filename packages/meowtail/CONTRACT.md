# Meowtail component contract v1

This is the target for Meowtail's exported components and registered component parts. Phase 0
records the current gap; it does not change behavior or assert that existing components already
conform. Migrate a family in its own change, including its API, states, stories and theme rules.
See [the status matrix](CONTRACT-STATUS.md) for the present, limited source audit.

## Values and ownership

Use `value`, `defaultValue` and `onValueChange` for a main value, and `open`, `defaultOpen` and
`onOpenChange` for visibility. The same pattern applies to `checked`, `pressed`, `selected` and
`expanded`: each has its corresponding `default*` and `on*Change`. A passed value prop is
controlled for the mount; when omitted, the component owns a local Signal. A change callback
requests or reports a change; it does not transfer ownership during the mount.

## Liveness and structure

Props a host may change, including `disabled`, `readOnly`, `open`, `value` and `labels`, accept
`MaybeSignal` of their value type. The other controlled state props follow the same rule. Components
must actually observe signal changes, not merely accept the type. Structural inputs such as `items`,
`triggers` and `columns` are documented as fixed for the mount, or accept a Signal and render
changing collections with `keyed`. Document the liveness of every prop.

## DOM state

Place state on its carrier part using `data-state` with appropriate values: `open` / `closed`,
`checked` / `unchecked` / `indeterminate`, or `active` / `inactive`. Use `data-disabled`,
`data-highlighted`, `data-selected`, `data-orientation` and `data-side` for their respective
states. Use `data-selected` for selection, and keep style options under `data-option-*`. Remove
legacy names such as `data-active`, `data-expanded` and `data-open` when migrating a family.

## Elements, copy and accessibility

Actionable components render a link when `href` is supplied and a button otherwise. Containers
accept `as` from a fixed, documented list; other components do not independently add `href`.
User-visible copy comes from one `labels` object per component with English defaults, ready for
`meowjsx/i18n`. Generate IDs only when an ARIA reference needs them, and ensure accessible names
do not depend on visible-only content. Apply the appropriate ARIA pattern and keyboard behavior.

## Styling boundary

Theme rules remain zero-specificity. Parts are identified by `[data-meowui-part]`; host styles
must not reach library parts through element selectors. Host CSS and its audit are separate Phase 0
work. Component migrations preserve the shared theme and part identity.

## Definition of done

A component is **Stable** only when all of the following hold:

1. Its API meets this contract, with every prop's liveness documented.
2. It uses shared behaviors for interaction and passes an ARIA pattern check where applicable.
3. Its stories cover applicable default, disabled, invalid, loading, empty, long-content and RTL
   states, rendered by the story matrix in every theme, light and dark, wide and phone.
4. Its documentation follows this order: Overview, Anatomy (parts), Usage, Examples, Keyboard,
   Accessibility, Theming (options and tokens), API, Agent notes.
5. It has a machine manifest entry generated from source, never maintained by hand.

A component missing any Stable item is **Beta**; a new or unproven component is **Experimental**.
The intended docs page and catalog show status, and the docs home shows counts. A status is not
proof of installation or release acceptance. Phase 0A records the initial matrix without changing
the docs site or the components.
