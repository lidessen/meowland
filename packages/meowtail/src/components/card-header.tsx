import { h, type Props, type Context } from "meowjsx";

export interface CardHeaderProps extends Props {
  className?: Props["className"];
}

/** The top of a card: its title, description and actions. */
export function CardHeader(
  { children, className, ref, ...props }: CardHeaderProps,
  context: Context<typeof CardHeader>,
) {
  return (
    <div {...props} className={className} ref={[context.parts.root, ref]}>
      {children}
    </div>
  );
}
CardHeader.meta = { name: "card-header", parts: ["root"] } as const;
