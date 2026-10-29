import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { ui } from "../utilities";
import type { TokenField } from "../../components/token-field";
const tokenField = parts<typeof TokenField>("token-field");
export const tokenFieldStyles = css`
  ${tokenField.root} {
    min-width: 0;
  }
  /* Surface, height and states come from the shared field surface; tokens sit inside its box. */
  ${tokenField.control} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    width: 100%;
    /* Three px around a 28px token keeps one row at the 36px control height. */
    padding: 3px;
    cursor: text;
  }
  ${tokenField.list} {
    display: contents;
    list-style: none;
  }
  ${tokenField.token} {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    min-width: 0;
    max-width: 100%;
    min-height: ${uiTokens.control.small};
    padding: 0 2px 0 8px;
    border-radius: ${uiTokens.radius.md};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
    cursor: default;
  }
  /* An unresolved token takes the danger edge; its name carries the reason. */
  ${tokenField.token}[data-invalid="true"] {
    box-shadow: inset 0 0 0 1px ${uiTokens.status.danger};
    color: ${uiTokens.status.danger};
  }
  ${tokenField.token}:has(${tokenField.remove}:focus-visible) {
    ${ui.focus.ring}
  }
  ${tokenField.label} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${tokenField.invalid} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ${tokenField.remove} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 20px;
    height: 20px;
    padding: 0;
    border: 0;
    border-radius: ${uiTokens.radius.sm};
    background: transparent;
    color: ${uiTokens.ink.secondary};
    cursor: pointer;
  }
  /* The token draws the ring; the button keeps only its press feedback. */
  ${tokenField.remove}:focus-visible {
    outline: none;
  }
  @media (hover: hover) {
    ${tokenField.remove}:hover:not(:disabled) {
      background: ${uiTokens.state.hover};
      color: ${uiTokens.ink.primary};
    }
  }
  ${tokenField.remove}:disabled {
    cursor: not-allowed;
  }
  ${tokenField.remove} svg {
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
  }
  ${tokenField.input} {
    flex: 1 1 96px;
    min-width: 96px;
    min-height: ${uiTokens.control.small};
    padding: 0 6px;
    border: 0;
    outline: none;
    background: transparent;
    color: inherit;
    font: inherit;
  }
  ${tokenField.input}::placeholder {
    color: ${uiTokens.ink.secondary};
  }
  ${tokenField.input}:disabled {
    cursor: not-allowed;
  }
`;
