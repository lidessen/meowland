# Authoring components the Meowland way

This guide is for application authors who know shadcn/ui and Tailwind. It shows how the same
component is written with MeowJSX, MeowCSS and Meowtail, and how the style floor keeps it on the
system. The three worked ports below are real, typechecked modules in
[tests/fixtures/authoring](tests/fixtures/authoring/), and
[authoring.test.tsx](tests/unit/theme/authoring.test.tsx) renders them and audits their styles.

Library contributors also follow [AGENTS.md](AGENTS.md); this page covers only what a host needs.

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

Write a component only for a shape the library does not have. Business components (a plan badge,
a stat card, a settings row) are exactly that.

## The translation

| shadcn + Tailwind                                    | Meowland                                                                                                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| A function component that re-renders                 | `defineComponent`: setup runs once per mount; a `Signal` bound to an attribute, text or child is what changes later                           |
| `data-slot="card-title"`                             | contract `parts`; `context.part("title", "h3", …)` writes `data-meowui-part="app-card/title"`                                                 |
| `cva({ variants })` + `VariantProps`                 | `defineOptions` + `defineStyleProps` on the contract, `ThemedProps` on the props, `options.when({ tone: "pro" })` in CSS                      |
| Utility classes in `className`                       | a `css` fragment beside the component, selecting parts with `partSelector` and painting with `uiTokens` roles and recipes                     |
| The Tailwind scale (`p-4`, `rounded-lg`, `bg-muted`) | roles: `uiTokens.space.*`, `radius.*`, `surface.*`, `ink.*`, `type.*`, `motion.*`                                                             |
| `dark:` variants                                     | nothing: every color role is a `[light, dark]` pair, and nested scheme regions resolve their own value                                        |
| `hover:`, `focus-visible:`, `disabled:`              | `interactive({ on })` and `focusRing()`                                                                                                       |
| `cn()` and `tailwind-merge`                          | every part selector has zero specificity, so a host rule or `className` wins without a merge step                                             |
| Radix primitives                                     | Meowtail's behavior components above; for a new primitive, native elements (`button`, `dialog`, `details`) first                              |
| Tailwind preflight                                   | the standard theme's foundation: border-box sizing, contained media, mono code, inherited control type, one focus outline, one thin scrollbar |
| A lint plugin for class names                        | `auditCSS(fragment, standardAuditRules)` in a unit test: literal colors, durations, font sizes and radii fail                                 |

## Wiring

A host adds two things to the standard setup: a plugin that registers its contracts, and a theme
assembled after the standard one.

```ts
// app-theme.ts
import type { RuntimePlugin } from "meowjsx";
import { extendStandardTheme } from "meowtail/theme";

export const appComponents: RuntimePlugin = {
  name: "app-components",
  components: [planBadgeContract, statCardContract, listRowContract],
};
export const appTheme = extendStandardTheme({
  styles: [planBadgeStyles, statCardStyles, listRowStyles],
});

// main.tsx
const runtime = createRuntime({ plugins: [createMeowUI(), appComponents] });
const removeStyles = mountStyles(document, appTheme.cssText);
```

- **Prefix every contract name** (`app-badge`, not `badge`). The registry layers contracts by
  name: a host `card` would replace Meowtail's `card`, and the library's Card rules would paint it.
- **Install one style-props plugin.** `createMeowUI()` already contains it; the host plugin lists
  contracts only.
- **Keep host styles after the standard families.** `extendStandardTheme` does that. Every rule has
  zero specificity, so order decides ties; the foundation is first, the host is last.
- **Leave the component without visual rules.** It names parts and options; the fragment paints them.

## Recipes

Recipes carry a rule, not just a value, into any selector. They hold role-level properties only;
geometry (padding, height, gap) stays next to the part, where its optical choices stay visible.

| Recipe                                                                            | What it writes                                                                                                       |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `surface("canvas" \| "raised" \| "overlay" \| "fill")`                            | the rung's background with its one edge, radius and depth (a fill takes no edge)                                     |
| `text("body" \| "secondary" \| "caption" \| "eyebrow" \| "title" \| "pageTitle")` | the text role: ink, size, weight, leading, tracking                                                                  |
| `interactive({ on: "raised" \| "flat", pressed? })`                               | hover behind `(hover: hover)`, press, keyboard focus, disabled; on a raised surface the overlay paints over the rung |
| `focusRing({ inset? })`                                                           | the 2px focus outline; `inset` for a clipped scroller                                                                |

## Port 1: a badge with variants (shadcn `cva`)

```tsx
// shadcn
const planBadge = cva("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", {
  variants: {
    tone: {
      free: "bg-muted text-muted-foreground",
      pro: "bg-primary text-primary-foreground",
      trial: "border border-dashed",
    },
  },
  defaultVariants: { tone: "free" },
});
```

