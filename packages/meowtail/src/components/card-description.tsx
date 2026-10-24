import { h, type Props, type Context } from "meowjsx";

export interface CardDescriptionProps extends Props {
  className?: Props["className"];
}

/** The supporting line under a card title. */
export function CardDescription(
  { children, className, ref, ...props }: CardDescriptionProps,
  context: Context<typeof CardDescription>,
) {
  return (
    <p {...props} className={className} ref={[context.parts.root, ref]}>
      {children}
    </p>
  );
}
CardDescription.meta = { name: "card-description", parts: ["root"] } as const;
