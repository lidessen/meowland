import { h, type MaybeSignal, type Props, type Context } from "meowjsx";
import { isSignal, mapSignal } from "meowjsx";
import { css, parts } from "meowcss/meowjsx";
import { ui, uiTokens } from "meowtail/theme";

export interface StatCardProps extends Props {
  label: string;
  /** A Signal keeps the figure live; setup never re-runs. */
  value: MaybeSignal<string>;
  delta?: MaybeSignal<string>;
  trend?: MaybeSignal<"up" | "down" | "flat">;
}

export function StatCard(
  { label, value, delta, trend = "flat", className, ...props }: StatCardProps,
  context: Context<typeof StatCard>,
) {
  return (
    <section
      {...props}
      className={className}
      aria-label={label}
      data-trend={isSignal(trend) ? mapSignal(trend, String) : trend}
      ref={context.parts.root}
    >
      <p ref={context.parts.label}>{label}</p>
      <p ref={context.parts.value}>{value}</p>
      {delta !== undefined ? <p ref={context.parts.delta}>{delta}</p> : null}
    </section>
  );
}
StatCard.meta = {
  name: "app-stat-card",
  parts: ["root", "label", "value", "delta"],
} as const;

const card = parts<typeof StatCard>("app-stat-card");
export const statCardStyles = css`
  ${card.root} {
    ${ui.surface.raised}
    display: grid;
    gap: 4px;
    min-width: 0;
    padding: ${uiTokens.space.insetBlock} ${uiTokens.space.insetInline};
  }
  ${card.label} {
    ${ui.text.eyebrow}
    margin: 0;
  }
  ${card.value} {
    ${ui.text.title}
    margin: 0;
    font-size: ${uiTokens.type.heading};
    font-variant-numeric: tabular-nums;
  }
  ${card.delta} {
    ${ui.text.caption}
    margin: 0;
  }
  ${card.root}[data-trend="up"] ${card.delta} {
    color: ${uiTokens.status.success};
  }
  ${card.root}[data-trend="down"] ${card.delta} {
    color: ${uiTokens.status.danger};
  }
`;
