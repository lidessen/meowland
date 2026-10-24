import { h, type Child, type Context, type Props } from "meowjsx";
import { isSignal, mapSignal, type MaybeSignal } from "meowjsx/signal";
import { css, parts } from "meowcss/meowjsx";
import { ui, uiTokens } from "meowtail/theme";

export interface ListRowProps extends Props {
  title: string;
  detail?: string;
  leading?: Child;
  trailing?: Child;
  /** The row the reader is on; controlled by the host. */
  current?: MaybeSignal<boolean>;
  disabled?: MaybeSignal<boolean>;
  onSelect?: () => void;
}

export function ListRow(
  {
    title,
    detail,
    leading,
    trailing,
    current = false,
    disabled,
    onSelect,
    className,
    ...props
  }: ListRowProps,
  context: Context<typeof ListRow>,
) {
  return (
    <button
      {...props}
      type="button"
      className={className}
      disabled={disabled}
      aria-current={
        isSignal(current)
          ? mapSignal(current, (value) => (value ? "true" : undefined))
          : current
            ? "true"
            : undefined
      }
      onClick={() => onSelect?.()}
      ref={context.parts.root}
    >
      {leading ? <span ref={context.parts.leading}>{leading}</span> : null}
      <span ref={context.parts.title}>{title}</span>
      {detail ? <span ref={context.parts.detail}>{detail}</span> : null}
      {trailing ? <span ref={context.parts.trailing}>{trailing}</span> : null}
    </button>
  );
}
ListRow.meta = {
  name: "app-list-row",
  parts: ["root", "leading", "title", "detail", "trailing"],
} as const;

const row = parts<typeof ListRow>("app-list-row");
export const listRowStyles = css`
  ${row.root} {
    ${ui.text.body}
    ${ui.interactive.flat}
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: "leading title trailing" "leading detail trailing";
    align-items: center;
    column-gap: 12px;
    width: 100%;
    min-height: ${uiTokens.control.large};
    padding: 6px ${uiTokens.space.group};
    border: 0;
    border-radius: ${uiTokens.radius.md};
    background: transparent;
    text-align: start;
  }
  ${row.root}[aria-current="true"] {
    background: ${uiTokens.accent.selected};
  }
  ${row.leading} {
    grid-area: leading;
    display: grid;
    color: ${uiTokens.ink.secondary};
  }
  ${row.title} {
    grid-area: title;
    font-weight: ${uiTokens.type.weight.medium};
    overflow-wrap: anywhere;
  }
  ${row.detail} {
    ${ui.text.caption}
    grid-area: detail;
  }
  ${row.trailing} {
    grid-area: trailing;
    color: ${uiTokens.ink.tertiary};
  }
`;
