import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { popoverContract } from "../../components/popover";
import { menuContract } from "../../components/menu";

export const popoverStyles = css`
  ${partSelector(popoverContract, "root")} {
    min-width: 0;
  }
  ${partSelector(popoverContract, "panel")} {
    box-sizing: border-box;
    width: 300px;
    padding: 8px;
    border: 0;
    border-radius: ${uiTokens.radius.xl};
    color: ${uiTokens.ink.primary};
    /* Solid, as in Grok and Mobbin: depth comes from the shadow, not translucency. */
    background: ${uiTokens.surface.overlay};
    box-shadow: ${uiTokens.shadow.float};
    font: ${uiTokens.type.body}/${uiTokens.type.leading} ${uiTokens.type.sans};
    transform-origin: top center;
  }
  ${partSelector(popoverContract, "panel")}:has(> ${partSelector(menuContract, "root")}) {
    width: max-content;
    min-width: 144px;
    max-width: min(360px, calc(100vw - 24px));
    padding: 6px;
  }
  ${partSelector(popoverContract, "panel")}[data-side="top"] {
    transform-origin: bottom center;
  }
  ${partSelector(popoverContract, "panel")}:popover-open {
    animation: ui-popover-enter ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  @keyframes ui-popover-enter {
    from {
      opacity: 0;
      transform: translateY(3px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(popoverContract, "panel")}:popover-open {
      animation: none;
    }
  }
`;
