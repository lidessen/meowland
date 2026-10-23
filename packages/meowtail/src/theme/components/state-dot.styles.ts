import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { stateDotContract } from "../../components/state-dot";

export const stateDotStyles = css`
  ${partSelector(stateDotContract, "root")} {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    border-radius: 50%;
    corner-shape: round;
    background: transparent;
    color: ${uiTokens.ink.tertiary};
  }
  ${partSelector(stateDotContract, "root")}[data-appearance="dot"]:not([data-state="ongoing"])::after {
    content: "";
    position: absolute;
    inset: 20%;
    border-radius: 50%;
    corner-shape: round;
    background: currentColor;
  }
  ${partSelector(stateDotContract, "root")}[data-state="idle"] {
    color: ${uiTokens.status.unknown};
  }
  ${partSelector(stateDotContract, "root")}[data-state="done"] {
    color: ${uiTokens.status.success};
  }
  ${partSelector(stateDotContract, "root")}[data-state="warning"] {
    color: ${uiTokens.status.warning};
  }
  ${partSelector(stateDotContract, "root")}[data-state="error"] {
    color: ${uiTokens.status.danger};
  }
  ${partSelector(stateDotContract, "root")}[data-state="ongoing"] {
    background: transparent;
  }
  ${partSelector(stateDotContract, "root")}[data-appearance="step"] {
    background: transparent;
    border: 1.5px solid ${uiTokens.ink.tertiary};
    box-sizing: border-box;
  }
  ${partSelector(stateDotContract, "root")}[data-appearance="step"]:is([data-state="done"], [data-state="error"]) {
    border-color: currentColor;
    background: currentColor;
  }
  ${partSelector(stateDotContract, "root")}[data-appearance="step"][data-state="warning"] {
    border-color: currentColor;
  }
  ${partSelector(stateDotContract, "root")}[data-appearance="step"][data-state="done"] > svg {
    color: ${uiTokens.action.onPrimary};
  }
  ${partSelector(stateDotContract, "motion")} {
    display: flex;
    animation: ui-state-dot-spin ${uiTokens.motion.loop} linear infinite;
  }
  @keyframes ui-state-dot-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(stateDotContract, "motion")} {
      animation: none;
    }
  }
`;