```tsx
// Meowland: tests/fixtures/authoring/plan-badge.tsx
export const planBadgeOptions = defineOptions("app-plan-badge", { tone: ["free", "pro", "trial"] });

export const planBadgeContract = {
  name: "app-plan-badge",
  parts: ["root"],
  styleProps: defineStyleProps(planBadgeOptions, { defaults: { tone: "free" } }),
} as const satisfies StyledComponentContract;

export const PlanBadge = defineComponent<PlanBadgeProps, "app-plan-badge", "root">(
  planBadgeContract,
  ({ children, className, ...props }, context) =>
    context.part("root", "span", { ...props, className }, children),
);

export const planBadgeStyles = css`
  ${root} {
    display: inline-flex;
    align-items: center;
    padding: 2px ${uiTokens.space.group};
    border: ${uiTokens.line.width} solid transparent;
    border-radius: ${uiTokens.radius.sm};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.weight.medium} ${uiTokens.type.caption} / ${uiTokens.type.line.micro}
      ${uiTokens.type.sans};
    ${planBadgeOptions.when({ tone: "pro" })} {
      background: ${uiTokens.action.primary};
      color: ${uiTokens.action.onPrimary};
    }
    ${planBadgeOptions.when({ tone: "trial" })} {
      border-style: dashed;
      border-color: ${uiTokens.line.control};
      background: transparent;
    }
  }
`;
```

`<PlanBadge tone="pro">` renders `data-option-app-plan-badge-tone="pro"`; the `tone` prop never
reaches the DOM, and an unknown tone is a type error.

## Port 2: a card built from recipes

A stat card is a raised surface with an eyebrow label, a title-sized figure and a caption delta.
Recipes state that directly, so the card cannot drift from Card's material or Text's roles:

```tsx
// tests/fixtures/authoring/stat-card.tsx
export const statCardStyles = css`
  ${part("root")} {
    ${surface("raised")}
    display: grid;
    gap: 4px;
    padding: ${uiTokens.space.insetBlock} ${uiTokens.space.insetInline};
  }
  ${part("label")} {
    ${text("eyebrow")}
    margin: 0;
  }
  ${part("value")} {
    ${text("title")}
    margin: 0;
    font-size: ${uiTokens.type.heading};
    font-variant-numeric: tabular-nums;
  }
  ${part("delta")} {
    ${text("caption")}
    margin: 0;
  }
  ${part("root")}[data-trend="up"] ${part("delta")} {
    color: ${uiTokens.status.success};
  }
`;
```

`value`, `delta` and `trend` accept a `Signal`: the component binds it once in setup and only that
text or attribute changes later. Nothing re-renders.

## Port 3: an interactive row

```tsx
// tests/fixtures/authoring/list-row.tsx
export const listRowStyles = css`
  ${part("root")} {
    ${text("body")}
    ${interactive({ on: "flat" })}
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    min-height: ${uiTokens.control.large};
    padding: 6px ${uiTokens.space.group};
    border: 0;
    border-radius: ${uiTokens.radius.md};
    background: transparent;
    text-align: start;
  }
  ${part("root")}[aria-current="true"] {
    background: ${uiTokens.accent.selected};
  }
`;
```

The row is a native `button`, so keyboard activation, `disabled` and focus come from the platform;
`interactive` gives it the system's hover, press, focus outline and disabled ink.

## The floor

Three layers keep a host component from drifting:

1. **Foundation.** Inside any Meowland region, before any family rule: border-box sizing, media that
   never overflows its column, code in the mono face, controls in the surrounding type, one focus
   outline. It resets no margins, headings or lists; copy takes `Text` and reading takes `Prose`.
2. **Recipes and roles.** The easy path writes `surface("raised")` and `uiTokens.space.group`, not a
   grey and a pixel count.
3. **Audit.** Put this in the host's unit tests:

   ```ts
   import { auditCSS } from "meowcss";
   import { standardAuditRules } from "meowtail/theme";

   test("app styles stay on the standard scales", () => {
     for (const fragment of appStyles) expect(auditCSS(fragment, standardAuditRules)).toEqual([]);
   });
   ```

   It reports each literal color, duration, font size and radius with its selector and line. Values
   through `var(...)`, lengths derived from a role (`calc(var(...) - 1px)`, `em`), masks, `0` and
   `50%` pass. Accept a deliberate exception with `auditCSS(fragment, rules, { allow })` and keep the
   reason beside it. Spacing is not audited yet: part geometry legitimately uses off-ramp lengths.

The standard theme passes the same audit, and so do the three ports.

Icons follow one map: [Which icon where](src/icons/README.md#which-icon-where) gives each intent
one icon and says where icons go (leading names the type, trailing names what a click does, a state
is never a recolored icon). Read a host's icons against it before adding one; an icon outside the
semantic set goes through `IconSource` and still follows the placement rules.

## Where this goes past shadcn

- **Parts are a typed contract.** `partSelector` only accepts a declared part, and option defaults
  must be real choices. A misspelled `data-slot` in shadcn is a silent no-op.
- **Overrides never fight.** Library rules have zero specificity, so a host rule wins by existing,
  without `!important`, `cn()` or a merge library.
- **Dark mode is not a second set of classes.** Roles carry both schemes, and a nested region can
  switch scheme without re-rendering its content.
- **State survives updates.** Setup runs once; Signals patch text and attributes in place, so focus,
  drafts and native disclosure state survive data changes.
- **Drift fails a test.** The audit checks the rules a reviewer would otherwise check by eye.
