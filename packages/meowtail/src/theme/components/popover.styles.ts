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
    border-radius: ${uiTokens.radiusLarge};
    color: ${uiTokens.foreground};
    background: ${uiTokens.menuSurface};
    backdrop-filter: ${uiTokens.menuBlur};
    box-shadow: ${uiTokens.shadowPanel};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
    transform-origin: top center;
  }
  @media (prefers-reduced-transparency: reduce) {
    ${partSelector(popoverContract, "panel")} {
      background: ${uiTokens.surface};
      backdrop-filter: none;
    }
  }
  ${partSelector(popoverContract, "panel")}:has(> ${partSelector(menuContract, "root")}) {
    width: max-content;
    min-width: 144px;
    max-width: min(360px, calc(100vw - 24px));
    padding: 4px;
  }
  ${partSelector(popoverContract, "panel")}[data-side="top"] {
    transform-origin: bottom center;
  }
  ${partSelector(popoverContract, "panel")}:popover-open {
    animation: ui-popover-enter 140ms ${uiTokens.ease};
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
