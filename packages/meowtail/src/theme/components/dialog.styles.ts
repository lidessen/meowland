import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import {
  dialogActionsContract,
  dialogContract,
  dialogHeaderContract,
  dialogPanelContract,
} from "../../components/dialog";
import { pageFrameContract } from "../../components/page-frame";

export const dialogStyles = css`
  :where(${partSelector(dialogContract, "root")}) {
    box-sizing: border-box;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body}/${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  ${partSelector(dialogContract, "root")} {
    background: ${uiTokens.surface.overlay};
    border: 0;
    border-radius: ${uiTokens.radius.xxl};
  }
  ${partSelector(dialogPanelContract, "root")} {
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
  ${partSelector(dialogPanelContract, "root")} > ${partSelector(pageFrameContract, "root")} {
    flex: 1;
  }
  /* Keep panel insets inside the body scrollport so edge controls retain their focus ink. */
  ${partSelector(dialogPanelContract, "root")} > ${partSelector(pageFrameContract, "root")} > ${partSelector(pageFrameContract, "header")} {
    padding: ${uiTokens.space.panel} ${uiTokens.space.panel} 0;
  }
  ${partSelector(dialogPanelContract, "root")} > ${partSelector(pageFrameContract, "root")} > ${partSelector(pageFrameContract, "body")} {
    padding: ${uiTokens.space.panel};
  }
  ${partSelector(dialogPanelContract, "root")} > ${partSelector(pageFrameContract, "root")} > ${partSelector(pageFrameContract, "header")} + ${partSelector(pageFrameContract, "body")} {
    padding-top: ${uiTokens.space.section};
  }
  ${partSelector(dialogContract, "root")} {
    width: min(380px, calc(100vw - 48px));
    max-height: calc(100dvh - 48px);
    padding: 0;
    overflow: hidden;
    box-shadow: ${uiTokens.shadow.float};
  }
  ${partSelector(dialogContract, "root")}::backdrop {
    background: ${uiTokens.surface.scrim};
  }
  /* A modal arrives: the scrim fades in and the panel rises out of a slight scale. */
  ${partSelector(dialogContract, "root")}[open] {
    animation: ui-dialog-enter ${uiTokens.motion.draw} ${uiTokens.motion.enter};
  }
  ${partSelector(dialogContract, "root")}[open]::backdrop {
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
    ${partSelector(dialogContract, "root")}[open],
    ${partSelector(dialogContract, "root")}[open]::backdrop {
      animation: none;
    }
  }
  :where(${partSelector(dialogHeaderContract, "root")}, ${partSelector(dialogActionsContract, "root")}) {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
  }
  ${partSelector(dialogHeaderContract, "root")} {
    justify-content: space-between;
    align-items: flex-start;
    min-width: 0;
    margin-bottom: ${uiTokens.space.section};
  }
  ${partSelector(dialogPanelContract, "root")} > ${partSelector(pageFrameContract, "root")} > ${partSelector(pageFrameContract, "header")} > ${partSelector(dialogHeaderContract, "root")} {
    margin-bottom: 0;
  }
  ${partSelector(dialogActionsContract, "root")} {
    justify-content: flex-end;
    margin-top: ${uiTokens.space.section};
    flex-wrap: wrap;
  }
  ${partSelector(dialogHeaderContract, "title")} {
    margin: 0;
    font-size: ${uiTokens.type.title};
    /* Same title role as Card, Section and EmptyState. */
    font-weight: 600;
    letter-spacing: ${uiTokens.type.trackingTight};
    line-height: 24px;
    overflow-wrap: anywhere;
  }
  ${partSelector(dialogHeaderContract, "identity")} {
    min-width: 0;
  }
  ${partSelector(dialogHeaderContract, "actions")} {
    flex-shrink: 0;
  }
  ${partSelector(dialogHeaderContract, "eyebrow")} {
    margin: 0 0 ${uiTokens.space.group};
    font-size: ${uiTokens.type.caption};
    color: ${uiTokens.ink.secondary};
  }
  ${partSelector(dialogHeaderContract, "description")} {
    margin: ${uiTokens.space.group} 0 0;
    color: ${uiTokens.ink.secondary};
  }

  @media (pointer: coarse) {
    ${partSelector(dialogActionsContract, "root")}[data-meowui-part] > * {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
