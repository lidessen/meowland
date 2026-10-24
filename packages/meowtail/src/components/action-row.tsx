import { h, type Props, type Context } from "meowjsx";
import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { actionRowRef } from "../shared/action-row-fit";

import { actionRowOptions } from "./action-row.options";
export { actionRowOptions } from "./action-row.options";

export interface ActionRowProps extends Props, ThemedProps<typeof actionRowOptions> {
  className?: Props["className"];
}

/**
 * A row of actions that stays on one line while it fits and stacks whole when it does not:
 * text actions become full-width lines in DOM order and icon actions stay together, so a row
 * never ends ragged or leaves one action alone. Keep the primary action last.
 */
export function ActionRow(
  { children, className, ref, ...props }: ActionRowProps,
  context: Context<typeof ActionRow>,
) {
  return (
    <div {...props} className={className} ref={[context.parts.root, ref, actionRowRef()]}>
      {children}
    </div>
  );
}
ActionRow.meta = {
  name: "action-row",
  parts: ["root"],
  style: defineStyleProps(actionRowOptions, { defaults: { align: "start" } }),
} as const;
