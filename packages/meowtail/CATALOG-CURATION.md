# Catalog curation

Phase 4 keeps components with distinct jobs and retires the redundant add-action wrapper.
These choices guide new uses; they do not remove existing exports or change behavior.

## Status markers: keep with distinct jobs

Use `StatusDot` for a work or connection status, with a halo when it leads a surface. Its
current states are `processing`, `success`, `returned`, `warning`, `danger`, `unknown`, and
`idle`. Map concepts such as ready or active to the state that matches the host's facts.

Use `StateDot` for execution-step progress: `done`, `warning`, `ongoing`, `error`, or `idle`.
`ongoing` shows a spinner; `appearance="step"` gives `done` a checkmark. Both markers are
decorative and need adjacent accessible status text.

## List entries: keep with distinct jobs

Use `Item` for a selectable or navigable item in a `NavList`, menu, or other list. Use
`ListRow` for a key/value or expandable detail row inside `ListGroup` (or alone as a summary).
Use `ResourceLink` for an actionable reference to an openable file, record, or artifact.

## Labels and filters: keep with distinct jobs

Use `Badge` for a non-interactive status or count indicator. Use `Tag` for a categorical or
metadata label. A removable tag needs a separate host-provided removal action; `Tag` does not
currently expose an `onRemove` prop.

Use `Pill` for an interactive toggle or filter chip. Pass `onClick` for a button and control
its selection with `active`; the component exposes `data-state="active"` or `"inactive"`.
Without an action it renders a non-interactive span.

## Add action: retire (deprecated)

`AddButton` is a thin convenience wrapper and remains exported for existing callers. New
callers should compose the action directly:

```tsx
<Button>
  <Icon name="plus" />
  Add
</Button>
```
