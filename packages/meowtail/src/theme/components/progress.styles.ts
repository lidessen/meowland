import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { Progress } from "../../components/progress";
const progressPartRefs = parts<typeof Progress>("progress");
const root = progressPartRefs.root;
const bar = progressPartRefs.bar;
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
    border-radius: ${uiTokens.radius.full};
    corner-shape: round;
    background: ${uiTokens.surface.fill};
  }
  ${bar} {
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: inherit;
    background: transparent;
    accent-color: ${uiTokens.accent.base};
    vertical-align: middle;
  }
  ${native}::-webkit-progress-bar {
    background: ${uiTokens.surface.fill};
    border-radius: inherit;
  }
  ${native}::-webkit-progress-value {
    background: ${uiTokens.accent.base};
    border-radius: inherit;
  }
  ${native}::-moz-progress-bar {
    background: ${uiTokens.accent.base};
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
    background: ${uiTokens.accent.base};
    animation: ui-progress-indeterminate ${uiTokens.motion.loop} ${uiTokens.motion.ease} infinite;
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
