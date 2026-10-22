import { css, partSelector } from "meowcss/meowjsx";
import { chatTokens, uiTokens, logoTokens } from "../tokens";
import { chatBubbleContract, chatBubbleOptions } from "../../chat/bubble";
import { chatMessageContract } from "../../chat/message";
import { chatMessageActionsContract } from "../../chat/message-actions";
import { buttonContract } from "../../components/button";
import { iconButtonContract } from "../../components/icon-button";
import { layerTokens, radiusTokens, lineTokens } from "../palette";

export const chatMessageStyles = css`
  ${partSelector(chatMessageContract, "root")}[data-chat-role="tool"] {
    width: 100%;
    padding-inline-start: 42px;
  }

  ${partSelector(chatMessageContract, "root")} {
    display: block;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="user"] {
    width: fit-content;
    max-width: ${chatTokens.messageUserMaxWidth};
    margin-left: auto;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="assistant"] {
    width: 100%;
  }

  ${partSelector(chatMessageContract, "body")} {
    min-width: 0;
  }

  /* Avatars belong to the message, aligned with its identity rather than floating
  above the reading column. Keep caller-provided artwork within this slot. */
  ${partSelector(chatMessageContract, "root")}:has(> ${partSelector(chatMessageContract, "avatar")}) {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    align-items: start;
    column-gap: 14px;
  }

  ${partSelector(chatMessageContract, "avatar")} {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    overflow: hidden;
    margin-top: 2px;
    border-radius: ${uiTokens.radiusSmall};
    /* Same glyph tile as Avatar: a quiet identity mark beside the author name. */
    box-sizing: border-box;
    border: ${lineTokens.width} solid ${lineTokens.edge};
    background: ${layerTokens.chip};
    color: ${uiTokens.foreground};
    ${logoTokens.ink.name}: ${uiTokens.foreground};
  }

  ${partSelector(chatMessageContract, "avatar")} svg {
    width: ${uiTokens.iconSize};
    height: ${uiTokens.iconSize};
  }

  ${partSelector(chatMessageContract, "avatar")} img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="user"]:has(> ${partSelector(chatMessageContract, "avatar")}) {
    grid-template-columns: minmax(0, 1fr) 28px;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="user"] > ${partSelector(chatMessageContract, "avatar")} {
    grid-column: 2;
    grid-row: 1;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="user"]:has(> ${partSelector(chatMessageContract, "avatar")}) > ${partSelector(chatMessageContract, "body")} {
    grid-column: 1;
    grid-row: 1;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-continuation] > ${partSelector(chatMessageContract, "avatar")} {
    visibility: hidden;
  }

  ${partSelector(chatMessageContract, "meta")} {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: ${uiTokens.spaceGroup};
    min-height: 0;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="user"] ${partSelector(chatMessageContract, "meta")} {
    justify-content: flex-end;
    grid-column: 2;
    grid-row: 2;
    padding-right: 4px;
  }

  /* Speaker and time are the message's own identity, not hover-only chrome, so a
  reader can tell who said what and when without inspecting a tooltip. */
  ${partSelector(chatMessageContract, "author")} {
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="user"] ${partSelector(chatMessageContract, "author")} {
    color: ${uiTokens.subtleForeground};
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  ${partSelector(chatMessageContract, "time")},
  ${partSelector(chatMessageContract, "status")} {
    flex-shrink: 0;
    color: ${uiTokens.subtleForeground};
    font-size: ${uiTokens.fontCaption};
    font-variant-numeric: tabular-nums;
  }

  ${partSelector(chatMessageContract, "status")} {
    min-height: 20px;
  }

  ${partSelector(chatMessageContract, "content")},
  ${partSelector(chatBubbleContract, "root")} {
    min-width: 0;
    overflow-wrap: anywhere;
    color: ${uiTokens.foreground};
    font-size: ${chatTokens.fontBody};
    line-height: ${chatTokens.messageLeading};
  }

  ${partSelector(chatMessageContract, "content")} {
    display: grid;
    gap: ${uiTokens.proseGap};
  }

  ${partSelector(chatBubbleContract, "root")}:not(:is([${chatBubbleOptions.attribute("variant")}="filled"], [${chatBubbleOptions.attribute("variant")}="auto"][data-chat-role="user"])) {
    padding-block: 0;
  }

  ${partSelector(chatBubbleContract, "root")}:is([${chatBubbleOptions.attribute("variant")}="filled"], [${chatBubbleOptions.attribute("variant")}="auto"][data-chat-role="user"]) {
    padding: 10px 16px;
    border-color: transparent;
    border-radius: ${chatTokens.messageRadius};
    line-height: 22px;
    background: ${uiTokens.surfaceMuted};
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="user"] ${partSelector(chatBubbleContract, "root")}:is([${chatBubbleOptions.attribute("variant")}="filled"], [${chatBubbleOptions.attribute("variant")}="auto"][data-chat-role="user"]) {
    background: ${chatTokens.userSurface};
    box-shadow: inset 0 0 0 ${lineTokens.width} ${lineTokens.quiet};
    color: ${chatTokens.userInk};
    border-radius: ${radiusTokens.bubble} ${radiusTokens.bubble} 4px ${radiusTokens.bubble};
  }

  ${partSelector(chatMessageContract, "content")} p,
  ${partSelector(chatBubbleContract, "root")} p {
    margin: 0;
    white-space: pre-wrap;
  }

  /* Block spacing, headings, lists, code, quotes and links inside content take
     the shared reading rhythm from shared/prose.styles.ts. */

  ${partSelector(chatMessageContract, "header")},
  ${partSelector(chatMessageContract, "footer")} {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: ${uiTokens.spaceGroup} ${uiTokens.spaceSection};
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
  }

  ${partSelector(chatMessageContract, "footer")} {
    margin-top: ${uiTokens.spaceGroup};
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="user"] ${partSelector(chatMessageContract, "footer")} {
    justify-content: flex-end;
    grid-column: 1 / -1;
    grid-row: 3;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-status="error"] ${partSelector(chatMessageContract, "status")} {
    color: ${uiTokens.danger};
  }

  /* Message actions keep a fixed, normal-flow placeholder so copy/expand never
  sit on top of the next message and never shift the reading position on
  engagement. Their space is compact and stable; touch/keyboard stay in flow. */
  ${partSelector(chatMessageContract, "actions")} {
    margin-top: 6px;
    opacity: 0;
    transition: opacity ${uiTokens.durationResponse} ${uiTokens.ease};
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="assistant"] ${partSelector(chatMessageContract, "actions")} {
    margin-left: -6px;
  }

  ${partSelector(chatMessageContract, "root")}:hover ${partSelector(chatMessageContract, "actions")},
  ${partSelector(chatMessageContract, "root")}:focus-within ${partSelector(chatMessageContract, "actions")} {
    opacity: 1;
  }

  ${partSelector(chatMessageActionsContract, "root")} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 28px;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="user"] ${partSelector(chatMessageActionsContract, "root")} {
    justify-content: flex-end;
  }

  /* Native action buttons get a quiet fallback. Registered controls keep their
  own variants, sizes and disabled feedback when composed into this slot. */
  :where(${partSelector(chatMessageActionsContract, "root")} button:not(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")})) {
    display: inline-flex;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    box-sizing: border-box;
    min-height: ${uiTokens.controlSmall};
    padding: 0 ${uiTokens.spaceGroup};
    border: 0;
    border-radius: ${uiTokens.radiusSmall};
    background: transparent;
    color: ${uiTokens.subtleForeground};
    cursor: pointer;
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontCaption};
  }

  :where(${partSelector(chatMessageActionsContract, "root")} button:not(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")})):hover:not(:disabled) {
    background: ${uiTokens.hover};
    color: ${uiTokens.mutedForeground};
  }

  ${partSelector(chatMessageActionsContract, "root")} ${partSelector(iconButtonContract, "root")},
  ${partSelector(chatMessageActionsContract, "root")} button[aria-label]:has(> svg) {
    box-sizing: border-box;
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
    padding: 6px;
    justify-content: center;
    border-radius: ${uiTokens.radiusSmall};
    background: transparent;
    color: ${uiTokens.subtleForeground};
  }

  ${partSelector(chatMessageActionsContract, "root")} button[aria-label]:has(> svg) > span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  ${partSelector(chatMessageActionsContract, "root")} button svg {
    width: 15px;
    height: 15px;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="assistant"] ${partSelector(chatMessageActionsContract, "root")} button svg {
    width: 17px;
    height: 17px;
  }

  ${partSelector(chatMessageActionsContract, "root")} button[aria-label]:has(> svg):hover:not(:disabled),
  ${partSelector(chatMessageActionsContract, "root")} ${partSelector(iconButtonContract, "root")}:hover:not(:disabled) {
    background: ${uiTokens.hover};
    color: ${uiTokens.mutedForeground};
  }

  /* A continued message groups under its turn through spacing alone. Its author
  and time stay visible so a run of consecutive replies never loses who is
  speaking; dropping the author made later deliveries read as anonymous. */
  :where(${partSelector(chatMessageActionsContract, "root")} button:not(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")})):focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }

  .chat-copy-icon {
    width: 13px;
    height: 13px;
    flex: 0 0 auto;
  }

  ${partSelector(chatMessageContract, "time")} {
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontCaption};
  }

  @media (max-width: 760px) {
    ${partSelector(chatMessageContract, "root")}[data-chat-role="user"] {
      max-width: min(90%, 580px);
    }
  }

  @media (pointer: coarse) {
    ${partSelector(chatMessageContract, "actions")} {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ${partSelector(chatMessageActionsContract, "root")} {
      transition: none;
    }
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="assistant"] ${partSelector(chatMessageContract, "author")} {
    color: ${uiTokens.foreground};
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="assistant"] ${partSelector(chatMessageContract, "body")} {
    display: grid;
    gap: 14px;
  }

  /* Copy and the time share the row under the bubble, so the reserved action
  placeholder does not add a second row between this message and the next. */
  ${partSelector(chatMessageContract, "root")}[data-chat-role="user"] ${partSelector(chatMessageContract, "body")} {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    justify-items: end;
    align-items: center;
    row-gap: 6px;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="user"] ${partSelector(chatMessageContract, "content")} {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="user"] ${partSelector(chatMessageContract, "actions")} {
    grid-column: 1;
    grid-row: 2;
    margin-top: 0;
  }

  ${partSelector(chatMessageContract, "root")}[data-chat-role="user"] ${partSelector(chatMessageContract, "time")} {
    color: ${layerTokens.faint};
  }
`;
