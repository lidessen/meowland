import { type Child, type Props, type Context, h } from "meowjsx";

export interface ResourceCardProps extends Props {
  title: Child;
  /** What kind of thing it is, for example "Channel · Message card". */
  subtitle?: Child;
  icon?: Child;
  /** The state in words with its dot. */
  status?: Child;
  description?: Child;
  actions?: Child;
  /** The checkable technical identity, shown in monospace and low weight. */
  identity?: Child;
  /** "muted" is something present but not running: a dashed outline and quieter text. */
  tone?: "default" | "muted";
  className?: Props["className"];
}

/** One prepared capability on an overview page: what it is, whether it runs, what to do next. */
export function ResourceCard(
  {
    title,
    subtitle,
    icon,
    status,
    description,
    actions,
    identity,
    tone = "default",
    className,
    children,
    ...props
  }: ResourceCardProps,
  context: Context<typeof ResourceCard>,
) {
  return (
    <article
      {...props}
      className={className}
      data-tone={tone}
      ref={[context.parts.root, props.ref]}
    >
      <div ref={[context.parts.head]}>
        {icon ? (
          <span aria-hidden="true" ref={[context.parts.icon]}>
            {icon}
          </span>
        ) : null}
        <div ref={[context.parts.copy]}>
          <h3 ref={[context.parts.title]}>{title}</h3>
          {subtitle ? <span ref={[context.parts.subtitle]}>{subtitle}</span> : null}
        </div>
        {status ? <span ref={[context.parts.status]}>{status}</span> : null}
      </div>
      {description ? <p ref={[context.parts.description]}>{description}</p> : null}
      {children}
      {actions || identity ? (
        <div ref={[context.parts.actions]}>
          {actions}
          {identity ? <span ref={[context.parts.identity]}>{identity}</span> : null}
        </div>
      ) : null}
    </article>
  );
}
ResourceCard.meta = {
  name: "resource-card",
  parts: [
    "root",
    "head",
    "icon",
    "copy",
    "title",
    "subtitle",
    "status",
    "description",
    "actions",
    "identity",
  ],
} as const;
