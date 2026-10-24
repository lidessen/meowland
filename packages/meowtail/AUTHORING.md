# Authoring components the Meowland way

This guide is for application authors who know shadcn/ui and Tailwind. It shows how to write a
component with MeowJSX, address its parts with MeowCSS, and use Meowtail's built-in theme values.
The worked examples have typechecked counterparts in
[tests/fixtures/authoring](tests/fixtures/authoring/), and
[authoring.test.tsx](tests/unit/theme/authoring.test.tsx) renders them and audits their styles.

Library contributors also follow [AGENTS.md](AGENTS.md).

## Step 0: use what exists

Most shadcn components already exist here with the same anatomy. Reach for these before writing
anything:

| shadcn/ui                                                                         | Meowtail                                                                                              |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Button                                                                            | `Button` (`primary`, `outline`, `quiet`, `accent`, `danger`, `stop`), `IconButton`                    |
| Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction | the same names                                                                                        |
| Badge                                                                             | `Badge`, `Tag`, `Pill`                                                                                |
| Alert                                                                             | `Alert`                                                                                               |
| Dialog, AlertDialog, Sheet                                                        | `Dialog`, `Modal`, `RiskConfirmation`, `Drawer`                                                       |
| Tabs, ToggleGroup                                                                 | `Tabs`, `SegmentedControl`, `ChoiceGroup`                                                             |
| Input, Textarea, Select, Checkbox, Switch, Slider, Label + FormField              | `Input`, `Textarea`, `Select` / `ChoiceSelect`, `Checkbox`, `Switch`, `Slider`, `Field`, `FieldGroup` |
| Tooltip, Popover, HoverCard                                                       | `Tooltip`, `Popover`, `HoverCard`                                                                     |
| DropdownMenu, ContextMenu                                                         | `MenuButton`, `Menu`, `ContextMenu`                                                                   |
| Separator, Skeleton, Avatar, Accordion, Table, Breadcrumb, Progress               | the same names                                                                                        |
| Sonner / Toast                                                                    | `Toast`                                                                                               |
| Sidebar                                                                           | `NavList`, `IconRail`                                                                                 |
| Kbd, Spinner, AspectRatio, Empty                                                  | `ShortcutKeys`, `Spinner`, `AspectRatio`, `EmptyState`                                                |
| `flex gap-*`, `grid grid-cols-*`                                                  | `Stack`, `Inline`, `Grid` with `gap="compact" \| "normal" \| "relaxed"`                               |
| `<p className="text-muted-foreground text-sm">`                                   | `Text variant="secondary" \| "caption" \| "eyebrow"`                                                  |
| `prose` (typography plugin)                                                       | `Prose`                                                                                               |

Write a component when the library does not have its shape. Business components such as a plan
badge, a stat card or a settings row belong to the host.

## The translation

| shadcn + Tailwind                       | Meowland                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| A function component that re-renders    | An ordinary function whose setup runs once per mount; bound Signals carry later updates             |
| `data-slot="card-title"`                | `meta.parts` and `ref={context.parts.title}`                                                        |
| `cva({ variants })` + `VariantProps`    | `defineOptions` + `meta.style: defineStyleProps(...)`, `ThemedProps` and `options.when(...)` in CSS |
| Utility classes in `className`          | `className={[ui.p.group, ui.bg.fill]}` or `cx(ui.p.group, ui.bg.fill)`                              |
| The Tailwind scale                      | Typed roles in `ui` and `uiTokens`                                                                  |
| `dark:` variants                        | Color tokens carry light/dark pairs; nested scheme regions resolve their own values                 |
| `hover:`, `focus-visible:`, `disabled:` | Native CSS states and finite theme values that retain their state rules                             |
| `cn()`                                  | Public `cx` from `meowcss`; stylesheet order and the CSS cascade decide conflicts                   |
| Radix primitives                        | Meowtail's behavior components; native elements first for a new primitive                           |
| Tailwind preflight                      | The standard theme's foundation within a Meowland region                                            |
| A lint plugin for class names           | `auditCSS(fragment, standardAuditRules)` checks painted values                                      |

