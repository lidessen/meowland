import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";
import { choiceGroupContract } from "../../components/choice-group";

export const choiceGroupStyles = css`
  ${partSelector(choiceGroupContract, "root")} {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  ${partSelector(choiceGroupContract, "legend")} {
    margin-bottom: ${uiTokens.space.group};
    padding: 0;
    font-weight: ${uiTokens.type.weight.medium};
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
    gap: ${uiTokens.space.group};
    min-width: 0;
    box-sizing: border-box;
    min-height: 40px;
    padding: 8px 12px 8px 8px;
    border: 1px solid transparent;
    border-radius: ${uiTokens.radius.lg};
    cursor: pointer;
    transition:
      background-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      border-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  :where(${partSelector(choiceGroupContract, "option")}:hover:not(:has(input:disabled))) {
    background: ${uiTokens.state.hover};
  }
  /* The chosen option is the current selection, so it takes the accent. */
  :where(${partSelector(choiceGroupContract, "option")}:has(input:checked)) {
    border-color: ${uiTokens.accent.line};
    background: ${uiTokens.accent.selected};
  }
  :where(${partSelector(choiceGroupContract, "option")}:has(input:focus-visible)) {
    ${focusRing()}
  }
  :where(${partSelector(choiceGroupContract, "option")}:has(input:disabled)) {
    color: ${uiTokens.ink.tertiary};
    cursor: not-allowed;
  }
  ${partSelector(choiceGroupContract, "input")}:disabled {
    opacity: 0.5;
  }
  ${partSelector(choiceGroupContract, "input")} {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    margin: 4px 0 0;
    accent-color: ${uiTokens.ink.primary};
  }
  ${partSelector(choiceGroupContract, "content")} {
    display: grid;
    gap: 4px;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${partSelector(choiceGroupContract, "label")} {
    font-weight: ${uiTokens.type.weight.medium};
    line-height: ${uiTokens.type.line.reading};
  }
  ${partSelector(choiceGroupContract, "description")} {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.line.reading};
  }
`;
