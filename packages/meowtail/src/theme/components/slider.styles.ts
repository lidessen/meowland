import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { accentTokens, lineTokens } from "../palette";
import { sliderContract } from "../../components/slider";

const root = partSelector(sliderContract, "root");
const control = partSelector(sliderContract, "control");
const track = partSelector(sliderContract, "track");
const thumb = partSelector(sliderContract, "thumb");
const value = partSelector(sliderContract, "value");
const fill = `linear-gradient(to right, ${accentTokens.base} 0%, ${accentTokens.base} var(--slider-fill, 0%), ${uiTokens.surfaceMuted} var(--slider-fill, 0%), ${uiTokens.surfaceMuted} 100%)`;
const mutedFill = `linear-gradient(to right, ${uiTokens.mutedForeground} 0%, ${uiTokens.mutedForeground} var(--slider-fill, 0%), ${uiTokens.surfaceMuted} var(--slider-fill, 0%), ${uiTokens.surfaceMuted} 100%)`;
const thumbShadow = "0 1px 2px rgb(0 0 0 / 16%)";
const thumbShadowHover = "0 1px 3px rgb(0 0 0 / 22%)";

export const sliderStyles = css`
  ${root} {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: ${uiTokens.spaceGroup};
    width: 16rem;
    max-width: 100%;
    min-width: 0;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontCaption}/1 ${uiTokens.font};
  }
  ${control} {
    grid-column: 1;
    grid-row: 1;
    z-index: 1;
    width: 100%;
    min-width: 0;
    height: ${uiTokens.controlHeight};
    margin: 0;
    opacity: 0;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }
  ${track} {
    grid-column: 1;
    grid-row: 1;
    position: relative;
    height: 6px;
    overflow: visible;
    border-radius: 999px;
    corner-shape: round;
    background: ${fill};
    pointer-events: none;
  }
  ${thumb} {
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: clamp(0px, calc(var(--slider-fill, 0%) - 8px), calc(100% - 16px));
    width: 16px;
    height: 16px;
    margin-top: -8px;
    border: ${lineTokens.width} solid ${lineTokens.edge};
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.switchThumb};
    box-shadow: ${thumbShadow};
    transition: box-shadow ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${control}:focus-visible {
    outline: none;
  }
  ${root}:has(${control}:focus-visible) ${thumb} {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  @media (hover: hover) {
    ${root}:has(${control}:hover:not(:disabled)) ${thumb} {
      box-shadow: ${thumbShadowHover};
    }
  }
  ${root}:has(${control}:active:not(:disabled)) ${thumb} {
    box-shadow: 0 1px 1px rgb(0 0 0 / 14%);
  }
  ${root}:has(${control}:disabled) {
    color: ${uiTokens.subtleForeground};
  }
  ${root}:has(${control}:disabled) ${track} {
    background: ${mutedFill};
  }
  ${root}:has(${control}:disabled) ${thumb} {
    box-shadow: none;
  }
  ${control}:disabled {
    cursor: not-allowed;
  }
  ${value} {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    grid-column: 2;
    grid-row: 1;
    box-sizing: border-box;
    height: ${uiTokens.controlHeight};
    margin: 0;
    padding: 0;
    min-width: 2.5ch;
    color: ${uiTokens.mutedForeground};
    font-variant-numeric: tabular-nums;
    line-height: 1;
    text-align: end;
  }
  @media (prefers-reduced-motion: reduce) {
    ${thumb} {
      transition: none;
    }
  }
  @media (forced-colors: active) {
    ${track},
    ${thumb} {
      display: none;
    }
    ${control} {
      opacity: 1;
      appearance: auto;
    }
  }
`;
