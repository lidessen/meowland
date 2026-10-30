import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import { ui } from "../utilities";
import type { ChatConversation } from "../../chat/conversation";
const chatConversationPartRefs = parts<typeof ChatConversation>("chat-conversation");
export const chatConversationStyles = css`
  ${chatConversationPartRefs.root} {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.body};
  }
  ${chatConversationPartRefs.viewport} {
    flex: 1 1 0;
    min-height: 0;
    min-width: 0;
    scrollbar-gutter: stable;
    overscroll-behavior-y: contain;
  }
  ${chatConversationPartRefs.viewport}:focus-visible {
    ${ui.focus.inset}
  }
  ${chatConversationPartRefs.latest} {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    align-self: flex-end;
    justify-self: end;
    width: fit-content;
    min-width: 0;
    max-width: calc(100% - 2 * ${uiTokens.space.section});
    margin: ${uiTokens.space.group} ${uiTokens.space.section};
    white-space: normal;
    overflow-wrap: anywhere;
    min-height: 34px;
    padding: 0 ${uiTokens.control.inset};
    box-sizing: border-box;
    border: 0;
    border-radius: ${uiTokens.radius.full};
    corner-shape: round;
    background: ${uiTokens.surface.overlay};
    color: ${uiTokens.ink.primary};
    font: inherit;
    box-shadow: ${uiTokens.shadow.float};
    cursor: pointer;
  }
  /* The owned action floats over the viewport's lower edge, so showing it never resizes the
  transcript. A host's standalone ChatConversationLatest keeps the normal flow above. */
  ${chatConversationPartRefs.root} > ${chatConversationPartRefs.latest} {
    position: absolute;
    inset-block-end: ${uiTokens.space.group};
    inset-inline-start: 50%;
    z-index: 1;
    margin: 0;
    translate: -50% 0;
  }
  ${chatConversationPartRefs.latest}[hidden] {
    display: none;
  }
  /* The hover overlay paints on the opaque base, since the owned action floats over text. */
  ${chatConversationPartRefs.latest}:hover {
    background: linear-gradient(${uiTokens.state.hover}, ${uiTokens.state.hover})
      ${uiTokens.surface.overlay};
  }
  ${chatConversationPartRefs.latest}:focus-visible {
    ${ui.focus.ring}
  }
  @media (pointer: coarse) {
    ${chatConversationPartRefs.latest} {
      min-height: ${uiTokens.control.regular};
    }
  }
`;