## Components and parts

A component is a function with static metadata. The second argument supplies that mount's lifecycle
and finite part bindings. Register the function itself; declaring metadata does not register it.

```tsx
import { h, type Context, type Props, type RefBinding } from "meowjsx";
import type {} from "meowjsx/web";

interface StatCardProps extends Props {
  label: string;
  value: string;
  ref?: RefBinding<HTMLElement>;
}

export function StatCard(
  { label, value, children, ref, ...props }: StatCardProps,
  context: Context<typeof StatCard>,
) {
  return (
    <section {...props} ref={[context.parts.root, ref]}>
      <p ref={context.parts.label}>{label}</p>
      <strong ref={context.parts.value}>{value}</strong>
      <div ref={context.parts.delta}>{children}</div>
    </section>
  );
}
StatCard.meta = {
  name: "app-stat-card",
  parts: ["root", "label", "value", "delta"],
} as const;
```

Part bindings preserve component identity and original props before mounting. They add no wrapper
or component instance. A ref array can also contain local callbacks, nested forwarded refs and
false/nullish omissions. Callbacks run in order, and their synchronous cleanups run in reverse order.
Static HTML reads part identity without invoking callbacks.

Setup still runs only once. Type a changing prop as `MaybeSignal<T>` and pass the Signal through to
its text, attribute or child binding. An event handler reads the live value with `unwrap` or
`.value`. A setup-time `unwrap` reads once and does not make a plain variable reactive.

## Wiring

Register the component families the host renders, and assemble its styles with the standard theme:

```ts
import { createRuntime } from "meowjsx";
import { createMeowUI, meowUIComponents } from "meowtail";
import { extendStandardTheme } from "meowtail/theme";
import { mountStyles } from "meowcss/web";
import { PlanBadge } from "./plan-badge";
import { StatCard } from "./stat-card";
import { ListRow } from "./list-row";

const runtime = createRuntime({
  plugins: [createMeowUI({ components: [...meowUIComponents, PlanBadge, StatCard, ListRow] })],
});
const appTheme = extendStandardTheme({
  styles: [planBadgeStyles, statCardStyles, listRowStyles],
});
const removeStyles = mountStyles(document, appTheme.cssText);
```

For a small host, pass a narrow list such as `[Button, PlanBadge]` instead of the complete
`meowUIComponents` catalog. The selective factory does not import the complete catalog or its
optional engines. Register nested component families that the composition renders as well.

Prefix host metadata names (`app-badge`, for example). The registry layers by name, so registering
a host component as `card` replaces the library identity with that name. Install one style-props
adapter through `createMeowUI`; a separate runtime plugin can also list component functions.

`extendStandardTheme` keeps the foundation first, standard component rules before host fragments,
and the shared utility sheet last. Part descriptors use zero-specificity selectors; complete rules
retain their ordinary specificity. Class order in `cx` does not override stylesheet order.

## Class values and theme rules

`ui` is Meowtail's built-in catalog. A value carries both a CSS class and its declarations, so it
works on an instance and inside a theme rule:

```tsx
import { cx } from "meowcss";
import { ui } from "meowtail/theme";

const panel = cx(ui.p.panel, ui.bg.raised, ui.radius.xl);
<div className={["host-panel", panel]} />;
```

```ts
import type { StatCard } from "./stat-card";
import { css, parts } from "meowcss/meowjsx";
import { cx } from "meowcss";
import { ui, uiTokens } from "meowtail/theme";

const card = parts<typeof StatCard>("app-stat-card");
export const statCardStyles = css`
  ${card.root} {
    ${cx(ui.surface.raised, ui.p.panel)}
    display: grid;
    gap: ${uiTokens.space.group};
  }
  ${card.label} {
    ${ui.text.eyebrow}
    margin: 0;
  }
  ${card.value} {
    ${ui.text.title}
    font-variant-numeric: tabular-nums;
  }
  ${card.delta} {
    ${ui.text.caption}
  }
