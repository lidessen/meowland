import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { chatConversationContract } from "../../chat/conversation";

export const chatConversationStyles = css`
  ${partSelector(chatConversationContract, "root")} {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontBody};
  }
  ${partSelector(chatConversationContract, "viewport")} {
    flex: 1 1 0;
    min-height: 0;
    min-width: 0;
    scrollbar-gutter: stable;
    overscroll-behavior-y: contain;
  }
  ${partSelector(chatConversationContract, "viewport")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: -2px;
  }
  ${partSelector(chatConversationContract, "latest")} {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    align-self: flex-end;
    justify-self: end;
    width: fit-content;
    min-width: 0;
    max-width: calc(100% - 2 * ${uiTokens.spaceSection});
    margin: ${uiTokens.spaceGroup} ${uiTokens.spaceSection};
    white-space: normal;
    overflow-wrap: anywhere;
    min-height: 34px;
    padding: 0 ${uiTokens.controlPaddingInline};
    box-sizing: border-box;
    border: 0;
    border-radius: 999px;
    corner-shape: round;
    background: ${uiTokens.surface};
    color: ${uiTokens.foreground};
    font: inherit;
    box-shadow: ${uiTokens.shadowPanel};
    cursor: pointer;
  }
  ${partSelector(chatConversationContract, "latest")}[hidden] {
    display: none;
  }
  ${partSelector(chatConversationContract, "latest")}:hover {
    background: ${uiTokens.hover};
  }
  ${partSelector(chatConversationContract, "latest")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  @media (pointer: coarse) {
    ${partSelector(chatConversationContract, "latest")} {
      min-height: ${uiTokens.controlHeight};
    }
  }
`;
