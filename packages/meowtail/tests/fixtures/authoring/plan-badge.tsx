import { h, type Context, type Props } from "meowjsx";
import { defineStyleProps, type ThemedProps, parts, css } from "meowcss/meowjsx";
import { uiTokens } from "meowtail/theme";
import { planBadgeOptions } from "./plan-badge.options";

export interface PlanBadgeProps extends Props, ThemedProps<typeof planBadgeOptions> {}

export function PlanBadge(
  { children, className, ...props }: PlanBadgeProps,
  context: Context<typeof PlanBadge>,
) {
  return (
    <span {...props} className={className} ref={context.parts.root}>
      {children}
    </span>
  );
}
PlanBadge.meta = {
  name: "app-plan-badge",
  parts: ["root"],
  style: defineStyleProps(planBadgeOptions, { defaults: { tone: "free" } }),
} as const;

const badge = parts<typeof PlanBadge>("app-plan-badge");
export const planBadgeStyles = css`
  ${badge.root} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px ${uiTokens.space.group};
    border: ${uiTokens.line.width} solid transparent;
    border-radius: ${uiTokens.radius.sm};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.weight.medium} ${uiTokens.type.caption} / ${uiTokens.type.line.micro}
      ${uiTokens.type.sans};
    white-space: nowrap;
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
