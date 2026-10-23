// An interactive host row: the interactive() recipe supplies hover, press, focus and disabled.
import {
  defineComponent,
  isSignal,
  mapSignal,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { css, partSelector } from "meowcss/meowjsx";
import { interactive, text, uiTokens } from "meowtail/theme";

export const listRowContract = {
  name: "app-list-row",
  parts: ["root", "leading", "title", "detail", "trailing"],
} as const satisfies ComponentContract;

export interface ListRowProps extends Props {
  title: string;
  detail?: string;
  leading?: Child;
  trailing?: Child;
  /** The row the reader is on; controlled by the host. */
  current?: MaybeSignal<boolean>;
  disabled?: MaybeSignal<boolean>;
  onSelect?: () => void;
  className?: string;
}

export const ListRow = defineComponent<
  ListRowProps,
  typeof listRowContract.name,
  (typeof listRowContract.parts)[number]
>(
  listRowContract,
  (
    { title, detail, leading, trailing, current = false, disabled, onSelect, className, ...props },
    context,
  ) =>
    context.part(
      "root",
      "button",
      {
        ...props,
        type: "button",
        className,
        disabled,
        "aria-current": isSignal(current)
          ? mapSignal(current, (value) => (value ? "true" : undefined))
          : current
            ? "true"
            : undefined,
        onClick: () => onSelect?.(),
      },
      leading ? context.part("leading", "span", null, leading) : null,
      context.part("title", "span", null, title),
      detail ? context.part("detail", "span", null, detail) : null,
      trailing ? context.part("trailing", "span", null, trailing) : null,
    ),
);

const part = (name: (typeof listRowContract.parts)[number]) => partSelector(listRowContract, name);

export const listRowStyles = css`
  ${part("root")} {
    ${text("body")}
    ${interactive({ on: "flat" })}
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
  ${part("root")}[aria-current="true"] {
    background: ${uiTokens.accent.selected};
  }
  ${part("leading")} {
    grid-area: leading;
    display: grid;
    color: ${uiTokens.ink.secondary};
  }
  ${part("title")} {
    grid-area: title;
    font-weight: ${uiTokens.type.weight.medium};
    overflow-wrap: anywhere;
  }
  ${part("detail")} {
    ${text("caption")}
    grid-area: detail;
  }
  ${part("trailing")} {
    grid-area: trailing;
    color: ${uiTokens.ink.tertiary};
  }
`;
