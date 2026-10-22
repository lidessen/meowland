import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { hoverCardContract } from "../../components/hover-card";
import { popoverContract } from "../../components/popover";

export const hoverCardStyles = css`
  ${partSelector(hoverCardContract, "root")} {
    display: block;
    min-width: 0;
  }
  ${partSelector(popoverContract, "panel")}:has(> ${partSelector(hoverCardContract, "content")}) {
    padding: 0;
    width: 244px;
    background: ${uiTokens.tooltipSurface};
    color: ${uiTokens.toastForeground};
    backdrop-filter: none;
  }
  ${partSelector(popoverContract, "panel")}:has(> ${partSelector(hoverCardContract, "content")}[data-variant="preview"]) {
    background: ${uiTokens.surface};
    color: ${uiTokens.foreground};
  }
  ${partSelector(hoverCardContract, "content")} {
    position: relative;
    padding: 12px 16px;
    max-height: 420px;
    overflow: auto;
    overflow-wrap: anywhere;
  }
  ${partSelector(hoverCardContract, "content")}[data-variant="preview"] {
    padding: 0;
    max-height: min(420px, calc(100dvh - 32px));
  }
  ${partSelector(hoverCardContract, "content")}[role="button"] {
    cursor: pointer;
  }
  ${partSelector(hoverCardContract, "content")} a {
    color: inherit;
    text-underline-offset: 3px;
  }
  ${partSelector(hoverCardContract, "content")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: -2px;
    border-radius: ${uiTokens.radiusSmall};
  }
  ${partSelector(hoverCardContract, "feedback")} {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 8px;
    border-radius: inherit;
    background: ${uiTokens.tooltipSurface};
    pointer-events: none;
    color: ${uiTokens.toastForeground};
    font: ${uiTokens.fontBody}/20px ${uiTokens.font};
  }
  ${partSelector(hoverCardContract, "feedback")}:empty {
    display: none;
  }
`;
