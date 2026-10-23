import { css, partSelector } from "meowcss/meowjsx";
import { drawerContract } from "../../components/drawer";
import { uiTokens } from "../tokens";
import { pageFrameContract } from "../../components/page-frame";

const root = partSelector(drawerContract, "root");
const panel = partSelector(drawerContract, "panel");

/** A start-edge drawer over a scrim. The dialog spans the screen so the scrim click is its own. */
export const drawerStyles = css`
  ${root} {
    position: fixed;
    inset: 0;
    width: 100%;
    max-width: none;
    height: 100%;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: ${uiTokens.ink.primary};
    overflow: hidden;
  }
  ${root}::backdrop {
    background: ${uiTokens.surface.scrim};
    opacity: 0;
    transition: opacity ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${root}[open]::backdrop {
    opacity: 1;
  }
  ${panel} {
    position: absolute;
    inset: 0 auto 0 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    box-sizing: border-box;
    width: min(300px, 86vw);
    padding: max(24px, env(safe-area-inset-top)) 12px max(24px, env(safe-area-inset-bottom));
    overflow: hidden;
    background: ${uiTokens.surface.canvas};
    box-shadow: ${uiTokens.shadow.sheet};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
    transform: translateX(-100%);
    transition: transform ${uiTokens.motion.draw} ${uiTokens.motion.enter};
  }
  ${panel} > ${partSelector(pageFrameContract, "root")} {
    flex: 1;
  }
  ${root}[open] ${panel} {
    transform: translateX(0);
  }
  @starting-style {
    ${root}[open] ${panel} {
      transform: translateX(-100%);
    }
    ${root}[open]::backdrop {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${root}::backdrop,
    ${panel} {
      transition: none;
    }
  }
`;
