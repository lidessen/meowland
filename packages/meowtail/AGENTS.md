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

## Default scale and composition

- The default design uses DeepSeek Harness as its baseline: standard buttons are 36px high, compact
  buttons 28px, and inputs 32px. Information blocks are tight inside; page edges, standalone blocks,
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
`standardTheme.cssText` is handed to the host for explicit composition: static builds generate CSS
assets, dynamic documents use `mountStyles` and clean up; root configuration uses `Theme`,
`applyTheme`, or `themeAttributes`.
Importing style modules does not touch the DOM. Business layout stays in the application; installing
styles and configuration does not replace component registration.
