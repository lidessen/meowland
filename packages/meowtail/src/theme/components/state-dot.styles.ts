import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { StateDot } from "../../components/state-dot";
const stateDotPartRefs = parts<typeof StateDot>("state-dot");
export const stateDotStyles = css`
  ${stateDotPartRefs.root} {
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
  ${stateDotPartRefs.root}[data-appearance="dot"]:not([data-state="ongoing"])::after {
    content: "";
    position: absolute;
    inset: 20%;
    border-radius: 50%;
    corner-shape: round;
    background: currentColor;
  }
  ${stateDotPartRefs.root}[data-state="idle"] {
    color: ${uiTokens.status.unknown};
  }
  ${stateDotPartRefs.root}[data-state="done"] {
    color: ${uiTokens.status.success};
  }
  ${stateDotPartRefs.root}[data-state="warning"] {
    color: ${uiTokens.status.warning};
  }
  ${stateDotPartRefs.root}[data-state="error"] {
    color: ${uiTokens.status.danger};
  }
  ${stateDotPartRefs.root}[data-state="ongoing"] {
    background: transparent;
  }
  ${stateDotPartRefs.root}[data-appearance="step"] {
    background: transparent;
    border: 1.5px solid ${uiTokens.ink.tertiary};
    box-sizing: border-box;
  }
  ${stateDotPartRefs.root}[data-appearance="step"]:is([data-state="done"], [data-state="error"]) {
    border-color: currentColor;
    background: currentColor;
  }
  ${stateDotPartRefs.root}[data-appearance="step"][data-state="warning"] {
    border-color: currentColor;
  }
  ${stateDotPartRefs.root}[data-appearance="step"][data-state="done"] > svg {
    color: ${uiTokens.action.onPrimary};
  }
  ${stateDotPartRefs.motion} {
    display: flex;
    animation: ui-state-dot-spin ${uiTokens.motion.loop} linear infinite;
  }
  @keyframes ui-state-dot-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${stateDotPartRefs.motion} {
      animation: none;
    }
  }
`;
