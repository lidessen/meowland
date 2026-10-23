import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { choiceSelectContract } from "../../components/choice-select";
import { popoverContract } from "../../components/popover";

export const choiceSelectStyles = css`
  ${partSelector(choiceSelectContract, "root")} {
    position: relative;
    min-width: 0;
  }
  /* Surface, height and states come from the shared field surface. */
  ${partSelector(choiceSelectContract, "trigger")} {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    /* The chevron sits where the native Select draws its own. */
    padding: 0 10px 0 ${uiTokens.control.fieldInset};
    text-align: start;
    cursor: pointer;
  }
  ${partSelector(choiceSelectContract, "value")} {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${partSelector(choiceSelectContract, "indicator")} {
    display: flex;
    color: ${uiTokens.ink.secondary};
  }
  ${partSelector(choiceSelectContract, "indicator")} svg {
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
  }
  ${partSelector(popoverContract, "panel")}:has(> ${partSelector(choiceSelectContract, "list")}) {
    padding: 6px;
  }
  ${partSelector(choiceSelectContract, "list")} {
    display: grid;
    gap: 0;
  }
  ${partSelector(choiceSelectContract, "search")} {
    box-sizing: border-box;
    width: 100%;
    min-height: 32px;
    padding: 4px 8px;
    margin-bottom: 4px;
    border: 1px solid ${uiTokens.line.control};
    border-radius: ${uiTokens.radius.lg};
    background: ${uiTokens.surface.field};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body}/22px ${uiTokens.type.sans};
  }
  ${partSelector(choiceSelectContract, "search")}:focus-visible {
    border-color: ${uiTokens.state.focus};
    outline: none;
  }
  ${partSelector(choiceSelectContract, "search")}::placeholder {
    color: ${uiTokens.ink.secondary};
  }
  ${partSelector(choiceSelectContract, "empty")} {
    margin: 0;
    padding: ${uiTokens.space.section} ${uiTokens.control.inset};
    color: ${uiTokens.ink.secondary};
  }
  ${partSelector(choiceSelectContract, "option")}[hidden],
  ${partSelector(choiceSelectContract, "group")}[hidden],
  ${partSelector(choiceSelectContract, "empty")}[hidden] {
    display: none;
  }
  /* Group labels and separators match Menu: small uppercase heading, full-bleed band. */
  ${partSelector(choiceSelectContract, "group")} {
    padding: 8px 10px 4px;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.micro};
    font-weight: 500;
    letter-spacing: ${uiTokens.type.trackingCaps};
    text-transform: uppercase;
  }
  ${partSelector(choiceSelectContract, "group")}:not(:first-child) {
    border-top: 1px solid ${uiTokens.line.divider};
    margin: 4px -6px 0;
    padding-inline: 16px;
  }
  ${partSelector(choiceSelectContract, "option")} {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    width: 100%;
    min-height: 32px;
    padding: 6px 10px;
    border: 0;
    border-radius: ${uiTokens.radius.md};
    background: transparent;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body}/20px ${uiTokens.type.sans};
    text-align: start;
    cursor: pointer;
    overflow-wrap: anywhere;
  }
  ${partSelector(choiceSelectContract, "option")}::after {
    content: "";
    width: 12px;
    flex: 0 0 12px;
  }
  ${partSelector(choiceSelectContract, "option")}[aria-selected="true"]::after {
    content: "✓";
  }
  ${partSelector(choiceSelectContract, "option")}[aria-selected="true"] {
    font-weight: 400;
  }
  ${partSelector(choiceSelectContract, "option")}:focus {
    background: ${uiTokens.state.hover};
    outline: none;
  }
  ${partSelector(choiceSelectContract, "option")}:disabled {
    color: ${uiTokens.ink.tertiary};
    cursor: not-allowed;
  }
  ${partSelector(choiceSelectContract, "native")} {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ${partSelector(choiceSelectContract, "validation")} {
    display: block;
    margin-top: ${uiTokens.space.group};
    color: ${uiTokens.status.danger};
    font-size: ${uiTokens.type.caption};
  }
  ${partSelector(choiceSelectContract, "validation")}:empty {
    display: none;
  }
  @media (hover: hover) {
    ${partSelector(choiceSelectContract, "trigger")}:hover:not(:disabled):not([aria-invalid="true"]) {
      border-color: ${uiTokens.ink.secondary};
    }
    ${partSelector(choiceSelectContract, "option")}:hover:not(:disabled) {
      background: ${uiTokens.state.hover};
    }
  }
  @media (pointer: coarse) {
    ${partSelector(choiceSelectContract, "trigger")},
    ${partSelector(choiceSelectContract, "search")},
    ${partSelector(choiceSelectContract, "option")} {
      min-height: 44px;
      /* iOS zooms into a text control below 16px. */
      font-size: 16px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(choiceSelectContract, "trigger")} {
      transition: none;
    }
  }
`;
