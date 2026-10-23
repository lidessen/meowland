import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { defineComponent, type Props } from "meowjsx";

export const badgeOptions = defineOptions("badge", {
  tone: ["neutral", "accent", "success", "warning", "danger", "outline", "solid", "quiet"],
  size: ["small", "default"],
});

export const badgeContract = {
  name: "badge",
  parts: ["root"],
  styleProps: defineStyleProps(badgeOptions, { defaults: { tone: "neutral", size: "default" } }),
} as const satisfies StyledComponentContract;

export interface BadgeProps extends Props, ThemedProps<typeof badgeOptions> {
  className?: string;
}

/** A small label that names a category, such as a version or a release stage. */
export const Badge = defineComponent<
  BadgeProps,
  typeof badgeContract.name,
  (typeof badgeContract.parts)[number]
>(badgeContract, ({ children, className, ...props }, context) =>
  context.part(
    "root",
    "span",
    {
      ...props,
      className,
    },
    children,
  ),
);
