import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { numberInputContract } from "../../components/number-input";

const root = partSelector(numberInputContract, "root");
const control = partSelector(numberInputContract, "control");
const stepper = `:where(${partSelector(numberInputContract, "decrement")}, ${partSelector(numberInputContract, "increment")})`;

export const numberInputStyles = css`
  /* Surface, height and states come from the shared field surface. The
     steppers are compact buttons inset by the remaining height. */
  ${root} {
    display: inline-flex;
    align-items: center;
    width: max-content;
    max-width: 100%;
    padding: 0 3px;
  }
  ${control} {
    box-sizing: border-box;
    flex: 0 0 auto;
    width: 4.5rem;
    min-width: 0;
    align-self: stretch;
    padding: 0 2px;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-variant-numeric: tabular-nums;
    text-align: center;
    outline: none;
  }
  ${stepper} {
    appearance: none;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: ${uiTokens.controlSmall};
    height: ${uiTokens.controlSmall};
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: ${uiTokens.radiusSmall};
    background: transparent;
    color: ${uiTokens.mutedForeground};
    font: inherit;
    line-height: 0;
    cursor: pointer;
    transition:
      color ${uiTokens.durationResponse} ${uiTokens.ease},
      background-color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${stepper} svg {
    display: block;
    width: ${uiTokens.iconSize};
    height: ${uiTokens.iconSize};
  }
  @media (hover: hover) {
    ${stepper}:hover:not(:disabled) {
      color: ${uiTokens.foreground};
      background: ${uiTokens.hover};
    }
  }
  ${stepper}:active:not(:disabled) {
    background: ${uiTokens.active};
  }
  ${stepper}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  ${root}:has(${control}:disabled) ${stepper},
  ${stepper}:disabled {
    cursor: not-allowed;
    color: inherit;
  }
  @media (prefers-reduced-motion: reduce) {
    ${stepper} {
      transition: none;
    }
  }
`;
