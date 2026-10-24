import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { Menu } from "../../components/menu";
import type { Popover } from "../../components/popover";
const menuPartRefs = parts<typeof Menu>("menu");
const popoverPartRefs = parts<typeof Popover>("popover");
export const popoverStyles = css`
  ${popoverPartRefs.root} {
    min-width: 0;
  }
  ${popoverPartRefs.panel} {
    box-sizing: border-box;
    width: 300px;
    padding: 8px;
    border: 0;
    border-radius: ${uiTokens.radius.xl};
    color: ${uiTokens.ink.primary};
    /* Solid, as in Grok and Mobbin: depth comes from the shadow, not translucency. */
    background: ${uiTokens.surface.overlay};
    box-shadow: ${uiTokens.shadow.float};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
    transform-origin: top center;
  }
  ${popoverPartRefs.panel}:has(> ${menuPartRefs.root}) {
    width: max-content;
    min-width: 144px;
    max-width: min(360px, calc(100vw - 24px));
    padding: 6px;
  }
  ${popoverPartRefs.panel}[data-side="top"] {
    transform-origin: bottom center;
  }
  ${popoverPartRefs.panel}:popover-open {
    animation: ui-popover-enter ${uiTokens.motion.settle} ${uiTokens.motion.enter};
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
    ${popoverPartRefs.panel}:popover-open {
      animation: none;
    }
  }
`;
