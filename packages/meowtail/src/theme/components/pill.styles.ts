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
    border-radius: ${uiTokens.radius.full};
    corner-shape: round;
    font: ${uiTokens.type.caption}/18px ${uiTokens.type.sans};
    color: ${uiTokens.ink.secondary};
    background: ${uiTokens.surface.fill};
    white-space: nowrap;
  }
  button${partSelector(pillContract, "root")} {
    cursor: pointer;
  }
  button${partSelector(pillContract, "root")}:hover:not(:disabled) {
    background: ${uiTokens.state.hover};
  }
  /* An active filter is the current selection, so it takes the accent. */
  ${partSelector(pillContract, "root")}[data-active="true"] {
    color: ${uiTokens.accent.ink};
    background: ${uiTokens.accent.selected};
    box-shadow: inset 0 0 0 1px ${uiTokens.accent.line};
  }
  button${partSelector(pillContract, "root")}[data-active="true"]:hover:not(:disabled) {
    background: color-mix(in srgb, ${uiTokens.accent.base} 14%, ${uiTokens.accent.soft});
  }
  button${partSelector(pillContract, "root")}:focus-visible {
    outline: 2px solid ${uiTokens.state.focus};
    outline-offset: 2px;
  }
  button${partSelector(pillContract, "root")}:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;
