import { defineComponent, h, type Child, type Props } from "meowjsx";
import { DoodleCat } from "../icons/doodle-cat";
import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";

export const emptyStateOptions = defineOptions("empty-state", { size: ["default", "compact"] });

export const emptyStateContract = {
  name: "empty-state",
  parts: ["root", "illustration", "title", "description", "action"],
  styleProps: defineStyleProps(emptyStateOptions, { defaults: { size: "default" } }),
} as const satisfies StyledComponentContract;

export interface EmptyStateProps extends Props, ThemedProps<typeof emptyStateOptions> {
  title: string;
  copy?: string;
  action?: Child;
  className?: string;
}

export const EmptyState = defineComponent<
  EmptyStateProps,
  typeof emptyStateContract.name,
  (typeof emptyStateContract.parts)[number]
>(emptyStateContract, ({ title, copy, action, className, ...props }, context) =>
  context.part(
    "root",
    "div",
    { ...props, className },
    context.part("illustration", "div", null, <DoodleCat />),
    context.part("title", "strong", null, title),
    copy ? context.part("description", "span", null, copy) : null,
    action ? context.part("action", "div", null, action) : null,
  ),
);
