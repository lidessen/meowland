import { h, type Child, type Context, type Props } from "meowjsx";

export interface PresentationListProps extends Props {
  as?: "ul" | "ol";
  /** Item content; static null, undefined and boolean entries are omitted. */
  items: readonly Child[];
}

/** Native list semantics at the presentation's reading scale. */
export function PresentationList(
  { as = "ul", items, className, ref, ...props }: PresentationListProps,
  context: Context<typeof PresentationList>,
) {
  const parts = context.parts;
  const Root = as;
  return (
    <Root {...props} ref={[parts.root, ref]} className={className}>
      {items
        .filter((item) => item !== null && item !== undefined && typeof item !== "boolean")
        .map((item) => (
          <li ref={parts.item}>{item}</li>
        ))}
    </Root>
  );
}

PresentationList.meta = {
  name: "presentation-list",
  parts: ["root", "item"],
} as const;
