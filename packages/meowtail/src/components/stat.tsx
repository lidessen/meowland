import { h, type Child, type Context, type Props } from "meowjsx";

export interface StatProps extends Props {
  /** What the figure counts, in sentence case: "Active runs". */
  label: Child;
  /** The figure itself. Pass "unknown" (or the host's word for it) when the value cannot be read. */
  value: Child;
  /** One supporting fact under the figure, such as its scope or when it was read. */
  detail?: Child;
  /** Makes the whole summary a link to the records it counts; routing stays with the host. */
  href?: string;
  className?: Props["className"];
}

/**
 * One summary figure: a short label, the figure, and an optional supporting fact. The figure is
 * the largest text in the block and is never colored; a state belongs in a Status beside it.
 * Hosts place several Stats in a Grid, a Card, or a toolbar strip.
 */
export function Stat(
  { label, value, detail, href, className, children, ref, ...props }: StatProps,
  context: Context<typeof Stat>,
) {
  const Tag = href !== undefined ? "a" : "div";
  return (
    <Tag {...props} href={href} className={className} ref={[context.parts.root, ref]}>
      <span ref={context.parts.label}>{label}</span>
      <span ref={context.parts.value}>{value}</span>
      {detail !== undefined && detail !== null && detail !== false ? (
        <span ref={context.parts.detail}>{detail}</span>
      ) : null}
      {children}
    </Tag>
  );
}
Stat.meta = { name: "stat", parts: ["root", "label", "value", "detail"] } as const;
