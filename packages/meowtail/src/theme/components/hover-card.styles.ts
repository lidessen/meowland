import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";
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
    background: ${uiTokens.inverse.surface};
    color: ${uiTokens.inverse.ink};
    backdrop-filter: none;
  }
  ${partSelector(popoverContract, "panel")}:has(> ${partSelector(hoverCardContract, "content")}[data-variant="preview"]) {
    background: ${uiTokens.surface.overlay};
    color: ${uiTokens.ink.primary};
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
    ${focusRing({ inset: true })}
    border-radius: ${uiTokens.radius.md};
  }
  ${partSelector(hoverCardContract, "feedback")} {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 8px;
    border-radius: inherit;
    background: ${uiTokens.inverse.surface};
    pointer-events: none;
    color: ${uiTokens.inverse.ink};
    font: ${uiTokens.type.body}/20px ${uiTokens.type.sans};
  }
  ${partSelector(hoverCardContract, "feedback")}:empty {
    display: none;
  }
`;
