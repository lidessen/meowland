import { css, parts } from "meowcss/meowjsx";

import { uiTokens } from "../tokens";
import type { Toast } from "../../components/toast";
const toastPartRefs = parts<typeof Toast>("toast");
export const toastStyles = css`
  ${toastPartRefs.root} {
    display: flex;
    align-items: center;
    gap: 10px;
    width: fit-content;
    max-width: 100%;
    box-sizing: border-box;
    padding: 12px 16px;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.inverse.surface};
    color: ${uiTokens.inverse.ink};
    box-shadow: ${uiTokens.shadow.float};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.body} ${uiTokens.type.sans};
    animation: ui-toast-enter ${uiTokens.motion.draw} ${uiTokens.motion.enter};
  }
  /* A toast rises into place once, when the host mounts it. */
  @keyframes ui-toast-enter {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.98);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${toastPartRefs.root} {
      animation: none;
    }
  }
  ${toastPartRefs.message} {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${toastPartRefs.icon} {
    display: flex;
    flex: none;
  }
  ${toastPartRefs.actions} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  ${toastPartRefs.actions} :is(button, a) {
    min-height: 0;
    padding: 0;
    margin-inline: 4px;
    border: 0;
    background: transparent;
    color: ${uiTokens.inverse.action};
    font: inherit;
    text-decoration: none;
    cursor: pointer;
  }
  ${toastPartRefs.actions} :is(button, a):hover:not(:disabled) {
    background: transparent;
    opacity: 0.8;
  }
`;
