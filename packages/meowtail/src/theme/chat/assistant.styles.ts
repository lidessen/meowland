import { css, parts } from "meowcss/meowjsx";
import { uiTokens, chatTokens } from "../tokens";
import type { AssistantView } from "../../chat/assistant";
import type { AssistantComposer } from "../../chat/assistant-composer";
import type { AssistantMarkdown } from "../../chat/assistant-markdown";
import type { AssistantQuestionView } from "../../chat/assistant-question";
import type { AssistantSteps } from "../../chat/assistant-content";
import type { ChatComposer } from "../../chat/composer";
import type { ChatHeader } from "../../chat/header";
import type { ChatMessage } from "../../chat/message";
import type { ChatMessageActions } from "../../chat/message-actions";
import type { ChatMessageList } from "../../chat/message-list";
import type { Button } from "../../components/button";
import type { IconButton } from "../../components/icon-button";
import type { PageFrame } from "../../components/page-frame";
import type { WorkCard } from "../../components/work-card";
import { ui } from "../utilities";
import { selectorForPart } from "../selectors";
const assistantComposerPartRefs = parts<typeof AssistantComposer>("assistant-composer");
const assistantMarkdownPartRefs = parts<typeof AssistantMarkdown>("assistant-markdown");
const assistantQuestionPartRefs = parts<typeof AssistantQuestionView>("assistant-question");
const assistantStepsPartRefs = parts<typeof AssistantSteps>("assistant-steps");
const assistantViewPartRefs = parts<typeof AssistantView>("assistant-view");
const buttonPartRefs = parts<typeof Button>("button");
const chatComposerPartRefs = parts<typeof ChatComposer>("chat-composer");
const chatHeaderPartRefs = parts<typeof ChatHeader>("chat-header");
const chatMessageActionsPartRefs = parts<typeof ChatMessageActions>("chat-message-actions");
const chatMessagePartRefs = parts<typeof ChatMessage>("chat-message");
const chatMessageListPartRefs = parts<typeof ChatMessageList>("chat-message-list");
const iconButtonPartRefs = parts<typeof IconButton>("icon-button");
const pageFramePartRefs = parts<typeof PageFrame>("page-frame");
const workCardPartRefs = parts<typeof WorkCard>("work-card");
const root = assistantViewPartRefs.root;
const rootSelector = selectorForPart(root);
const layout = assistantViewPartRefs.layout;
const messages = assistantViewPartRefs.messages;
const viewport = assistantViewPartRefs.viewport;
const content = assistantViewPartRefs.content;
const composer = assistantViewPartRefs.composer;
const panel = `${rootSelector} [data-assistant-panel]`;
const history = assistantViewPartRefs.history;
const historyItem = assistantViewPartRefs.historyItem;
const trigger = assistantViewPartRefs.historyTrigger;

