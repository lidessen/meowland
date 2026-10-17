import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { choiceGroupContract } from "../../components/choice-group";

export const choiceGroupStyles = css`
  ${partSelector(choiceGroupContract, "root")} {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/1.5 ${uiTokens.font};
  }
  ${partSelector(choiceGroupContract, "legend")} {
    margin-bottom: ${uiTokens.spaceGroup};
    padding: 0;
    font-weight: 500;
  }
  :where(${partSelector(choiceGroupContract, "legend")}[data-hidden="true"]) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ${partSelector(choiceGroupContract, "options")} {
    display: grid;
    gap: 1px;
  }
  ${partSelector(choiceGroupContract, "option")} {
    display: flex;
    align-items: flex-start;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
    box-sizing: border-box;
    min-height: 40px;
    padding: 8px 12px 8px 8px;
    border: 1px solid transparent;
    border-radius: ${uiTokens.controlRadius};
    cursor: pointer;
    transition:
      background-color ${uiTokens.durationResponse} ${uiTokens.ease},
      border-color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  :where(${partSelector(choiceGroupContract, "option")}:hover:not(:has(input:disabled))) {
    background: ${uiTokens.hover};
  }
  :where(${partSelector(choiceGroupContract, "option")}:has(input:checked)) {
    border-color: ${uiTokens.border};
    background: ${uiTokens.hover};
  }
  :where(${partSelector(choiceGroupContract, "option")}:has(input:focus-visible)) {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  :where(${partSelector(choiceGroupContract, "option")}:has(input:disabled)) {
    color: ${uiTokens.subtleForeground};
    cursor: not-allowed;
  }
  ${partSelector(choiceGroupContract, "input")}:disabled {
    opacity: 0.5;
  }
  ${partSelector(choiceGroupContract, "input")} {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    margin: 3px 0 0;
    accent-color: ${uiTokens.foreground};
  }
  ${partSelector(choiceGroupContract, "content")} {
    display: grid;
    gap: 3px;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${partSelector(choiceGroupContract, "label")} {
    font-weight: 500;
    line-height: 24px;
  }
  ${partSelector(choiceGroupContract, "description")} {
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontBody};
    line-height: 24px;
  }
`;
