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
    padding: 0 10px 0 ${uiTokens.fieldPaddingInline};
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
    color: ${uiTokens.mutedForeground};
  }
  ${partSelector(choiceSelectContract, "indicator")} svg {
    width: 14px;
    height: 14px;
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
    padding: 5px 7px;
    margin-bottom: 3px;
    border: 1px solid ${uiTokens.border};
    border-radius: ${uiTokens.controlRadius};
    background: ${uiTokens.inputSurface};
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/22px ${uiTokens.font};
  }
  ${partSelector(choiceSelectContract, "search")}:focus-visible {
    border-color: ${uiTokens.focus};
    outline: none;
  }
  ${partSelector(choiceSelectContract, "search")}::placeholder {
    color: ${uiTokens.placeholder};
  }
  ${partSelector(choiceSelectContract, "empty")} {
    margin: 0;
    padding: ${uiTokens.spaceSection} ${uiTokens.controlPaddingInline};
    color: ${uiTokens.mutedForeground};
  }
  ${partSelector(choiceSelectContract, "option")}[hidden],
  ${partSelector(choiceSelectContract, "group")}[hidden],
  ${partSelector(choiceSelectContract, "empty")}[hidden] {
    display: none;
  }
  /* Group labels and separators match Menu: small uppercase heading, full-bleed band. */
  ${partSelector(choiceSelectContract, "group")} {
    padding: 8px 10px 4px;
    color: ${uiTokens.subtleForeground};
    font-size: ${uiTokens.fontMicro};
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  ${partSelector(choiceSelectContract, "group")}:not(:first-child) {
    border-top: 1px solid ${uiTokens.borderSoft};
    margin: 5px -6px 0;
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
    border-radius: ${uiTokens.radiusSmall};
    background: transparent;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/20px ${uiTokens.font};
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
    background: ${uiTokens.hover};
    outline: none;
  }
  ${partSelector(choiceSelectContract, "option")}:disabled {
    color: ${uiTokens.subtleForeground};
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
    margin-top: ${uiTokens.spaceGroup};
    color: ${uiTokens.danger};
    font-size: ${uiTokens.fontCaption};
  }
  ${partSelector(choiceSelectContract, "validation")}:empty {
    display: none;
  }
  @media (hover: hover) {
    ${partSelector(choiceSelectContract, "trigger")}:hover:not(:disabled):not([aria-invalid="true"]) {
      border-color: ${uiTokens.mutedForeground};
    }
    ${partSelector(choiceSelectContract, "option")}:hover:not(:disabled) {
      background: ${uiTokens.hover};
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
