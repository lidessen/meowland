import { css, partSelector } from "meowcss/meowjsx";
import { pillContract } from "../../components/pill";
import { uiTokens } from "../tokens";

export const pillStyles = css`
  ${partSelector(pillContract, "root")} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 24px;
    box-sizing: border-box;
    padding: 0 8px;
    border: 0;
    border-radius: 999px;
    corner-shape: round;
    font: 12px/18px ${uiTokens.font};
    color: ${uiTokens.mutedForeground};
    background: ${uiTokens.surfaceMuted};
    white-space: nowrap;
  }
  button${partSelector(pillContract, "root")} {
    cursor: pointer;
  }
  button${partSelector(pillContract, "root")}:hover:not(:disabled) {
    background: ${uiTokens.hover};
  }
  ${partSelector(pillContract, "root")}[data-active="true"] {
    color: ${uiTokens.foreground};
    background: ${uiTokens.hover};
    box-shadow: inset 0 0 0 1px ${uiTokens.border};
  }
  button${partSelector(pillContract, "root")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  button${partSelector(pillContract, "root")}:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;
