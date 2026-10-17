import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { choiceSelectContract } from "../../components/choice-select";
import { popoverContract } from "../../components/popover";

export const choiceSelectStyles = css`
  ${partSelector(choiceSelectContract, "root")} {
    position: relative;
    min-width: 0;
  }
  ${partSelector(choiceSelectContract, "trigger")} {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    min-width: 0;
    min-height: ${uiTokens.controlHeight};
    padding: 0 ${uiTokens.controlPaddingInline};
    border: 0.5px solid ${uiTokens.border};
    border-radius: ${uiTokens.controlRadius};
    background: ${uiTokens.inputSurface};
    color: ${uiTokens.foreground};
    box-shadow: ${uiTokens.shadowControl};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
    text-align: start;
    cursor: pointer;
    transition: border-color ${uiTokens.durationResponse} ${uiTokens.ease};
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
  ${partSelector(choiceSelectContract, "trigger")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  ${partSelector(choiceSelectContract, "trigger")}[aria-expanded="true"] {
    border-color: ${uiTokens.focus};
  }
  ${partSelector(choiceSelectContract, "trigger")}[aria-invalid="true"] {
    border-color: ${uiTokens.danger};
  }
  ${partSelector(choiceSelectContract, "trigger")}:disabled {
    color: ${uiTokens.subtleForeground};
    background: ${uiTokens.surfaceMuted};
    box-shadow: none;
    cursor: not-allowed;
  }
  ${partSelector(popoverContract, "panel")}:has(> ${partSelector(choiceSelectContract, "list")}) {
    padding: 4px;
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
    border: 0.5px solid ${uiTokens.border};
    border-radius: ${uiTokens.controlRadius};
    background: ${uiTokens.inputSurface};
    color: ${uiTokens.foreground};
    font: 14px/22px ${uiTokens.font};
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
  ${partSelector(choiceSelectContract, "group")} {
    padding: 6px 8px;
    color: ${uiTokens.mutedForeground};
    font-size: 11px;
  }
  ${partSelector(choiceSelectContract, "group")}:not(:first-child) {
    border-top: 0.5px solid ${uiTokens.border};
    margin-top: 3px;
  }
  ${partSelector(choiceSelectContract, "option")} {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    width: 100%;
    min-height: 34px;
    padding: 6px calc(${uiTokens.controlPaddingInline} / 2);
    border: 0;
    border-radius: ${uiTokens.controlRadius};
    background: transparent;
    color: ${uiTokens.foreground};
    font: 13px/20px ${uiTokens.font};
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
      font-size: 16px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(choiceSelectContract, "trigger")} {
      transition: none;
    }
  }
`;
