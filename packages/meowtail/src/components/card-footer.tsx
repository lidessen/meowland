import { h, type Props, type Context } from "meowjsx";
import { actionRowRef } from "../shared/action-row-fit";

export interface CardFooterProps extends Props {
  className?: Props["className"];
}

/** The row of actions at the end of a card; it stacks whole when it does not fit, like ActionRow. */
export function CardFooter(
  { children, className, ref, ...props }: CardFooterProps,
  context: Context<typeof CardFooter>,
) {
  return (
    <div {...props} className={className} ref={[context.parts.root, ref, actionRowRef()]}>
      {children}
    </div>
  );
}
CardFooter.meta = { name: "card-footer", parts: ["root"] } as const;
