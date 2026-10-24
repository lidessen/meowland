import { type Child, type Props, type Context, h } from "meowjsx";

export interface DescriptionListProps extends Props {
  className?: Props["className"];
}

/** Related terms and values share a natural label column within the available width. */
export function DescriptionList(
  { children, ...props }: DescriptionListProps,
  context: Context<typeof DescriptionList>,
) {
  return (
    <dl {...props} ref={[context.parts.root, props.ref]}>
      {children}
    </dl>
  );
}
DescriptionList.meta = { name: "description-list", parts: ["root"] } as const;

export interface DescriptionItemProps extends Props {
  term: Child;
  className?: Props["className"];
}

/** A native description group; its value can compose text and existing layout components. */
export function DescriptionItem(
  { term, children, ...props }: DescriptionItemProps,
  context: Context<typeof DescriptionItem>,
) {
  return (
    <div {...props} ref={[context.parts.root, props.ref]}>
      <dt ref={[context.parts.term]}>{term}</dt>
      <dd ref={[context.parts.value]}>{children}</dd>
    </div>
  );
}
DescriptionItem.meta = { name: "description-item", parts: ["root", "term", "value"] } as const;
