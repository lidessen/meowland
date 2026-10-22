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

A `defineComponent` body is setup. It runs once for that mount. Nothing runs it again: there is no
re-render and no hook order. A later change reaches the DOM only through a Signal that setup bound
to a prop, an attribute, a text node, or a child.

`context.signal`, `context.effect`, and `context.onCleanup` belong to that mount. They come from the
same `meowjsx` entry as `defineComponent`, `isSignal`, `mapSignal`, `derived`, `unwrap`, `keyed`,
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
  defineComponent,
  isSignal,
  mapSignal,
  unwrap,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";

export const toggleContract = {
  name: "toggle",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface ToggleProps extends Props {
  /** Controlled when provided; a Signal keeps it live. */
  pressed?: MaybeSignal<boolean>;
  defaultPressed?: boolean;
  disabled?: MaybeSignal<boolean>;
  onPressedChange?: (pressed: boolean) => void;
}

/** Setup runs once; only the bound Signals below change after mount. */
export const Toggle = defineComponent<ToggleProps, "toggle", "root">(
  toggleContract,
  (
    { pressed, defaultPressed = false, disabled = false, onPressedChange, children, ...props },
    context,
  ) => {
    const local = context.signal(defaultPressed);
    // Presence decides the owner. false is a controlled value.
    const current = pressed !== undefined ? pressed : local;
    const ariaPressed = isSignal(current)
      ? mapSignal(current, (value) => String(value))
      : String(current);
    return context.part(
      "root",
      "button",
      {
        ...props,
        type: "button",
        "aria-pressed": ariaPressed,
        disabled,
        onClick: () => {
          const next = !unwrap(current);
          if (pressed === undefined) local.value = next;
          onPressedChange?.(next);
        },
      },
      children,
    );
  },
);
```

Before handoff, check three things. Does a setup-time `unwrap`, or a branch on a prop, have to stay
live? Does a `context.effect` only write another signal? Does a Signal's value return a VNode?

## Styling: MeowCSS is not ordinary CSS

The component names parts and style options. The standard theme paints them. A `defineComponent`
body does not carry the visual rules, and a host class name is not the implementation of the look.

Put the rules in `src/theme/<area>/<responsibility>.styles.ts`, one family in one file, using the
`css` template from `meowcss/meowjsx`. Select a part with `partSelector(contract, part)`. That value
is `:where([data-meowui-part="<name>/<part>"])`, so it does not fight a host rule. Declare axes with
`defineOptions` from `meowcss` and attach them with `defineStyleProps` on the contract. The option
attribute is written on the parts named in `defineStyleProps` (`root` when `parts` is omitted), so
`options.when({ tone: "accent" })` belongs on a selector for one of those parts. Hover rules in
`button.styles.ts` interpolate `options.attribute` when the selector itself has to name the variant.
`createMeowUI` writes `data-meowui-part` and the option attribute for a
contract it has registered. Declaring the contract does not register it: a new family is added to
`meowUIComponents` and its fragment is included in `standardThemeStyles`. The component does not set
those attribute strings. Importing the styles module does not insert CSS. The host mounts
`standardTheme.cssText`.

Color, type, radius, motion, and the shared lengths come from `uiTokens` in `src/theme/tokens.ts`,
plus `accentTokens`, `statusTokens`, `radiusTokens`, `lineTokens`, and `layerTokens` in
`src/theme/palette.ts`. Interpolating a token emits `var(--…)`, including a light/dark pair. The
spacing steps are `spaceGroup` (8px), `spaceSection` (20px), and `spacePanel` (24px). Control
heights are one ladder: `controlSmall` / `controlHeight` / `controlLarge` (28 / 36 / 44px), equal to
`buttonSmall` / `buttonHeight` / `buttonLarge`, so a field, a select and a button in one row share a
height and center line. Field surfaces (Input, Textarea, Select, ChoiceSelect, SearchInput,
NumberInput) take their box and their hover, focus, read-only, invalid and disabled states from
`src/theme/shared/field-surface.styles.ts`; a field family's own file adds layout only. Type sizes
come from the `uiTokens` ramp (`fontMicro` 11, `fontCaption`/`fontCode` 12, `fontLabel` 13,
`fontBody` 14, `fontTitle` 16, `fontHeading` 20, `fontPageTitle` 24) and radii from `radiusTokens`
chosen by element size; do not write a literal size or radius beside them. Arrange siblings with `Stack`, `Inline`, or `Grid` and a `gap` of `none`, `compact`,
`normal`, or `relaxed` (0, group, section, panel). Judgment for departing from that scale is in
[Default scale and composition](#default-scale-and-composition).

| Do                                                                                                                                                                                                          | Don't                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Style each part from its contract with `partSelector`, in the theme file for that family.                                                                                                                   | Add a `.css` file, a CSS module, styled-components, Emotion, or Tailwind utilities.                                                                                                 |
| Put variant axes on the contract (`defineOptions`, `defineStyleProps`) and branch with `options.when` or `options.attribute`.                                                                               | Hand-write `data-meowui-part` or `data-option-*`, or select a raw prop name such as `[variant="accent"]`. The style plugin removes the option prop and writes the option attribute. |
| Take color, type, radius, and the spacing steps from `uiTokens` and the palette tokens. A length that belongs to one part stays next to that part's selector in the theme file.                             | Hardcode a hex color or a second spacing ramp in the component.                                                                                                                     |
| Forward a host `className` on the root part. The component looks finished without it.                                                                                                                       | Build the look from a variant class string, or from story-only CSS.                                                                                                                 |
| Compose siblings with `Stack`, `Inline`, or `Grid`. Those primitives set structural layout (`display`, flex, or grid) through `layoutStyle`; their gap still comes from style props and `layout.styles.ts`. | Copy that inline `style` object onto a visual component for color, font, radius, or padding.                                                                                        |
| Send an instance measurement the stylesheet cannot know as a custom property: `tokenRef` on `style`, read back by the theme. `tabsCount` and `tabsIndex` are that channel.                                  | Use a `style` object as the theme.                                                                                                                                                  |

A parent stylesheet addresses that component's own parts. An anonymous node inside the part, such as
the `svg` in a button, may use a descendant selector from that part. Another component keeps its own
contract; do not reach into it with a descendant class or tag selector.

### Canonical styles

`Button` is the product instance of this wiring: [button.tsx](src/components/button.tsx) and
[button.styles.ts](src/theme/components/button.styles.ts). The fixture below is the same shape, split
the way those files are split. The typechecked copy merges them into one module and is not a product
component.

Component, next to the other components:

```tsx
import { defineComponent, type Props } from "meowjsx";
import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";

export const calloutOptions = defineOptions("callout", {
  tone: ["neutral", "accent"],
});

export const calloutContract = {
  name: "callout",
  parts: ["root", "title"],
  styleProps: defineStyleProps(calloutOptions, {
    defaults: { tone: "neutral" },
  }),
} as const satisfies StyledComponentContract;

export interface CalloutProps extends Props, ThemedProps<typeof calloutOptions> {
  title: string;
}

/** Parts and options only. The look lives in calloutStyles. */
export const Callout = defineComponent<
  CalloutProps,
  typeof calloutContract.name,
  (typeof calloutContract.parts)[number]
>(calloutContract, ({ title, children, ...props }, context) =>
  context.part("root", "aside", props, context.part("title", "strong", null, title), children),
);
```

Theme file, `src/theme/components/callout.styles.ts`:

```tsx
import { css, partSelector } from "meowcss/meowjsx";
import { calloutContract, calloutOptions } from "../../components/callout";
import { uiTokens } from "../tokens";

export const calloutStyles = css`
  ${partSelector(calloutContract, "root")} {
    display: grid;
    gap: ${uiTokens.spaceGroup};
    padding: ${uiTokens.spaceGroup};
    color: ${uiTokens.foreground};
    font: 400 ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
    background: ${uiTokens.surfaceMuted};
    border-radius: ${uiTokens.controlRadius};
  }
  ${partSelector(calloutContract, "title")} {
    font-weight: 500;
  }
  ${partSelector(calloutContract, "root")} {
    ${calloutOptions.when({ tone: "accent" })} {
      color: ${uiTokens.primary};
      background: ${uiTokens.primarySoft};
    }
  }
`;
```

`partSelector` only accepts a part listed on the contract. `defineStyleProps` only accepts defaults
that are real choices. Passing `String(fragment)` into `defineTheme` drops the part dependency; pass
the fragment itself.

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
`meowcss/web`. Theme source uses the TS `css` template. Reference `uiTokens` and
`partSelector(contract, part)`, and use options.when for component option conditions; do not hand-write
generated variable names or build another visual class-name mapping.
Components declare style options and defaults through contracts, wired by the `createMeowUI` adapter.
A contract that theme styles or the registry import lives in a module that does not load an optional engine. The syntax highlighter stays in the code-surface components; those components import their contracts and do not re-export them. Importing the theme or installing the registry therefore does not bundle Shiki. `sideEffects: false` lets a bundler drop the unused component modules from the package barrel.
`standardTheme.cssText` is handed to the host for explicit composition: static builds generate CSS
assets, dynamic documents use `mountStyles` and clean up; root configuration uses `Theme`,
`applyTheme`, or `themeAttributes`.
Importing style modules does not touch the DOM. Business layout stays in the application; installing
styles and configuration does not replace component registration.
