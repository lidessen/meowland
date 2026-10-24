# Meowtail component development

`meowtail` is the npm identity; the existing MeowUI API, plugin name, and DOM/CSS markers remain the
implementation contract and are not mechanically replaced to match the package directory name.

Implement shared components in this package first, review real content and interactions in Meowbook,
then let applications adopt them. Applications own business state, components own reusable structure,
and the standard theme owns the visual implementation. Read the README and the closest existing
component first; do not start a separate scale.
When designing new components and compositions, first read this package's README and the
[original MeowUI design specification](https://github.com/lidessen/rossovia/blob/046b044e1bfde8c79b186fab2948ba2260371790/docs/architecture/ui/meowland-ui-design.md) (historical reference), and derive form and
styles from the task; this file adds implementation ownership and wiring conventions.

Read the two sections below before writing a component or its styles. The typechecked copy of both
canonical examples is [component-model.types.tsx](tests/types/component-model.types.tsx). Those
fixtures are not registered and are not product components.

## Component model: MeowJSX is not React

A component function body is setup. It runs once for that mount. Nothing runs it again: there is no
re-render and no hook order. A later change reaches the DOM only through a Signal that setup bound
to a prop, an attribute, a text node, or a child.

`context.signal`, `context.effect`, and `context.onCleanup` belong to that mount. They come from the
same `meowjsx` entry as `Context`, `isSignal`, `mapSignal`, `derived`, `unwrap`, `keyed`,
and `useContext`. There is no `useState`, `useEffect`, `useMemo`, `useCallback`, or `useRef`. Do not add
a helper with that shape.

| Do                                                                                                                                                                                                                          | Don't                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Type a prop the host may change as `MaybeSignal<T>` and pass that Signal through to the attribute or child.                                                                                                                 | Call `unwrap(prop)` in the setup body and treat the result as live. Setup reads it once.                                                               |
| Pick the owner when setup runs: `const current = pressed !== undefined ? pressed : local`. A passed `false`, `0`, or `""` is the controlled value. Omitting the prop uses the local signal. The choice stays for the mount. | Copy a prop into local state with an effect: `effect(() => { local.value = unwrap(value) })`.                                                          |
| Derive with `mapSignal(source, fn)` for one source, or `derived(read)` when the value is computed from the signals `read` touches. Bind that signal.                                                                        | Store a derived value by writing another signal from `context.effect`, or keep a per-file helper that does that.                                       |
| Bind Signals to attributes and text. Use `keyed(items, key, render)` for lists and the `hidden` attribute to show or hide a mounted child.                                                                                  | Return `h(Component, …)` from a Signal to refresh a subtree. The renderer replaces that child wholesale, so focus, drafts, and child state go with it. |
| Use `context.effect` for an outside-world side effect (a DOM API that has no prop, a timer, an observer) and release it with `onCleanup` or the function returned from `ref`.                                               | Use an effect to move data into state, or `queueMicrotask` plus `querySelector` to patch a child the parent can bind through a prop.                   |
| In an event handler, read the live value with `unwrap(current)` or `signal.value`.                                                                                                                                          | Close over a setup-time snapshot and reuse that snapshot in the handler.                                                                               |
| Call `useContext` during setup. Pass a Signal as the Provider value when descendants need a changing value.                                                                                                                 | Expect a new plain Provider value to run descendant setup again.                                                                                       |
| Treat a static prop (`items`, `options`) as fixed for the mount and say so in the JSDoc. Make it `MaybeSignal` and render it with `keyed()` when the host must change it.                                                   | Leave later changes to a static prop ignored and unmentioned in the prop docs.                                                                         |

### Canonical component

`Switch` remains the product control for a boolean field. This toggle shows the setup rules only.

```tsx
import {
  h,
  isSignal,
  mapSignal,
  unwrap,
  type Context,
  type MaybeSignal,
  type Props,
} from "meowjsx";

export interface ToggleProps extends Props {
  /** Controlled when provided; a Signal keeps it live. */
  pressed?: MaybeSignal<boolean>;
  defaultPressed?: boolean;
  disabled?: MaybeSignal<boolean>;
  onPressedChange?: (pressed: boolean) => void;
}

/** Setup runs once; only the bound Signals below change after mount. */
export function Toggle(
  {
    pressed,
    defaultPressed = false,
    disabled = false,
    onPressedChange,
    children,
    ref,
    ...props
  }: ToggleProps,
  context: Context<typeof Toggle>,
) {
  const local = context.signal(defaultPressed);
  // Presence decides the owner. false is a controlled value.
  const current = pressed !== undefined ? pressed : local;
  const ariaPressed = isSignal(current)
    ? mapSignal(current, (value) => String(value))
    : String(current);
  return (
    <button
      {...props}
      ref={[context.parts.root, ref]}
      type="button"
      aria-pressed={ariaPressed}
      disabled={disabled}
      onClick={() => {
        const next = !unwrap(current);
        if (pressed === undefined) local.value = next;
        onPressedChange?.(next);
      }}
    >
      {children}
    </button>
  );
}
Toggle.meta = { name: "toggle", parts: ["root"] } as const;
```

Before handoff, check three things. Does a setup-time `unwrap`, or a branch on a prop, have to stay
live? Does a `context.effect` only write another signal? Does a Signal's value return a VNode?

## Styling: MeowCSS is not ordinary CSS

The component names parts and style options in its static `meta`. The standard theme paints them.
A component function does not carry the visual rules. A host `className` can compose built-in `ui`
values or application classes, while the component's default look remains in the theme.

Put the rules in `src/theme/<area>/<responsibility>.styles.ts`, one family in one file, using the
`css` template from `meowcss/meowjsx`. Type-import the component and construct `parts<typeof Button>("button")`;
its members emit `:where([data-meowui-part="<name>/<part>"])`. Declare axes with `defineOptions` in an
implementation-free `*.options.ts` module, shared by the component and its theme. Attach
`style: defineStyleProps(...)` to `meta`. Option attributes are written on the carrier parts named
in that binding (`root` when omitted), so `options.when({ tone: "accent" })` belongs on one of those
parts. Hover rules can interpolate `options.attribute` when the selector names the variant.

`createMeowUI({ components })` registers component functions and the style-props adapter. The
explicit `meowUIComponents` catalog covers the full library; a selective host supplies its own list.
A new library family goes in that catalog, and its fragment goes in `standardThemeStyles`.
Components do not hand-write generated marker or option attributes. Importing a styles module does
not insert CSS; the host mounts `standardTheme.cssText`.

### Design system

Every value a theme file paints with is a role in one tree, `uiTokens` in `src/theme/tokens.ts`
(CSS names `--ui-<group>-<key>`). A theme file never writes a literal color, type size, radius,
shadow or duration; a length that belongs to one part's geometry stays beside that part's selector.
Colors are literal `[light, dark]` pairs and never reference another token, so a nested scheme
region resolves its own value. Chat-only measures live in `chatTokens`; option-driven values
(`alertTokens`), syntax colors (`codeHighlightTokens`) and the categorical chart series
(`chartTokens.series1` … `series8`, taken in fixed order, never cycled) are the only other sets. There are no
aliases: one role, one name.

| Group     | Keys                                                                         | Rule                                                                       |
| --------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `surface` | canvas, reading, raised, overlay, fill, field · tint, knockout, scrim        | the surface ladder below; the last three are not rungs                     |
| `inverse` | surface, ink, action                                                         | Tooltip and Toast, dark in both schemes                                    |
| `line`    | width, edge, divider, control, controlHover                                  | three jobs, all 1px                                                        |
| `ink`     | primary, secondary, tertiary, chip                                           | content, supporting copy and placeholders, captions, text on a chip        |
| `state`   | hover, active, focus, focusRing                                              | translucent overlays that work on any rung                                 |
| `action`  | primary, primaryHover, onPrimary, soft, danger, onDanger                     | filled actions; each "on" color sits with its fill                         |
| `control` | small, regular, large, inset, fieldInset, trackInset, thumb, knob            | the 28 / 36 / 44 ladder every single-line control shares                   |
| `accent`  | base, soft, selected, ink, line, halo                                        | what is happening now and where the reader is                              |
| `status`  | info, success, warning, danger, unknown                                      | one text-safe color per status, also used for markers; halos derive by mix |
| `type`    | sans, display, mono, micro … pageTitle, leading, trackingTight, trackingCaps | the ramp 11 / 12 / 12 / 13 / 14 / 16 / 20 / 24; two tracking roles         |
| `space`   | group, section, panel, prose, insetBlock, insetInline, page insets           | spacing by relationship; compact rows pad 12 / 16                          |
| `icon`    | small, size, large, stroke                                                   | 14 / 16 / 18; no other glyph size                                          |
| `radius`  | xs, sm, md, lg, xl, xxl, full                                                | by element size: marks, tags, small elements, controls, surfaces, dialogs  |
| `shadow`  | raised, field, action, filled, thumb, pressed, knob, sheet, float            | one shadow per role                                                        |
| `motion`  | instant, response, settle, draw, loop, sweep, ease, enter                    | press, hover, open, draw-in, spinner turn, shimmer pass, surface arrival   |
| `layout`  | grid columns, containers, measure                                            |                                                                            |
| `glyph`   | chevron, check, arrow, cross, selectChevron                                  | mask glyphs colored by ink                                                 |

Field surfaces (Input, Textarea, Select, ChoiceSelect, SearchInput, NumberInput) take their box and
their hover, focus, read-only, invalid and disabled states from
`src/theme/shared/field-surface.styles.ts`; a field family's own file adds layout only.

#### Surface ladder

Every background is one rung. Each rung has exactly one edge rule, and a layer differs from what it
sits on by one cue: a fill step or an edge. A new component picks a rung; it never mixes a grey.

| Rung      | Light / dark      | Edge                                                 | Used by                                                       |
| --------- | ----------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| `canvas`  | #fafafa / #121212 | regions split by `line.edge`, no new fill            | page ground, sidebars, headers, AppBar                        |
| `reading` | #fff / #121212    | none                                                 | the full-bleed chat transcript                                |
| `raised`  | #fff / #1a1a1a    | `line.edge`; `shadow.raised` (none in light)         | Card, ListGroup, Table, TaskList, ChatQuestion                |
| `overlay` | #fff / #202020    | `shadow.float` (ring + drop)                         | Dialog, Modal, Popover, Menu, HoverCard, Toast                |
| `fill`    | #f2f2f2 / #242424 | none (the composer is the exception: it is operated) | code, chips, tracks, avatars, bubbles, ProcessGroup, composer |
| `field`   | #fff / #161616    | `line.control`, `line.controlHover` on hover         | Input, Select, ChoiceSelect, SearchInput                      |

Dark lightness steps up with elevation (canvas < raised < overlay); a field is recessed, so in dark
it is darker than raised. Do not "fix" that. `surface.knockout` is the color behind a halo, mix or
cutout (it defaults to raised; a host overrides it per surface), `surface.tint` a translucent mark
that works on any rung, and `surface.scrim` the page dimmer under a modal.

Lines have three jobs: `line.edge` outlines a raised or overlay surface and splits regions on the
canvas; `line.divider` separates rows inside one surface; `line.control` bounds what the reader
operates (fields, outline actions, checkboxes), `line.controlHover` under the pointer.

Fields, actions, tracks and thumbs are rounded rectangles (`radius.lg`, `radius.md` at the small
size); tracks and thumbs are concentric (track radius is the thumb radius plus
`control.trackInset`); surfaces use `radius.xl`, and items inside a floating panel use `radius.md`
(the panel radius minus its 6px inset). Do not introduce pills for actions or fields.

Depth is a material, not decoration. Each role takes one shadow and nothing else: `shadow.raised`
for in-flow surfaces (flat in light, where the edge carries the card; a faint top-edge highlight in
dark), `shadow.field` for fields at rest, `shadow.action` for outline actions, `shadow.filled` for
primary and danger fills, `shadow.thumb` for selected thumbs and `shadow.float` for anything
floating. Disabled controls drop their shadow. Pressed actions settle by half a pixel. Every grey is
a true neutral. Edges are 1px, never half-pixel lines, which blur on ordinary screens. A quieter
state of the same thing (a finished step, a waiting step) fades its ink with `color-mix` instead of
switching to another grey. Activity is a band of full ink sweeping across muted text (TextShimmer),
not a color. Button labels are 500 weight; titles at `type.title` and above use -0.01em tracking.

Group labels share one small-caps role: `type.micro`, weight 500, 0.04em tracking, uppercase,
`ink.tertiary` (the `eyebrow` Text role). Menu headings, ChoiceSelect groups, NavList group titles,
and the docs, gallery and story sidebars use it; do not invent another label style. The docs app
and the Meowbook gallery use the same tokens and roles as the library.

#### Component rules

- Titles: 600 for a container's name (page, card, dialog, alert, task card); 500 for a row's or
  item's name and for field labels. A label that names a group of rows is the eyebrow role, not a
  smaller title.
- Disclosure: inline flow (reasoning, process, sources) leads with a chevron-right that turns 90°; a
  card collapsing its own body trails a chevron-down that turns 180°. Header heights follow the
  control ladder: 24px inside a chat row, `control.regular` in a compact box, `control.large` for a
  card-level header.
- State: hover is `state.hover` and pressed or expanded is `state.active`, both translucent. On a
  raised surface the overlay is painted as `background-image: linear-gradient(...)` so the rung
  stays underneath. Pressed actions take `shadow.pressed`.
- Compact rows inside a card (resource, link, work and task rows) pad `space.insetBlock`
  `space.insetInline`; reading sections use the relationship steps.
- State: a dot is the state mark everywhere. On a title line the dot sits in the one state badge
  (`src/theme/shared/state-badge.styles.ts`: `Status`, `ChatStatus`, tool rows, task headers,
  message status, the terminal's unclean exit, a ProcessGroup header): the dot and the
  state's word on a soft tint of the state's ink, right after the title or target, and the only
  color in its row. Under a title the dot leads the host's fact line (WorkCard, the Assistant
  activity). A longer account of a state is that fact line, never a longer badge or colored prose.
  A badge carrier writes `data-tone` with the StatusDot state it shows. `Badge` stays a label
  without a dot; it names a category, not a state, so stories never put a state word in a `Badge`.
  Timeline keeps its rail dot for color and its state word as a tertiary caption. A sequence is
  summarized as a count or a duration, never a row of one dot per step.
- Icons: one intent, one icon, from the map in [Which icon where](src/icons/README.md#which-icon-where);
  every semantic icon has a row there and a test keeps the two in step. A leading icon names the type
  and stays neutral, a trailing icon names what a click does, and an unknown tool type takes `box`.
- Tool rows: the leading glyph names the tool's type in the tertiary ink in every state; the verb
  is 500 in the secondary ink and keeps its words; the target follows in the tertiary ink and
  truncates first; the state badge follows the target, and `statusLabel` is the fact line inside
  the header so a collapsed row keeps it.
- Status tint: Alert is the one surface that takes a status-tinted fill with a status-tinted edge.
  Other status carriers color only their marker and ink.
- Focus: a 2px `state.focus` outline at 2px offset; inside a clipped scroller use -2px. Fields use
  the field-surface ring instead.
- Every ad hoc gap and padding sits on the 4px grid; tracking comes from the two tracking roles.

Theme files take shared class values from `src/theme/utilities.ts`: `ui.surface.raised`,
`ui.text.body`, finite `ui.interactive` values and `ui.focus.ring`/`inset`. The same values work in
`className` and expand to declarations in `css`; public `cx` from `meowcss` composes them. Preserve
their nested state and reduced-motion rules. `standardAuditRules` keeps the standard theme free of
literal colors, durations, font sizes and radii (`tests/unit/theme/authoring.test.tsx`). The
foundation fragment is first and the shared `utilityStyles` fragment is last and once in standard,
extended and presentation assembly. Host-facing guidance lives in [AUTHORING.md](AUTHORING.md).

Do not use `light-dark()`: it follows CSS `color-scheme`, not the theme's own scheme boundary.

Arrange siblings with `Stack`, `Inline`, or `Grid` and a `gap` of `none`, `compact`,
`normal`, or `relaxed` (0, group, section, panel). Judgment for departing from that scale is in
[Default scale and composition](#default-scale-and-composition).

| Do                                                                                                                                                                                                          | Don't                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Style each part through `parts<typeof Component>(name)`, in the theme file for that family.                                                                                                                 | Add a `.css` file, a CSS module, styled-components, Emotion, or Tailwind utilities.                                                                                                 |
| Put variant axes in shared options and `meta.style` (`defineOptions`, `defineStyleProps`); branch with `options.when` or `options.attribute`.                                                               | Hand-write `data-meowui-part` or `data-option-*`, or select a raw prop name such as `[variant="accent"]`. The style plugin removes the option prop and writes the option attribute. |
| Take every color, type size, radius, shadow, duration and spacing step from a `uiTokens` role. A length that belongs to one part stays next to that part's selector in the theme file.                      | Hardcode a hex color or a second spacing ramp in the component.                                                                                                                     |
| Forward a host `className` on the root part. The component looks finished without it.                                                                                                                       | Build the look from a variant class string, or from story-only CSS.                                                                                                                 |
| Compose siblings with `Stack`, `Inline`, or `Grid`. Those primitives set structural layout (`display`, flex, or grid) through `layoutStyle`; their gap still comes from style props and `layout.styles.ts`. | Copy that inline `style` object onto a visual component for color, font, radius, or padding.                                                                                        |
| Send an instance measurement the stylesheet cannot know as a custom property: `tokenRef` on `style`, read back by the theme. `tabsCount` and `tabsIndex` are that channel.                                  | Use a `style` object as the theme.                                                                                                                                                  |

A parent stylesheet addresses that component's own parts. An anonymous node inside the part, such as
the `svg` in a button, may use a descendant selector from that part. Another component keeps its own
identity; do not reach into it with a descendant class or tag selector.

### Canonical styles

`Button` is the product instance of this wiring: [button.tsx](src/components/button.tsx) and
[button.styles.ts](src/theme/components/button.styles.ts). The fixture below is the same shape, split
the way those files are split. The typechecked copy merges them into one module and is not a product
component.

Component, next to the other components:

```tsx
// callout.options.ts: shared by the component and the theme.
import { defineOptions } from "meowcss";
export const calloutOptions = defineOptions("callout", { tone: ["neutral", "accent"] });

// callout.tsx
import { h, type Context, type Props } from "meowjsx";
import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { calloutOptions } from "./callout.options";

export interface CalloutProps extends Props, ThemedProps<typeof calloutOptions> {
  title: string;
}

/** Parts and options only. The look lives in calloutStyles. */
export function Callout(
  { title, children, ref, ...props }: CalloutProps,
  context: Context<typeof Callout>,
) {
  return (
    <aside {...props} ref={[context.parts.root, ref]}>
      <strong ref={context.parts.title}>{title}</strong>
      {children}
    </aside>
  );
}
Callout.meta = {
  name: "callout",
  parts: ["root", "title"],
  style: defineStyleProps(calloutOptions, { defaults: { tone: "neutral" } }),
} as const;
```

Theme file, `src/theme/components/callout.styles.ts`:

```tsx
import { css, parts } from "meowcss/meowjsx";
import type { Callout } from "../../components/callout";
import { calloutOptions } from "../../components/callout.options";
import { ui } from "../utilities";
import { uiTokens } from "../tokens";

const callout = parts<typeof Callout>("callout");
export const calloutStyles = css`
  ${callout.root} {
    display: grid;
    gap: ${uiTokens.space.group};
    padding: ${uiTokens.space.group};
    ${ui.text.body}
    background: ${uiTokens.surface.fill};
    border-radius: ${uiTokens.radius.lg};
  }
  ${callout.title} {
    font-weight: ${uiTokens.type.weight.medium};
  }
  ${callout.root} {
    ${calloutOptions.when({ tone: "accent" })} {
      color: ${uiTokens.action.primary};
      background: ${uiTokens.action.soft};
    }
  }
`;
```

The descriptor map exposes only parts declared in the component's `meta`. `defineStyleProps` only
accepts defaults that are real choices. Component metadata remains outside the fragment; the JSX
adapter binds conditional component tokens through their generated option attributes.

File names, registration, and `mountStyles` / `applyTheme` / `Theme` stay in
[Style implementation](#style-implementation).

## Default scale and composition

- The default design uses DeepSeek Harness as its baseline, with one control ladder: standard
  buttons and fields are 36px high, compact ones 28px, large ones 44px. The
  `basic-quality-controls` mixed row and its geometry test hold every single-line family to that
  ladder. Information blocks are tight inside; page edges, standalone blocks,
  and reading areas keep generous whitespace.
  group / section / panel are not the ceiling for page spacing; do not extend local compactness into
  whole-page compression.
- Start with the body, secondary text, control heights, and three-level spacing from `uiTokens` in
  `src/theme/tokens.ts`. Do not invent another set of rem font sizes and large padding in a new
  component and then splice it onto existing controls. Distinguish headings by semantics and font
  weight; not every question or field label uses the page-title font size. Specific sizes are decided
  by the theme; do not treat one set of numbers as universal aesthetics.
- Set type with one style of the ramp: `ui.text[role]`, or the `uiTokens.type` size with its
  `type.line.*` box and a `type.weight.*` role ([which text style where](README.md#which-text-style-where)).
  Body copy that other sizes nest inside keeps the unitless `type.leading`; a fixed line box uses
  `line.*`. `line-height: 1` and `0` stay for boxes around a glyph. The audit rejects literal
  sizes, line heights and weights, inside the `font` shorthand too.
- Choose spacing by relationship: group within a field, section between related areas, panel at the
  edge of a standalone container. Check how parent padding, child padding, gap, and paragraph margins
  actually add up; do not just judge whether each value is reasonable on its own.
- Width serves content. Short questions and a few options and actions do not fill the canvas by
  default; adjacent actions are not spread apart with `space-between` or `margin:auto` for no reason.
  Reading areas can be wide, but control groups should keep a recognizable grouping relationship.
- Compare examples of new components on the same screen with existing Button / Input / Field / Card,
  using the "Default scale · controls and composition" gallery and real application composition entry
  points as references. At minimum, actually look at desktop, narrow screens, and relevant themes, and
  operate options, keyboard, and feedback. Look at proportions first, then local pixels. Page layouts
  also adapt business needs starting from DeepSeek; old pages serve only to check function and behavior.
- Theme tokens cannot replace design judgment and do not require every component to be the same size.
  Deviate for real needs such as long text, touch interaction, or media, but explain and verify it in
  a real composition; do not handle it with global scaling, uniform shrinking, or a separate density
  switch on every component.

### Content layout

Composed screens read as one system when every region follows the same relationships. These are
relationships, not numbers; values come from `uiTokens`.

- **Text has a role.** Copy between components is `Text` (`body`, `secondary`, `caption`, or the
  small-caps `eyebrow` group label). Titles belong to `PageHeader`, `Page` and `Section`; field labels
  to `Field`; code to the code components. Long-form reading content (articles, notes, rendered
  markdown) goes in `Prose`, which shares one rhythm with chat messages through
  `src/theme/shared/prose.styles.ts`. Hosts and stories do not hand-style `p`, `h*` or `small`.
- **One header unit.** Eyebrow, then title, then description, then actions or content. The unit is
  tight inside (`spaceGroup`) and a section step from what follows. Receipts and status lines are
  `caption` directly under the thing they report on.
- **One start edge per region.** Labels, titles, controls and notes in a region share a start edge.
  Components do not center themselves; only a page column (`Container`, `Page`) or an `EmptyState`
  centers.
- **Arrange with layout, read with Prose.** Stack, Inline and Grid arrange controls and cards; Prose
  arranges reading content and caps it at the reading measure (`uiTokens.layout.measure`).
- **Label every group.** When a region shows more than one group of things (variants, states,
  settings), each group gets an eyebrow label; groups sit a panel step apart.
- **Actions sit in a row that fits or stacks whole.** A row of buttons is an `ActionRow` (or a
  container that already is one: `CardFooter`, `DialogActions`, `ChatQuestion` actions). It stays on
  one line while it fits; otherwise every text action becomes a full-width line and icon actions stay
  together, never a ragged wrap or an orphan. One primary action per row, last in DOM order, which is
  also the visual and focus order; group actions by intent rather than interleaving them. Header
  action clusters (`PageHeader`, `Section`, card and code headers) and `Toolbar` keep their compact
  rules. A variant matrix in a story is not an action row: lay it out in equal columns.

In stories, `stories/specimen.tsx` applies these rules: `Specimens` / `Specimen` label each group,
`Note` is the caption receipt, and `Measure` holds a host width on the canvas start edge. Component
stories never center on the canvas; page compositions keep their centered `Container` column.

## Basic quality checks

Shared component or theme changes pass through this set of relationships first; they are not aesthetic
scores and do not replace walking through real pages:

- In single-line controls, the text, icon, and action center is within ≤1px of the control center;
  center the text line in a single-line text field with symmetric block padding, without `transform`,
  negative margins, or a separate optical nudge. The fixed inline composer and the
  `composer-inline-layout` regression are the model.
- Single-line controls have symmetric top and bottom padding and borders; when an exception is truly
  needed, explain it in a real composition rather than patching it with page-level overrides.
- Page-level touch actions have a hit area of ≥44px under a coarse pointer; default control sizes do
  not grow automatically inside the library—the page composition or host provides them and verifies
  them in practice. Do not treat compact desktop values as mobile page sizes.
- For the five states—disabled, focus, dark, long text, and narrow screen—look at real compositions at
  minimum, not just isolated stories; state text must be readable, and color is not the only information.
- placeholder is text: use a readable secondary ink color, do not set a near-white tint, and do not
  duplicate a second placeholder color inside components.
- disabled must still be recognizable: measure actual contrast before changing disabled states in
  bulk; when using group opacity, record the variants that become too faint, and do not treat
  "invisible" as a disabled expression.
- Keep 375-wide originals under the same conditions before and after a change; protect geometric
  relationships with browser tests, not pixel baselines or aesthetic gates; review hierarchy, states,
  and composition by eye.
- New components or new theme rules belong in real composition scenes (for example
  `basic-quality-controls` and `composer-inline`); do not copy component implementations or fill in
  defaults with story-only CSS.

## Reuse boundaries

A component in a given position has exactly one implementation owner: shared structure, interaction,
and the complete Assistant are implemented in MeowUI `src/` and consumed by applications; product
business components and state adapters stay in each host. Do not write another Composer, message list,
navigation, or business panel in stories, workshop, or Storybook at the same position.

Storybook and the stories in each module only provide a gallery: mount real components, arrange
variants, pass fixed data, drive props, and simulate environments outside their scope. Display
containers and example children can compose existing components, but must not take over the structure,
styles, or interaction implementation of the displayed component. When new composition capabilities
are needed, first decide whether they are shared or business-owned, implement them in the owning
`src/`, and let real consumers use them; do not move a demo-only fake product into a production
directory just to give it an owner.
Views that have exited the product and historical design samples do not enter the current product
gallery; research material stays in a separate research entry point.

Reuse Stack / Inline / Grid for arrangement, alignment, and semantic spacing, and use LayoutItem for
child stretching; business widths, breakpoints, and text strategies are decided by the application,
and not every element requires an extra wrapper.

Shared components do not read Dashboard state, question lifecycles, or business interfaces; they use
props, children, and events to hand control to the caller.
Default styles hold in this package's theme and do not depend on story-only CSS or host overrides to
reach a usable result.
Do not create hard-coded pixel tests or fixed scoring gates for aesthetics; verify native semantics,
events, forms, and state contracts with tests.

## Test organization

Tests follow the test file organization specification (historical reference in the original product
repository). `src/` holds no tests;
Bun behavior and contract tests live in `tests/unit/`, type cases in `tests/types/`, and real browser
tests in `tests/browser/`. Under unit, group by components, chat, icons, shared, and theme; name files
after the component or contract, not after the revision batch. Component structure contracts belong to
components/chat, and theme generation contracts to theme.
Review the independent value of existing cases before adding or splitting tests; merge duplicate tests
with the same inputs and results; visual constants are not aesthetic acceptance. See the README for the
specific commands and typecheck entry point.

## Style implementation

The visual model is [Styling: MeowCSS is not ordinary CSS](#styling-meowcss-is-not-ordinary-css).
This section is the file layout and the delivery wiring.

CSS template files use `<responsibility>.styles.ts`; the standard theme organizes them by
components/chat/icons/shared, and base, state, and responsive rules for one component family live in
one place. See the style file organization (historical reference in the original product repository)
for the full rules and current organization.

The shared style mechanism comes from `meowcss`; do not maintain a second implementation in this
package. Import typed part composition from `meowcss/meowjsx` and DOM theme binding from
`meowcss/web`. Theme source uses the TS `css` template. Reference `uiTokens`, `ui` and typed part descriptors, and use options.when for component option
conditions; do not hand-write generated variable names or build another visual class-name mapping.
Components declare style options and defaults on `meta.style`, wired by the `createMeowUI` adapter.
Themes type-import components and runtime-import only implementation-free options modules. The
selective registration factory imports no complete component catalog. The syntax highlighter stays
in the code-surface components, so a host registering only Button does not retain its engine graph.
`sideEffects: false` lets a bundler drop unused component modules from the package barrel.
`standardTheme.cssText` is handed to the host for explicit composition: static builds generate CSS
assets, dynamic documents use `mountStyles` and clean up; root configuration uses `Theme`,
`applyTheme`, or `themeAttributes`.
Importing style modules does not touch the DOM. Business layout stays in the application; installing
styles and configuration does not replace component registration.
