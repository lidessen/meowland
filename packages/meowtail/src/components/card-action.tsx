import { h, type Props, type Context } from "meowjsx";

export interface CardActionProps extends Props {
  className?: Props["className"];
}

/** The actions at the end of a card header. */
export function CardAction(
  { children, className, ref, ...props }: CardActionProps,
  context: Context<typeof CardAction>,
) {
  return (
    <div {...props} className={className} ref={[context.parts.root, ref]}>
      {children}
    </div>
  );
}
CardAction.meta = { name: "card-action", parts: ["root"] } as const;
