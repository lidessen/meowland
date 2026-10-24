import { h, type Context, type Child, type Props } from "meowjsx";

export interface ChatHeaderProps extends Props {
  eyebrow?: string;
  title: string;
  description?: Child;
  status?: Child;
  actions?: Child;
  className?: Props["className"];
}

/** The top of a conversation: its title, status and actions. */
export function ChatHeader(
  { eyebrow, title, description, status, actions, className, ref, ...props }: ChatHeaderProps,
  context: Context<typeof ChatHeader>,
) {
  const parts = context.parts;
  return (
    <header {...props} className={className} ref={[parts.root, ref]}>
      <div ref={parts.identity}>
        {eyebrow ? <span ref={parts.eyebrow}>{eyebrow}</span> : null}
        <h2 ref={parts.title}>{title}</h2>
        {description ? <p ref={parts.description}>{description}</p> : null}
      </div>
      {status || actions ? (
        <div ref={parts.controls}>
          {status ? <div ref={parts.status}>{status}</div> : null}
          {actions ? <div ref={parts.actions}>{actions}</div> : null}
        </div>
      ) : null}
    </header>
  );
}

ChatHeader.meta = {
  name: "chat-header",
  parts: ["root", "identity", "eyebrow", "title", "description", "controls", "status", "actions"],
} as const;
