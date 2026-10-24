import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { ChoiceGroup } from "../../components/choice-group";
import { ui } from "../utilities";
const choiceGroupPartRefs = parts<typeof ChoiceGroup>("choice-group");
export const choiceGroupStyles = css`
  ${choiceGroupPartRefs.root} {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  ${choiceGroupPartRefs.legend} {
    margin-bottom: ${uiTokens.space.group};
    padding: 0;
    font-weight: ${uiTokens.type.weight.medium};
  }
  :where(${choiceGroupPartRefs.legend}[data-hidden="true"]) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ${choiceGroupPartRefs.options} {
    display: grid;
    gap: 1px;
  }
  ${choiceGroupPartRefs.option} {
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
  :where(${choiceGroupPartRefs.option}:hover:not(:has(input:disabled))) {
    background: ${uiTokens.state.hover};
  }
  /* The chosen option is the current selection, so it takes the accent. */
  :where(${choiceGroupPartRefs.option}:has(input:checked)) {
    border-color: ${uiTokens.accent.line};
    background: ${uiTokens.accent.selected};
  }
  :where(${choiceGroupPartRefs.option}:has(input:focus-visible)) {
    ${ui.focus.ring}
  }
  :where(${choiceGroupPartRefs.option}:has(input:disabled)) {
    color: ${uiTokens.ink.tertiary};
    cursor: not-allowed;
  }
  ${choiceGroupPartRefs.input}:disabled {
    opacity: 0.5;
  }
  ${choiceGroupPartRefs.input} {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    margin: 4px 0 0;
    accent-color: ${uiTokens.ink.primary};
  }
  ${choiceGroupPartRefs.content} {
    display: grid;
    gap: 4px;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${choiceGroupPartRefs.label} {
    font-weight: ${uiTokens.type.weight.medium};
    line-height: ${uiTokens.type.line.reading};
  }
  ${choiceGroupPartRefs.description} {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.line.reading};
  }
`;
