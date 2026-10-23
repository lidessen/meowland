// A host stat card built from recipes: the surface, the type roles and nothing hand-mixed.
import {
  defineComponent,
  mapSignal,
  isSignal,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { css, partSelector } from "meowcss/meowjsx";
import { surface, text, uiTokens } from "meowtail/theme";

export const statCardContract = {
  name: "app-stat-card",
  parts: ["root", "label", "value", "delta"],
} as const satisfies ComponentContract;

export type StatTrend = "up" | "down" | "flat";

export interface StatCardProps extends Props {
  label: string;
  /** A Signal keeps the figure live; setup never re-runs. */
  value: MaybeSignal<string>;
  delta?: MaybeSignal<string>;
  trend?: MaybeSignal<StatTrend>;
  className?: string;
}

export const StatCard = defineComponent<
  StatCardProps,
  typeof statCardContract.name,
  (typeof statCardContract.parts)[number]
>(statCardContract, ({ label, value, delta, trend = "flat", className, ...props }, context) =>
  context.part(
    "root",
    "section",
    {
      ...props,
      className,
      "aria-label": label,
      "data-trend": isSignal(trend) ? mapSignal(trend, String) : trend,
    },
    context.part("label", "p", null, label),
    context.part("value", "p", null, value),
    delta !== undefined ? context.part("delta", "p", null, delta) : null,
  ),
);

const part = (name: (typeof statCardContract.parts)[number]) =>
  partSelector(statCardContract, name);

export const statCardStyles = css`
  ${part("root")} {
    ${surface("raised")}
    display: grid;
    gap: 4px;
    min-width: 0;
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
  ${part("root")}[data-trend="down"] ${part("delta")} {
    color: ${uiTokens.status.danger};
  }
`;