`;
```

The theme imports only the component's type. `parts<typeof StatCard>("app-stat-card")` checks the
name and available members without loading that component's implementation. Within a `cx` composite,
values from one catalog expand in that catalog's stylesheet order. Separate CSS interpolations keep
ordinary CSS order. A plain external class string has no declarations, so a composite containing one
cannot be expanded inside a rule.

Class lists preserve order and omit `false`, `null`, `undefined` and empty strings. Lists can be
nested and can contain Signals. Use `cx` when a reusable composite should also retain declarations.
Keep hover, focus, disabled, responsive rules and one-off geometry in CSS; no condition language or
source scanning is needed.

## Options with variants

Components and themes share an options object from a module that imports neither implementation nor
assembled theme:

```ts
// plan-badge.options.ts
import { defineOptions } from "meowcss";
export const planBadgeOptions = defineOptions("app-plan-badge", {
  tone: ["free", "pro", "trial"],
});
```

```tsx
// plan-badge.tsx
import { h, type Context, type Props } from "meowjsx";
import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { planBadgeOptions } from "./plan-badge.options";

interface PlanBadgeProps extends Props, ThemedProps<typeof planBadgeOptions> {}

export function PlanBadge({ ref, ...props }: PlanBadgeProps, context: Context<typeof PlanBadge>) {
  return <span {...props} ref={[context.parts.root, ref]} />;
}
PlanBadge.meta = {
  name: "app-plan-badge",
  parts: ["root"],
  style: defineStyleProps(planBadgeOptions, { defaults: { tone: "free" } }),
} as const;
```

```ts
// plan-badge.styles.ts
import type { PlanBadge } from "./plan-badge";
import { css, parts } from "meowcss/meowjsx";
import { ui, uiTokens } from "meowtail/theme";
import { planBadgeOptions } from "./plan-badge.options";

const badge = parts<typeof PlanBadge>("app-plan-badge");
export const planBadgeStyles = css`
  ${badge.root} {
    ${ui.text.caption}
    display: inline-flex;
    padding: 2px ${uiTokens.space.group};
    border-radius: ${uiTokens.radius.sm};
    ${planBadgeOptions.when({ tone: "pro" })} {
      background: ${uiTokens.action.primary};
      color: ${uiTokens.action.onPrimary};
    }
  }
`;
```

`<PlanBadge tone="pro">` carries `data-option-app-plan-badge-tone="pro"`; the adapter consumes the
`tone` prop. `defineStyleProps` validates defaults, and registration validates that carrier parts
exist. Token assembly rejects conflicting definitions for the same option attribute. It does not
compare the component with an independently authored theme schema; share the options object.

## The floor

The foundation gives a Meowland region border-box sizing, contained media, a mono code face,
inherited control type and shared focus defaults. It does not reset headings, lists or margins.
Use `Text` for copy and `Prose` for reading content.

Theme values keep materials, typography and state behavior on the existing token roles. A part's
geometry stays beside that selector, where its exceptions can be reviewed. Dark colors resolve at
the nearest scheme region without rebuilding component instances.

Audit application fragments with the same rules as the standard theme:

```ts
import { auditCSS } from "meowcss";
import { standardAuditRules } from "meowtail/theme";

test("app styles stay on the standard scales", () => {
  for (const fragment of appStyles) expect(auditCSS(fragment, standardAuditRules)).toEqual([]);
});
```

The audit reports literal colors, durations, type sizes, line heights, weights and radii with their
selector and line. Token references, derived lengths, masks, `0` and `50%` pass. Accept a deliberate
exception through `allow` and keep its reason beside it. Spacing is not audited: part geometry can
use off-ramp lengths.

Icons follow [Which icon where](src/icons/README.md#which-icon-where). Each intent has one icon;
leading icons name the type, trailing icons name an action, and state uses the shared status marker.
Check a new composition in the real component scene, including focus, disabled state, a narrow
viewport and both themes. Type and audit checks do not establish those observations.
