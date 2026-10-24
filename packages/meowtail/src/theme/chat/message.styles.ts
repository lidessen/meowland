import { css, parts } from "meowcss/meowjsx";
import { chatTokens, uiTokens, logoTokens } from "../tokens";
import type { ChatBubble } from "../../chat/bubble";
import type { ChatMessage } from "../../chat/message";
import type { ChatMessageActions } from "../../chat/message-actions";
import type { Button } from "../../components/button";
import type { IconButton } from "../../components/icon-button";
import { chatBubbleOptions } from "../../chat/bubble.options";
import { ui } from "../utilities";
const buttonPartRefs = parts<typeof Button>("button");
const chatBubblePartRefs = parts<typeof ChatBubble>("chat-bubble");
const chatMessageActionsPartRefs = parts<typeof ChatMessageActions>("chat-message-actions");
const chatMessagePartRefs = parts<typeof ChatMessage>("chat-message");
const iconButtonPartRefs = parts<typeof IconButton>("icon-button");
export const chatMessageStyles = css`
  ${chatMessagePartRefs.root}[data-chat-role="tool"] {
    width: 100%;
    padding-inline-start: 42px;
  }

  ${chatMessagePartRefs.root} {
    display: block;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
  }

  ${chatMessagePartRefs.root}[data-chat-role="user"] {
    width: fit-content;
    max-width: ${chatTokens.userMaxWidth};
    margin-left: auto;
  }

  ${chatMessagePartRefs.root}[data-chat-role="assistant"] {
    width: 100%;
  }

  ${chatMessagePartRefs.body} {
    min-width: 0;
  }

  /* Avatars belong to the message, aligned with its identity rather than floating
  above the reading column. Keep caller-provided artwork within this slot. */
  ${chatMessagePartRefs.root}:has(> ${chatMessagePartRefs.avatar}) {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    align-items: start;
    column-gap: 14px;
  }

  ${chatMessagePartRefs.avatar} {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    overflow: hidden;
    /* Centered on the author line (or the first line of text when names are hidden). */
    margin-top: -3px;
    border-radius: ${uiTokens.radius.full};
    /* A raised disc with a hairline ring: an identity mark that holds its shape on any rung. */
    box-sizing: border-box;
    border: 0;
    background: ${uiTokens.surface.raised};
    box-shadow:
      inset 0 0 0 ${uiTokens.line.width} ${uiTokens.line.edge},
      ${uiTokens.shadow.action};
    color: ${uiTokens.ink.primary};
    ${logoTokens.ink.name}: ${uiTokens.ink.primary};
  }

  ${chatMessagePartRefs.avatar} svg {
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
  }

  ${chatMessagePartRefs.avatar} img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  ${chatMessagePartRefs.root}[data-chat-role="user"]:has(> ${chatMessagePartRefs.avatar}) {
    grid-template-columns: minmax(0, 1fr) 28px;
  }

  ${chatMessagePartRefs.root}[data-chat-role="user"] > ${chatMessagePartRefs.avatar} {
    grid-column: 2;
    grid-row: 1;
  }

  ${chatMessagePartRefs.root}[data-chat-role="user"]:has(> ${chatMessagePartRefs.avatar}) > ${chatMessagePartRefs.body} {
    grid-column: 1;
    grid-row: 1;
  }

  ${chatMessagePartRefs.root}[data-chat-continuation] > ${chatMessagePartRefs.avatar} {
    visibility: hidden;
  }

  ${chatMessagePartRefs.meta} {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: ${uiTokens.space.group};
    min-height: 0;
  }

  ${chatMessagePartRefs.root}[data-chat-role="user"] ${chatMessagePartRefs.meta} {
    justify-content: flex-end;
    grid-column: 2;
    grid-row: 2;
    padding-right: 4px;
  }

  /* Speaker and time are the message's own identity, not hover-only chrome, so a
  reader can tell who said what and when without inspecting a tooltip. */
  ${chatMessagePartRefs.author} {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    font-weight: ${uiTokens.type.weight.semibold};
    line-height: ${uiTokens.type.line.caption};
    white-space: nowrap;
  }

  ${chatMessagePartRefs.root}[data-chat-role="user"] ${chatMessagePartRefs.author} {
    color: ${uiTokens.ink.tertiary};
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  ${chatMessagePartRefs.time},
  ${chatMessagePartRefs.status} {
    flex-shrink: 0;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    font-variant-numeric: tabular-nums;
  }

  ${chatMessagePartRefs.status} {
    min-height: 20px;
  }

  ${chatMessagePartRefs.content},
  ${chatBubblePartRefs.root} {
    min-width: 0;
    overflow-wrap: anywhere;
    color: ${uiTokens.ink.primary};
    font-size: ${chatTokens.fontBody};
    line-height: ${chatTokens.leading};
  }

  ${chatMessagePartRefs.content} {
    display: grid;
    /* A wide part (a diff, a long path) scrolls inside itself, never widens the column. */
    grid-template-columns: minmax(0, 1fr);
    gap: ${uiTokens.space.prose};
  }

  ${chatBubblePartRefs.root}:not(:is([${chatBubbleOptions.attribute("variant")}="filled"], [${chatBubbleOptions.attribute("variant")}="auto"][data-chat-role="user"])) {
    padding-block: 0;
  }

  ${chatBubblePartRefs.root}:is([${chatBubbleOptions.attribute("variant")}="filled"], [${chatBubbleOptions.attribute("variant")}="auto"][data-chat-role="user"]) {
    padding: 8px 14px;
    border-color: transparent;
    border-radius: ${chatTokens.bubbleRadius};
    line-height: ${uiTokens.type.line.body};
    background: ${uiTokens.surface.fill};
  }

  ${chatMessagePartRefs.root}[data-chat-role="user"] ${chatBubblePartRefs.root}:is([${chatBubbleOptions.attribute("variant")}="filled"], [${chatBubbleOptions.attribute("variant")}="auto"][data-chat-role="user"]) {
    /* A fill takes no edge; the question reads as one soft pill. */
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
    border-radius: ${chatTokens.bubbleRadius};
  }

  ${chatMessagePartRefs.content} p,
  ${chatBubblePartRefs.root} p {
    margin: 0;
    white-space: pre-wrap;
  }

  /* Block spacing, headings, lists, code, quotes and links inside content take
     the shared reading rhythm from shared/prose.styles.ts. */

  ${chatMessagePartRefs.header},
  ${chatMessagePartRefs.footer} {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: ${uiTokens.space.group} ${uiTokens.space.section};
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
  }

  ${chatMessagePartRefs.footer} {
    margin-top: ${uiTokens.space.group};
  }

  ${chatMessagePartRefs.root}[data-chat-role="user"] ${chatMessagePartRefs.footer} {
    justify-content: flex-end;
    grid-column: 1 / -1;
    grid-row: 3;
  }

  ${chatMessagePartRefs.root}[data-chat-status="error"] ${chatMessagePartRefs.status} {
    color: ${uiTokens.status.danger};
  }

  /* Message actions keep a fixed, normal-flow placeholder so copy/expand never
  sit on top of the next message and never shift the reading position on
  engagement. Their space is compact and stable; touch/keyboard stay in flow. */
  ${chatMessagePartRefs.actions} {
    margin-top: 6px;
    opacity: 0;
    transition: opacity ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }

  ${chatMessagePartRefs.root}[data-chat-role="assistant"] ${chatMessagePartRefs.actions} {
    margin-left: -6px;
  }

  ${chatMessagePartRefs.root}:hover ${chatMessagePartRefs.actions},
  ${chatMessagePartRefs.root}:focus-within ${chatMessagePartRefs.actions} {
    opacity: 1;
  }

  ${chatMessageActionsPartRefs.root} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 28px;
  }

  ${chatMessagePartRefs.root}[data-chat-role="user"] ${chatMessageActionsPartRefs.root} {
    justify-content: flex-end;
  }

  /* Native action buttons get a quiet fallback. Registered controls keep their
  own variants, sizes and disabled feedback when composed into this slot. */
  :where(${chatMessageActionsPartRefs.root} button:not(${iconButtonPartRefs.root}, ${buttonPartRefs.root})) {
    display: inline-flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    box-sizing: border-box;
    min-height: ${uiTokens.control.small};
    padding: 0 ${uiTokens.space.group};
    border: 0;
    border-radius: ${uiTokens.radius.md};
    background: transparent;
    color: ${uiTokens.ink.tertiary};
    cursor: pointer;
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.caption};
  }

  :where(${chatMessageActionsPartRefs.root} button:not(${iconButtonPartRefs.root}, ${buttonPartRefs.root})):hover:not(:disabled) {
    background: ${uiTokens.state.hover};
    color: ${uiTokens.ink.secondary};
  }

  ${chatMessageActionsPartRefs.root} ${iconButtonPartRefs.root},
  ${chatMessageActionsPartRefs.root} button[aria-label]:has(> svg) {
    box-sizing: border-box;
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
    padding: 6px;
    justify-content: center;
    border-radius: ${uiTokens.radius.md};
    background: transparent;
    color: ${uiTokens.ink.tertiary};
  }

  ${chatMessageActionsPartRefs.root} button[aria-label]:has(> svg) > span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  ${chatMessageActionsPartRefs.root} button svg {
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
  }

  ${chatMessageActionsPartRefs.root} button[aria-label]:has(> svg):hover:not(:disabled),
  ${chatMessageActionsPartRefs.root} ${iconButtonPartRefs.root}:hover:not(:disabled) {
    background: ${uiTokens.state.hover};
    color: ${uiTokens.ink.secondary};
  }

  /* A continued message groups under its turn through spacing alone. Its author
  and time stay visible so a run of consecutive replies never loses who is
  speaking; dropping the author made later deliveries read as anonymous. */
  :where(${chatMessageActionsPartRefs.root} button:not(${iconButtonPartRefs.root}, ${buttonPartRefs.root})):focus-visible {
    ${ui.focus.ring}
  }

  .chat-copy-icon {
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
    flex: 0 0 auto;
  }

  ${chatMessagePartRefs.time} {
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.caption};
  }

  @media (max-width: 760px) {
    ${chatMessagePartRefs.root}[data-chat-role="user"] {
      max-width: min(90%, 580px);
    }
  }

  @media (pointer: coarse) {
    ${chatMessagePartRefs.actions} {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ${chatMessageActionsPartRefs.root} {
      transition: none;
    }
  }

  ${chatMessagePartRefs.root}[data-chat-role="assistant"] ${chatMessagePartRefs.author} {
    color: ${uiTokens.ink.primary};
  }

  ${chatMessagePartRefs.root}[data-chat-role="assistant"] ${chatMessagePartRefs.body} {
    display: grid;
    gap: 14px;
  }

  /* Copy and the time share the row under the bubble, so the reserved action
  placeholder does not add a second row between this message and the next. */
  ${chatMessagePartRefs.root}[data-chat-role="user"] ${chatMessagePartRefs.body} {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    justify-items: end;
    align-items: center;
    row-gap: 6px;
  }

  ${chatMessagePartRefs.root}[data-chat-role="user"] ${chatMessagePartRefs.content} {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  ${chatMessagePartRefs.root}[data-chat-role="user"] ${chatMessagePartRefs.actions} {
    grid-column: 1;
    grid-row: 2;
    margin-top: 0;
  }

  ${chatMessagePartRefs.root}[data-chat-role="user"] ${chatMessagePartRefs.time} {
    color: ${uiTokens.ink.tertiary};
  }
`;
