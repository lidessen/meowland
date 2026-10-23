import { defineComponent, type Props } from "meowjsx";
import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { actionRowRef } from "../shared/action-row-fit";

export const actionRowOptions = defineOptions("action-row", {
  /** Where the row sits when it fits on one line: with the content, or at the trailing edge. */
  align: ["start", "end"],
});

export const actionRowContract = {
  name: "action-row",
  parts: ["root"],
  styleProps: defineStyleProps(actionRowOptions, { defaults: { align: "start" } }),
} as const satisfies StyledComponentContract;

export interface ActionRowProps extends Props, ThemedProps<typeof actionRowOptions> {
  className?: string;
}

/**
 * A row of actions that stays on one line while it fits and stacks whole when it does not:
 * text actions become full-width lines in DOM order and icon actions stay together, so a row
 * never ends ragged or leaves one action alone. Keep the primary action last.
 */
export const ActionRow = defineComponent<
  ActionRowProps,
  typeof actionRowContract.name,
  (typeof actionRowContract.parts)[number]
>(actionRowContract, ({ children, className, ...props }, context) =>
  context.part("root", "div", { ...props, className, ref: actionRowRef(props.ref) }, children),
);
