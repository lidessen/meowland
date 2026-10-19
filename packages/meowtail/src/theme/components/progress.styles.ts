import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { progressContract } from "../../components/progress";

export const progressStyles = css`
  ${partSelector(progressContract, "root")} {
    display: block;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    height: ${uiTokens.spaceGroup};
    overflow: hidden;
    border: 0;
    border-radius: 999px;
    corner-shape: round;
    background: ${uiTokens.surfaceMuted};
    accent-color: ${uiTokens.info};
    vertical-align: middle;
  }
  ${partSelector(progressContract, "root")}::-webkit-progress-bar {
    background: ${uiTokens.surfaceMuted};
    border-radius: inherit;
  }
  ${partSelector(progressContract, "root")}::-webkit-progress-value {
    background: ${uiTokens.info};
    border-radius: inherit;
  }
  ${partSelector(progressContract, "root")}::-moz-progress-bar {
    background: ${uiTokens.info};
    border-radius: inherit;
  }
  ${partSelector(progressContract, "root")}:not([value])::-webkit-progress-value {
    background: ${uiTokens.info};
    animation: ui-progress-indeterminate 1.2s ${uiTokens.ease} infinite;
  }
  ${partSelector(progressContract, "root")}:not([value])::-moz-progress-bar {
    background: ${uiTokens.info};
    animation: ui-progress-indeterminate 1.2s ${uiTokens.ease} infinite;
  }
  @keyframes ui-progress-indeterminate {
    0% {
      transform: translateX(-60%);
    }
    100% {
      transform: translateX(160%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(progressContract, "root")}:not([value])::-webkit-progress-value,
    ${partSelector(progressContract, "root")}:not([value])::-moz-progress-bar {
      animation: none;
    }
  }
`;
