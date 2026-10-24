import { h, type Child, type Props, type Context } from "meowjsx";

export interface DialogHeaderProps extends Props {
  title: Child;
  eyebrow?: Child;
  description?: Child;
  actions?: Child;
  titleId?: string;
  descriptionId?: string;
  className?: Props["className"];
}

/** The title block of a dialog: an optional eyebrow, the title, a description and actions. */
export function DialogHeader(
  {
    title,
    eyebrow,
    description,
    actions,
    titleId,
    descriptionId,
    className,
    ref,
  }: DialogHeaderProps,
  context: Context<typeof DialogHeader>,
) {
  return (
    <header className={className} ref={[context.parts.root, ref]}>
      <div ref={context.parts.identity}>
        {eyebrow ? <span ref={context.parts.eyebrow}>{eyebrow}</span> : null}
        <h2 id={titleId} ref={context.parts.title}>
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} ref={context.parts.description}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div ref={context.parts.actions}>{actions}</div> : null}
    </header>
  );
}
DialogHeader.meta = {
  name: "dialog-header",
  parts: ["root", "identity", "eyebrow", "title", "description", "actions"],
} as const;
