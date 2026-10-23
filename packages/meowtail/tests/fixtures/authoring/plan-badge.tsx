// A host port of a shadcn `cva` badge. Public entry points only, as an application would write it.
import { defineComponent, type Props } from "meowjsx";
import { defineOptions } from "meowcss";
import {
  css,
  defineStyleProps,
  partSelector,
  type StyledComponentContract,
  type ThemedProps,
} from "meowcss/meowjsx";
import { uiTokens } from "meowtail/theme";

// cva variants become one option axis. The `app-` prefix keeps the contract out of Meowtail's names.
export const planBadgeOptions = defineOptions("app-plan-badge", {
  tone: ["free", "pro", "trial"],
});

export const planBadgeContract = {
  name: "app-plan-badge",
  parts: ["root"],
  styleProps: defineStyleProps(planBadgeOptions, { defaults: { tone: "free" } }),
} as const satisfies StyledComponentContract;

export interface PlanBadgeProps extends Props, ThemedProps<typeof planBadgeOptions> {
  className?: string;
}

/** Parts and options only; planBadgeStyles paints them. */
export const PlanBadge = defineComponent<PlanBadgeProps, "app-plan-badge", "root">(
  planBadgeContract,
  ({ children, className, ...props }, context) =>
    context.part("root", "span", { ...props, className }, children),
);

const root = partSelector(planBadgeContract, "root");

export const planBadgeStyles = css`
  ${root} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px ${uiTokens.space.group};
    border: ${uiTokens.line.width} solid transparent;
    border-radius: ${uiTokens.radius.sm};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.secondary};
    font: 500 ${uiTokens.type.caption} / 16px ${uiTokens.type.sans};
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
