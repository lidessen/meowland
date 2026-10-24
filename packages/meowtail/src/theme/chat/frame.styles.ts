import { css, parts } from "meowcss/meowjsx";
import { chatTokens, uiTokens } from "../tokens";

import type { ChatFrame } from "../../chat/frame";
import type { ChatMessage } from "../../chat/message";
import type { ChatMessageList } from "../../chat/message-list";
const chatFramePartRefs = parts<typeof ChatFrame>("chat-frame");
const chatMessagePartRefs = parts<typeof ChatMessage>("chat-message");
const chatMessageListPartRefs = parts<typeof ChatMessageList>("chat-message-list");
/** Space above one list row, declared by the column on that row and read by the item itself. */
const rowPitch = "--chat-row-pitch";

export const chatFrameStyles = css`
  /* The frame supplies a coherent reading surface, not an application viewport. */
  ${chatFramePartRefs.root} {
    ${chatTokens.readingInset.name}: 24px;
    /* Resolved here so a nested light/dark scope re-resolves the reference to its own background. */
    ${uiTokens.surface.reading.name}: ${uiTokens.surface.reading};
    min-width: 0;
    color: ${uiTokens.ink.primary};
    background: ${uiTokens.surface.reading};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }

  ${chatMessageListPartRefs.root} {
    flex: 1 1 auto;
    display: grid;
    align-content: start;
    gap: ${chatTokens.listGap};
    min-width: 0;
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable both-edges;
    padding: 24px ${chatTokens.readingInset} 24px;
    background: ${uiTokens.surface.reading};
    scroll-padding-block: 18px;
    scrollbar-color: ${uiTokens.line.control} transparent;
    scrollbar-width: thin;
  }

  ${chatMessageListPartRefs.content} {
    display: grid;
    align-content: start;
    width: 100%;
    max-width: ${chatTokens.listMaxWidth};
    margin: 0 auto;
  }

  /* Row pitch belongs to the row that follows. The column declares it on each of its own
  children, so a host that mounts rows one at a time may interpose a layout-neutral
  container (display: contents) without hiding the pitch from the item it wraps. */
  ${chatMessageListPartRefs.content} > :not(:first-child) {
    ${rowPitch}: ${chatTokens.listGap};
    margin-block-start: var(${rowPitch});
  }

  ${chatMessageListPartRefs.date} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.section};
    color: ${uiTokens.ink.secondary};
    min-height: 32px;
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    white-space: nowrap;
    justify-content: center;
    margin-bottom: ${uiTokens.space.section};
  }

  ${chatMessageListPartRefs.item} {
    min-width: 0;
    /* The row carries the pitch its column declared, wrapped or not. The first row stays
    flush: the list's own inset is its leading space. */
    margin-block-start: var(${rowPitch}, 0px);
  }

  /* A continued reply is still one answer; it does not start a new turn. Its
  pitch plus the previous row's own action placeholder are the separation, so a
  run of short replies does not stack the old assistant 16px margin on top. */
  ${chatMessageListPartRefs.item}[data-chat-continuation="true"] {
    ${rowPitch}: 12px;
  }

  /* Rows reporting the work itself stay attached to the answer they belong to. */
  ${chatMessageListPartRefs.item}:has(
  ${chatMessagePartRefs.root}[data-chat-role="tool"]
  ) {
    ${rowPitch}: 6px;
  }

  @media (max-width: 760px) {
    ${chatFramePartRefs.root} {
      ${chatTokens.readingInset.name}: ${uiTokens.space.section};
    }

    ${chatMessageListPartRefs.root} {
      scrollbar-width: none;
      scrollbar-gutter: auto;
      padding: ${uiTokens.space.section} ${chatTokens.readingInset} 24px;
    }

    ${chatMessageListPartRefs.content} {
      max-width: 100%;
    }
  }

  @media (max-width: 360px) and (max-height: 700px) {
    ${chatMessageListPartRefs.root} {
      padding: ${uiTokens.space.group} ${uiTokens.space.section} ${uiTokens.space.panel};
    }
  }
`;
