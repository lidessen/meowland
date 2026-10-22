import { css, partSelector } from "meowcss/meowjsx";
import { chatTokens, uiTokens } from "../tokens";
import { chatReasoningContract } from "../../chat/reasoning";

const part = (name: (typeof chatReasoningContract.parts)[number]) =>
  partSelector(chatReasoningContract, name);

export const chatReasoningStyles = css`
  ${part("root")} {
    display: grid;
    min-width: 0;
    color: ${uiTokens.mutedForeground};
  }
  /* The same row as ChatProcess: a glyph box, then a one-line label. */
  ${part("summary")} {
    display: flex;
    align-items: center;
    gap: ${chatTokens.leadingGap};
    min-height: ${chatTokens.rowLine};
    width: fit-content;
    max-width: 100%;
    list-style: none;
    cursor: pointer;
    font-size: calc(${chatTokens.fontBody} - 1px);
    line-height: ${chatTokens.rowLine};
  }
  ${part("summary")}::-webkit-details-marker {
    display: none;
  }
  ${part("summary")}:hover {
    color: ${uiTokens.foreground};
  }
  ${part("summary")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
    border-radius: ${uiTokens.radiusSmall};
  }
  ${part("icon")} {
    display: grid;
    place-items: center;
    flex: none;
    width: ${uiTokens.iconSize};
    height: ${uiTokens.iconSize};
  }
  ${part("icon")} svg {
    width: 14px;
    height: 14px;
    transition: transform ${uiTokens.durationSettle} ${uiTokens.ease};
  }
  ${part("root")}[open] > ${part("summary")} ${part("icon")} svg {
    transform: rotate(90deg);
  }
  ${part("label")} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${part("body")} {
    display: grid;
    gap: ${uiTokens.spaceGroup};
    padding: 4px 0 2px calc(${uiTokens.iconSize} + ${chatTokens.leadingGap});
  }
  ${part("text")} {
    margin: 0;
    color: ${uiTokens.mutedForeground};
    font-size: calc(${chatTokens.fontBody} - 1px);
    line-height: 1.7;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  /* While the model works, only the newest lines show; older ones fade under the top edge.
     The body anchors its content to the bottom, so no script measures or scrolls it. */
  ${part("root")}[data-active="true"] > ${part("body")} {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: ${uiTokens.spaceGroup};
    max-height: calc(1.7em * 4);
    overflow: hidden;
    mask-image: linear-gradient(to bottom, transparent, black 45%);
  }
  @media (prefers-reduced-motion: reduce) {
    ${part("icon")} svg {
      transition: none;
    }
  }
`;
