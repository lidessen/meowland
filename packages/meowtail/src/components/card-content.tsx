import { h, type Props, type Context } from "meowjsx";

export interface CardContentProps extends Props {
  className?: Props["className"];
}

/** The body of a card. */
export function CardContent(
  { children, className, ref, ...props }: CardContentProps,
  context: Context<typeof CardContent>,
) {
  return (
    <div {...props} className={className} ref={[context.parts.root, ref]}>
      {children}
    </div>
  );
}
CardContent.meta = { name: "card-content", parts: ["root"] } as const;
