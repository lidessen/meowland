import { h, type Props, type Context } from "meowjsx";

export interface LinkProps extends Props {
  href: string;
  className?: Props["className"];
}

/**
 * Themed inline text link. Whole-row references to an openable object stay with ResourceLink.
 */
export function Link({ className, children, ...props }: LinkProps, context: Context<typeof Link>) {
  return (
    <a {...props} className={className} ref={[context.parts.root, props.ref]}>
      {children}
    </a>
  );
}
Link.meta = { name: "link", parts: ["root"] } as const;
