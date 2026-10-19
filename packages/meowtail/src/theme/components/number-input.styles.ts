import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { numberInputContract } from "../../components/number-input";

const root = partSelector(numberInputContract, "root");
const control = partSelector(numberInputContract, "control");
const stepper = `${partSelector(numberInputContract, "decrement")}, ${partSelector(numberInputContract, "increment")}`;

export const numberInputStyles = css`
  ${root} {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    min-height: calc(${uiTokens.controlHeight} + 1px);
    border: 0.5px solid ${uiTokens.border};
    border-radius: ${uiTokens.controlRadius};
    background: ${uiTokens.inputSurface};
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/22px ${uiTokens.font};
    transition: border-color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${root}:focus-within {
    border-color: ${uiTokens.focus};
  }
  ${root}:has([aria-invalid="true"]) {
    border-color: ${uiTokens.danger};
  }
  ${root}:has(:disabled) {
    color: ${uiTokens.subtleForeground};
    border-color: ${uiTokens.borderFaint};
  }
  ${control} {
    box-sizing: border-box;
    min-width: 0;
    width: 5.5rem;
    flex: 1 1 auto;
    min-height: ${uiTokens.controlHeight};
    padding: 4px 2px;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-variant-numeric: tabular-nums;
    text-align: center;
    outline: none;
  }
  ${stepper} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: ${uiTokens.controlHeight};
    height: ${uiTokens.controlHeight};
    padding: 0;
    border: 0;
    background: transparent;
    color: ${uiTokens.mutedForeground};
    cursor: pointer;
  }
  ${stepper} svg {
    width: 14px;
    height: 14px;
  }
  ${stepper}:hover:not(:disabled) {
    color: ${uiTokens.foreground};
    background: ${uiTokens.hover};
  }
  ${stepper}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: -2px;
  }
  ${stepper}:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
  @media (prefers-reduced-motion: reduce) {
    ${root} {
      transition: none;
    }
  }
`;
