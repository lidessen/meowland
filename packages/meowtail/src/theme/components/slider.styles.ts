import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { sliderContract } from "../../components/slider";

const root = partSelector(sliderContract, "root");
const control = partSelector(sliderContract, "control");
const track = partSelector(sliderContract, "track");
const thumb = partSelector(sliderContract, "thumb");
const value = partSelector(sliderContract, "value");
const fill = `linear-gradient(to right, ${uiTokens.accent.base} 0%, ${uiTokens.accent.base} var(--slider-fill, 0%), ${uiTokens.surface.fill} var(--slider-fill, 0%), ${uiTokens.surface.fill} 100%)`;
const mutedFill = `linear-gradient(to right, ${uiTokens.ink.secondary} 0%, ${uiTokens.ink.secondary} var(--slider-fill, 0%), ${uiTokens.surface.fill} var(--slider-fill, 0%), ${uiTokens.surface.fill} 100%)`;

export const sliderStyles = css`
  ${root} {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: ${uiTokens.space.group};
    width: 16rem;
    max-width: 100%;
    min-width: 0;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.caption}/1 ${uiTokens.type.sans};
  }
  ${control} {
    grid-column: 1;
    grid-row: 1;
    z-index: 1;
    width: 100%;
    min-width: 0;
    height: ${uiTokens.control.regular};
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
    border-radius: ${uiTokens.radius.full};
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
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.control.knob};
    box-shadow: ${uiTokens.shadow.knob};
    transition: box-shadow ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${control}:focus-visible {
    outline: none;
  }
  @media (hover: hover) {
    ${root}:has(${control}:hover:not(:disabled):not(:focus-visible)) ${thumb} {
      box-shadow: ${uiTokens.shadow.knob};
    }
  }
  ${root}:has(${control}:active:not(:disabled):not(:focus-visible)) ${thumb} {
    box-shadow: none;
  }
  /* Offset outline is transparent, so the track would show through the gap.
     An opaque halo keeps the 2px spacing of Button/Switch while covering the
     fill. Hosts on a painted surface set --meowui-focus-halo to that surface. */
  ${root}:has(${control}:focus-visible) ${thumb} {
    outline: none;
    box-shadow:
      0 0 0 2px var(--meowui-focus-halo, ${uiTokens.surface.knockout}),
      0 0 0 4px ${uiTokens.state.focus};
  }
  ${root}:has(${control}:disabled) {
    color: ${uiTokens.ink.tertiary};
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
    height: ${uiTokens.control.regular};
    margin: 0;
    padding: 0;
    min-width: 2.5ch;
    color: ${uiTokens.ink.secondary};
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
