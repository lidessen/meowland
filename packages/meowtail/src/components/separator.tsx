import { h, type Props, type Context } from "meowjsx";

export interface SeparatorProps extends Props {
  orientation?: "horizontal" | "vertical";
  className?: Props["className"];
}

/** A thin rule that divides groups of content or tools. */
export function Separator(
  { orientation = "horizontal", className, ...props }: SeparatorProps,
  context: Context<typeof Separator>,
) {
  return (
    <div
      {...props}
      className={className}
      role="separator"
      aria-orientation={orientation}
      ref={[context.parts.root, props.ref]}
    />
  );
}
Separator.meta = { name: "separator", parts: ["root"] } as const;
