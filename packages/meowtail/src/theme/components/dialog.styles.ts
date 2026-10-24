import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { Dialog, DialogActions, DialogHeader, DialogPanel } from "../../components/dialog";
import type { PageFrame } from "../../components/page-frame";
const dialogActionsPartRefs = parts<typeof DialogActions>("dialog-actions");
const dialogPartRefs = parts<typeof Dialog>("dialog");
const dialogHeaderPartRefs = parts<typeof DialogHeader>("dialog-header");
const dialogPanelPartRefs = parts<typeof DialogPanel>("dialog-panel");
const pageFramePartRefs = parts<typeof PageFrame>("page-frame");
export const dialogStyles = css`
  :where(${dialogPartRefs.root}) {
    box-sizing: border-box;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  ${dialogPartRefs.root} {
    background: ${uiTokens.surface.overlay};
    border: 0;
    border-radius: ${uiTokens.radius.xxl};
  }
  ${dialogPanelPartRefs.root} {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    height: 100%;
    max-height: inherit;
    margin: 0;
    padding: 0;
  }
  ${dialogPanelPartRefs.root} > ${pageFramePartRefs.root} {
    flex: 1;
  }
  /* Keep panel insets inside the body scrollport so edge controls retain their focus ink. */
  ${dialogPanelPartRefs.root} > ${pageFramePartRefs.root} > ${pageFramePartRefs.header} {
    padding: ${uiTokens.space.panel} ${uiTokens.space.panel} 0;
  }
  ${dialogPanelPartRefs.root} > ${pageFramePartRefs.root} > ${pageFramePartRefs.body} {
    padding: ${uiTokens.space.panel};
  }
  ${dialogPanelPartRefs.root} > ${pageFramePartRefs.root} > ${pageFramePartRefs.header} + ${pageFramePartRefs.body} {
    padding-top: ${uiTokens.space.section};
  }
  ${dialogPartRefs.root} {
    width: min(380px, calc(100vw - 48px));
    max-height: calc(100dvh - 48px);
    padding: 0;
    overflow: hidden;
    box-shadow: ${uiTokens.shadow.float};
  }
  ${dialogPartRefs.root}::backdrop {
    background: ${uiTokens.surface.scrim};
  }
  /* A modal arrives: the scrim fades in and the panel rises out of a slight scale. */
  ${dialogPartRefs.root}[open] {
    animation: ui-dialog-enter ${uiTokens.motion.draw} ${uiTokens.motion.enter};
  }
  ${dialogPartRefs.root}[open]::backdrop {
    animation: ui-scrim-enter ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  @keyframes ui-dialog-enter {
    from {
      opacity: 0;
      transform: translateY(6px) scale(0.97);
    }
  }
  @keyframes ui-scrim-enter {
    from {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${dialogPartRefs.root}[open],
    ${dialogPartRefs.root}[open]::backdrop {
      animation: none;
    }
  }
  :where(${dialogHeaderPartRefs.root}, ${dialogActionsPartRefs.root}) {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
  }
  ${dialogHeaderPartRefs.root} {
    justify-content: space-between;
    align-items: flex-start;
    min-width: 0;
    margin-bottom: ${uiTokens.space.section};
  }
  ${dialogPanelPartRefs.root} > ${pageFramePartRefs.root} > ${pageFramePartRefs.header} > ${dialogHeaderPartRefs.root} {
    margin-bottom: 0;
  }
  ${dialogActionsPartRefs.root} {
    justify-content: flex-end;
    margin-top: ${uiTokens.space.section};
    flex-wrap: wrap;
  }
  ${dialogHeaderPartRefs.title} {
    margin: 0;
    font-size: ${uiTokens.type.title};
    /* Same title role as Card, Section and EmptyState. */
    font-weight: ${uiTokens.type.weight.semibold};
    letter-spacing: ${uiTokens.type.trackingTight};
    line-height: ${uiTokens.type.line.title};
    overflow-wrap: anywhere;
  }
  ${dialogHeaderPartRefs.identity} {
    min-width: 0;
  }
  ${dialogHeaderPartRefs.actions} {
    flex-shrink: 0;
  }
  ${dialogHeaderPartRefs.eyebrow} {
    margin: 0 0 ${uiTokens.space.group};
    font-size: ${uiTokens.type.caption};
    color: ${uiTokens.ink.secondary};
  }
  ${dialogHeaderPartRefs.description} {
    margin: ${uiTokens.space.group} 0 0;
    color: ${uiTokens.ink.secondary};
  }

  @media (pointer: coarse) {
    ${dialogActionsPartRefs.root}[data-meowui-part] > * {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
