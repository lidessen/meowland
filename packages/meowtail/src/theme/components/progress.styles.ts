import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { accentTokens } from "../palette";
import { progressContract } from "../../components/progress";

const root = partSelector(progressContract, "root");
const bar = partSelector(progressContract, "bar");
const native = `progress[data-meowui-part="progress/bar"]`;

export const progressStyles = css`
  ${root} {
    position: relative;
    display: block;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    height: 6px;
    overflow: hidden;
    border-radius: 999px;
    corner-shape: round;
    background: ${uiTokens.surfaceMuted};
  }
  ${bar} {
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: inherit;
    background: transparent;
    accent-color: ${accentTokens.base};
    vertical-align: middle;
  }
  ${native}::-webkit-progress-bar {
    background: ${uiTokens.surfaceMuted};
    border-radius: inherit;
  }
  ${native}::-webkit-progress-value {
    background: ${accentTokens.base};
    border-radius: inherit;
  }
  ${native}::-moz-progress-bar {
    background: ${accentTokens.base};
    border-radius: inherit;
  }
  ${native}:not([value]) {
    opacity: 0;
  }
  ${root}:has(${bar}:not([value]))::after {
    content: "";
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    width: 36%;
    border-radius: inherit;
    background: ${accentTokens.base};
    animation: ui-progress-indeterminate 1.2s ${uiTokens.ease} infinite;
  }
  @keyframes ui-progress-indeterminate {
    0% {
      inset-inline-start: -36%;
    }
    100% {
      inset-inline-start: 100%;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${root}:has(${bar}:not([value]))::after {
      animation: none;
      inset-inline-start: 32%;
    }
  }
`;
