import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { sliderContract } from "../../components/slider";

const root = partSelector(sliderContract, "root");
const control = partSelector(sliderContract, "control");
const value = partSelector(sliderContract, "value");

export const sliderStyles = css`
  ${root} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    width: 100%;
    min-width: 0;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontCaption}/20px ${uiTokens.font};
  }
  ${control} {
    flex: 1 1 8rem;
    min-width: 0;
    height: ${uiTokens.controlHeight};
    margin: 0;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }
  ${control}::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 999px;
    corner-shape: round;
    background: ${uiTokens.surfaceMuted};
  }
  ${control}::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    margin-top: -5px;
    border: 0;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.primary};
  }
  ${control}::-moz-range-track {
    height: 6px;
    border: 0;
    border-radius: 999px;
    background: ${uiTokens.surfaceMuted};
  }
  ${control}::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: 0;
    border-radius: 50%;
    background: ${uiTokens.primary};
  }
  ${control}:focus-visible {
    outline: none;
  }
  ${control}:focus-visible::-webkit-slider-thumb {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  ${control}:focus-visible::-moz-range-thumb {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  ${control}:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  ${value} {
    flex: 0 0 auto;
    min-width: 2.5ch;
    color: ${uiTokens.mutedForeground};
    font-variant-numeric: tabular-nums;
    text-align: end;
  }
  @media (forced-colors: active) {
    ${control} {
      appearance: auto;
    }
  }
`;