/** The complete composition belongs to the shared theme, never a demo stylesheet. */
export const assistantStyles = css`
  ${root} {
    height: 100%;
    min-height: 0;
    min-width: 0;
    color: ${uiTokens.ink.primary};
    background: ${uiTokens.surface.reading};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  ${root} > ${pageFramePartRefs.root} {
    height: 100%;
  }
  ${root} ${chatHeaderPartRefs.root} {
    padding: ${uiTokens.space.group} ${uiTokens.space.section};
  }
  ${layout} {
    display: grid;
    position: relative;
    height: 100%;
    min-height: 0;
    min-width: 0;
    grid-template-areas: "messages" "composer";
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) auto;
  }
  ${root}[data-activity-open="true"] ${layout} {
    grid-template-areas: "messages activity" "composer activity";
    grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  }
  ${messages} {
    grid-area: messages;
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
  }
  ${viewport} {
    flex: 1 1 0;
    min-height: 0;
    min-width: 0;
    overflow-y: auto;
    overflow-anchor: none;
    overscroll-behavior-y: contain;
    scrollbar-gutter: stable both-edges;
    /* The transcript fades out under the header instead of being cut. */
    mask-image: linear-gradient(to bottom, transparent, black ${uiTokens.space.section});
    transition:
      filter ${uiTokens.motion.settle} ${uiTokens.motion.ease},
      opacity ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${viewport}:focus-visible {
    ${ui.focus.inset}
  }
  ${content} {
    max-width: ${uiTokens.layout.containerContent};
    margin-inline: auto;
    padding: ${uiTokens.space.section} ${uiTokens.space.panel};
    box-sizing: border-box;
  }
  /* The content column already holds the reading inset and scroll; the list only stacks turns. */
  ${content} ${chatMessageListPartRefs.root} {
    gap: 0;
    padding: 0;
    overflow: visible;
  }
  /* One turn reads as a question bubble and a plain reply; the speaker is
     carried by placement, so names and times stay for assistive technology. */
  ${content} [data-assistant-message-id] {
    padding-block: calc(${chatTokens.listGap} / 2);
  }
  ${content} [data-assistant-message-id] ${chatMessagePartRefs.header} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ${content} [data-assistant-role="assistant"] ${chatMessagePartRefs.actions} {
    margin-top: ${uiTokens.space.group};
    margin-inline-start: -6px;
    opacity: 1;
  }
  ${content} [data-assistant-actions] ${chatMessageActionsPartRefs.root} {
    gap: 2px;
  }
  ${content} [data-assistant-actions] ${iconButtonPartRefs.root} .assistant-copy-done,
  ${content} [data-assistant-actions] ${iconButtonPartRefs.root}[data-copied="true"] .assistant-copy-idle {
    display: none;
  }
  ${content} [data-assistant-actions] ${iconButtonPartRefs.root}[data-copied="true"] .assistant-copy-done {
    display: block;
  }
  /* Parts stack on the message content's prose gap, like paragraphs of one reply. */
  ${content} [data-assistant-part-id] {
    overflow-wrap: anywhere;
  }
  ${root} ${assistantMarkdownPartRefs.root} {
    font-size: ${chatTokens.fontBody};
    line-height: ${chatTokens.leading};
    overflow-wrap: anywhere;
  }
  ${assistantViewPartRefs.latest} {
    display: flex;
    justify-content: center;
    flex-shrink: 0;
    width: 100%;
    max-width: ${uiTokens.layout.containerContent};
    margin-inline: auto;
    padding: ${uiTokens.space.group} ${uiTokens.space.panel};
    box-sizing: border-box;
  }
  ${assistantViewPartRefs.latest} > ${buttonPartRefs.root} {
    min-width: 0;
    max-width: 100%;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  ${composer} {
    grid-area: composer;
    width: 100%;
    max-width: ${uiTokens.layout.containerContent};
    margin-inline: auto;
    padding: ${uiTokens.space.group} ${uiTokens.space.panel}
      max(${uiTokens.space.section}, env(safe-area-inset-bottom));
    box-sizing: border-box;
    min-width: 0;
  }
  /* A docked bar: the fill rung with a faint lift off the reading surface. */
  ${composer} ${chatComposerPartRefs.surface} {
    box-shadow: ${uiTokens.shadow.dock};
  }
  ${trigger} {
    display: contents;
  }
  ${trigger} ${iconButtonPartRefs.root} .assistant-history-open,
  ${trigger} ${iconButtonPartRefs.root}[aria-expanded="true"] .assistant-history-closed {
    display: none;
  }
  ${trigger} ${iconButtonPartRefs.root}[aria-expanded="true"] .assistant-history-open {
    display: block;
  }
  ${trigger} ${iconButtonPartRefs.root}[aria-expanded="true"] {
    background: ${uiTokens.state.active};
    color: ${uiTokens.ink.primary};
  }
  ${trigger}[hidden] {
    display: none;
  }

  /* Your messages: one column of the questions asked, over the blurred transcript. */
  ${history} {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    box-sizing: border-box;
    padding: ${uiTokens.space.section} ${uiTokens.space.panel};
    overflow-y: auto;
    visibility: hidden;
    opacity: 0;
    transition:
      opacity ${uiTokens.motion.settle} ${uiTokens.motion.ease},
      visibility 0s linear ${uiTokens.motion.settle};
  }
  ${history}[data-open="true"] {
    visibility: visible;
    opacity: 1;
    transition: opacity ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${root}[data-history-open="true"] ${viewport} {
    filter: blur(8px);
    opacity: 0.6;
    pointer-events: none;
  }
  ${history} > ol {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: ${uiTokens.space.group};
    width: 100%;
    max-width: ${uiTokens.layout.containerContent};
    margin: 0 auto;
    padding: 0;
    list-style: none;
  }
  ${history} > ol > li {
    display: flex;
    justify-content: flex-end;
    max-width: ${chatTokens.userMaxWidth};
    transform: translateY(${uiTokens.space.group});
    transition: transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${history}[data-open="true"] > ol > li {
    transform: none;
  }
  ${historyItem} {
    box-sizing: border-box;
    max-width: 100%;
    padding: 8px 14px;
    border: 0;
    border-radius: ${chatTokens.bubbleRadius};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.bodyCompact} ${uiTokens.type.sans};
    text-align: start;
    overflow-wrap: anywhere;
    cursor: pointer;
    transition: background-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  @media (hover: hover) {
    ${historyItem}:hover {
      background-image: linear-gradient(${uiTokens.state.hover}, ${uiTokens.state.hover});
    }
  }
  ${historyItem}:focus-visible {
    ${ui.focus.ring}
  }
  @media (prefers-reduced-motion: reduce) {
    ${viewport},
    ${history},
    ${history} > ol > li {
      transition: none;
    }
  }
  ${composer} ${chatComposerPartRefs.input} {
    min-height: 1.6em;
    max-height: min(30dvh, 240px);
    overflow-y: auto;
  }
  ${root} ${assistantComposerPartRefs.choices} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    min-width: 0;
    gap: ${uiTokens.space.group};
  }
  ${root} ${assistantComposerPartRefs.feedback}, ${assistantViewPartRefs.feedback} {
    margin: ${uiTokens.space.group} 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
  }
  ${assistantViewPartRefs.empty} {
    padding-block: ${uiTokens.space.panel};
  }
  ${assistantViewPartRefs.empty} h2 {
    font-size: ${uiTokens.type.pageTitle};
    margin-block: ${uiTokens.space.section};
  }
  ${assistantStepsPartRefs.root} {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  ${assistantStepsPartRefs.step} {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: baseline;
    gap: ${uiTokens.space.group};
    padding-block: ${uiTokens.space.group};
    font-size: ${uiTokens.type.body};
  }
  ${assistantStepsPartRefs.description} {
    margin: 0;
    color: ${uiTokens.ink.secondary};
    white-space: pre-wrap;
  }
  ${assistantStepsPartRefs.status} {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
  }
  ${panel} {
    grid-area: activity;
    position: static;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    border: 0;
    border-left: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: 0;
    color: inherit;
    background: ${uiTokens.surface.canvas};
    overflow: hidden;
  }
  ${panel}[open] {
    display: flex;
    flex-direction: column;
  }
  ${assistantViewPartRefs.activityHeader} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: ${uiTokens.space.group};
    padding: ${uiTokens.space.group} ${uiTokens.space.section};
    border-bottom: 1px solid ${uiTokens.line.divider};
    flex: 0 0 auto;
  }
  ${assistantViewPartRefs.activityHeader} h2 {
    flex: 1;
    margin: 0;
    font-size: ${uiTokens.type.title};
  }
  ${assistantViewPartRefs.activityBody}, ${assistantViewPartRefs.workDetail} {
    min-height: 0;
    overflow-y: auto;
    padding: ${uiTokens.space.section};
  }
  ${assistantViewPartRefs.section} + ${assistantViewPartRefs.section} {
    margin-top: ${uiTokens.space.panel};
  }
  ${assistantViewPartRefs.section} h3 {
    font-size: ${uiTokens.type.body};
    margin: 0 0 ${uiTokens.space.group};
  }
  ${assistantViewPartRefs.status} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
  }
  ${panel} ${workCardPartRefs.root} {
    width: 100%;
    margin-block: ${uiTokens.space.group};
  }
  ${root} ${assistantQuestionPartRefs.root} {
    margin-block: ${uiTokens.space.section};
  }
  ${root} ${assistantQuestionPartRefs.answer} {
    box-sizing: border-box;
    width: 100%;
    resize: vertical;
    min-height: 40px;
    font: inherit;
    color: inherit;
    border: 1px solid ${uiTokens.line.control};
    border-radius: ${uiTokens.radius.lg};
    background: ${uiTokens.surface.field};
    padding: ${uiTokens.space.group};
  }
  ${root} ${assistantQuestionPartRefs.options} {
    margin-bottom: ${uiTokens.space.group};
  }
  ${root} [hidden] {
    display: none !important;
  }
  @container (max-width: 759px) {
    ${root}[data-activity-open="true"] ${layout} {
      grid-template-areas: "messages" "composer";
      grid-template-columns: minmax(0, 1fr);
    }
    ${panel} {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100dvh;
      border: 0;
    }
    ${content} {
      padding-inline: ${uiTokens.space.pageInlineCompact};
    }
    ${composer},
    ${history} {
      padding-inline: ${uiTokens.space.pageInlineCompact};
    }
    ${assistantViewPartRefs.latest} {
      padding-inline: ${uiTokens.space.pageInlineCompact};
    }
  }
  ${root} {
    container-type: inline-size;
  }
`;
