import { h, type Child, type Context, type Props } from "meowjsx";
import { Icon } from "../icons/icon";

export interface ChatProcessProps extends Props {
  label: string;
  icon?: Child;
  open?: boolean;
}

/** A collapsible row for work that happened between messages, with its details inside. */
export function ChatProcess(
  { label, icon, children, open = false, ref, ...props }: ChatProcessProps,
  context: Context<typeof ChatProcess>,
) {
  const parts = context.parts;
  return (
    <details
      {...props}
      open={open}
      data-process-icon={icon ? "custom" : undefined}
      ref={[parts.root, ref]}
    >
      <summary ref={parts.summary}>
        <span aria-hidden="true" ref={parts.icon}>
          {icon ?? <Icon name="chevron-right" />}
        </span>
        {icon ? (
          <span aria-hidden="true" ref={parts.expandedIcon}>
            <Icon name="chevron-up" />
          </span>
        ) : null}
        <span ref={parts.label}>{label}</span>
      </summary>
      <div ref={parts.body}>{children}</div>
    </details>
  );
}

ChatProcess.meta = {
  name: "chat-process",
  parts: ["root", "summary", "icon", "expandedIcon", "label", "body"],
} as const;
