import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens, chatTokens } from "../tokens";
import { focusRing } from "../recipes";
import { assistantViewContract } from "../../chat/assistant.contract";
import { assistantStepsContract } from "../../chat/assistant-steps.contract";
import { assistantMarkdownContract } from "../../chat/assistant-markdown";
import { assistantComposerContract } from "../../chat/assistant-composer";
import { assistantQuestionContract } from "../../chat/assistant-question";
import { chatHeaderContract } from "../../chat/header";
import { pageFrameContract } from "../../components/page-frame";
import { chatComposerContract } from "../../chat/composer";
import { workCardContract } from "../../components/work-card";
import { buttonContract } from "../../components/button";
import { iconButtonContract } from "../../components/icon-button";
import { chatMessageContract } from "../../chat/message";
import { chatMessageListContract } from "../../chat/message-list";
import { chatMessageActionsContract } from "../../chat/message-actions";

const root = partSelector(assistantViewContract, "root");
const layout = partSelector(assistantViewContract, "layout");
const messages = partSelector(assistantViewContract, "messages");
const viewport = partSelector(assistantViewContract, "viewport");
const content = partSelector(assistantViewContract, "content");
const composer = partSelector(assistantViewContract, "composer");
const panel = `${root} [data-assistant-panel]`;
const history = partSelector(assistantViewContract, "history");
const historyItem = partSelector(assistantViewContract, "historyItem");
const trigger = partSelector(assistantViewContract, "historyTrigger");

/** The complete composition belongs to the shared theme, never a demo stylesheet. */
export const assistantStyles = css`
  ${root} {
    height: 100%;
    min-height: 0;
    min-width: 0;
    color: ${uiTokens.ink.primary};
    background: ${uiTokens.surface.reading};
    font: ${uiTokens.type.body}/${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  ${root} > ${partSelector(pageFrameContract, "root")} {
    height: 100%;
  }
  ${root} ${partSelector(chatHeaderContract, "root")} {
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
    ${focusRing({ inset: true })}
  }
  ${content} {
    max-width: ${uiTokens.layout.containerContent};
    margin-inline: auto;
    padding: ${uiTokens.space.section} ${uiTokens.space.panel};
    box-sizing: border-box;
  }
  /* The content column already holds the reading inset and scroll; the list only stacks turns. */
  ${content} ${partSelector(chatMessageListContract, "root")} {
    gap: 0;
    padding: 0;
    overflow: visible;
  }
  /* One turn reads as a question bubble and a plain reply; the speaker is
     carried by placement, so names and times stay for assistive technology. */
  ${content} [data-assistant-message-id] {
    padding-block: calc(${chatTokens.listGap} / 2);
  }
  ${content} [data-assistant-message-id] ${partSelector(chatMessageContract, "header")} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ${content} [data-assistant-role="assistant"] ${partSelector(chatMessageContract, "actions")} {
    margin-top: ${uiTokens.space.group};
    margin-inline-start: -6px;
    opacity: 1;
  }
  ${content} [data-assistant-actions] ${partSelector(chatMessageActionsContract, "root")} {
    gap: 2px;
  }
  ${content} [data-assistant-actions] ${partSelector(iconButtonContract, "root")} .assistant-copy-done,
  ${content} [data-assistant-actions] ${partSelector(iconButtonContract, "root")}[data-copied="true"] .assistant-copy-idle {
    display: none;
  }
  ${content} [data-assistant-actions] ${partSelector(iconButtonContract, "root")}[data-copied="true"] .assistant-copy-done {
    display: block;
  }
  /* Parts stack on the message content's prose gap, like paragraphs of one reply. */
  ${content} [data-assistant-part-id] {
    overflow-wrap: anywhere;
  }
  ${root} ${partSelector(assistantMarkdownContract, "root")} {
    font-size: ${chatTokens.fontBody};
    line-height: ${chatTokens.leading};
    overflow-wrap: anywhere;
  }
  ${partSelector(assistantViewContract, "latest")} {
    display: flex;
    justify-content: center;
    flex-shrink: 0;
    width: 100%;
    max-width: ${uiTokens.layout.containerContent};
    margin-inline: auto;
    padding: ${uiTokens.space.group} ${uiTokens.space.panel};
    box-sizing: border-box;
  }
  ${partSelector(assistantViewContract, "latest")} > ${partSelector(buttonContract, "root")} {
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
  ${composer} ${partSelector(chatComposerContract, "surface")} {
    box-shadow: ${uiTokens.shadow.dock};
  }
  ${trigger} {
    display: contents;
  }
  ${trigger} ${partSelector(iconButtonContract, "root")} .assistant-history-open,
  ${trigger} ${partSelector(iconButtonContract, "root")}[aria-expanded="true"] .assistant-history-closed {
    display: none;
  }
  ${trigger} ${partSelector(iconButtonContract, "root")}[aria-expanded="true"] .assistant-history-open {
    display: block;
  }
  ${trigger} ${partSelector(iconButtonContract, "root")}[aria-expanded="true"] {
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
    font: ${uiTokens.type.body}/1.4 ${uiTokens.type.sans};
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
    ${focusRing()}
  }
  @media (prefers-reduced-motion: reduce) {
    ${viewport},
    ${history},
    ${history} > ol > li {
      transition: none;
    }
  }
  ${composer} ${partSelector(chatComposerContract, "input")} {
    min-height: 1.6em;
    max-height: min(30dvh, 240px);
    overflow-y: auto;
  }
  ${root} ${partSelector(assistantComposerContract, "choices")} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    min-width: 0;
    gap: ${uiTokens.space.group};
  }
  ${root} ${partSelector(assistantComposerContract, "feedback")}, ${partSelector(assistantViewContract, "feedback")} {
    margin: ${uiTokens.space.group} 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
  }
  ${partSelector(assistantViewContract, "empty")} {
    padding-block: ${uiTokens.space.panel};
  }
  ${partSelector(assistantViewContract, "empty")} h2 {
    font-size: ${uiTokens.type.pageTitle};
    margin-block: ${uiTokens.space.section};
  }
  ${partSelector(assistantStepsContract, "root")} {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  ${partSelector(assistantStepsContract, "step")} {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: baseline;
    gap: ${uiTokens.space.group};
    padding-block: ${uiTokens.space.group};
    font-size: ${uiTokens.type.body};
  }
  ${partSelector(assistantStepsContract, "description")} {
    margin: 0;
    color: ${uiTokens.ink.secondary};
    white-space: pre-wrap;
  }
  ${partSelector(assistantStepsContract, "status")} {
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
  ${partSelector(assistantViewContract, "activityHeader")} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: ${uiTokens.space.group};
    padding: ${uiTokens.space.group} ${uiTokens.space.section};
    border-bottom: 1px solid ${uiTokens.line.divider};
    flex: 0 0 auto;
  }
  ${partSelector(assistantViewContract, "activityHeader")} h2 {
    flex: 1;
    margin: 0;
    font-size: ${uiTokens.type.title};
  }
  ${partSelector(assistantViewContract, "activityBody")}, ${partSelector(assistantViewContract, "workDetail")} {
    min-height: 0;
    overflow-y: auto;
    padding: ${uiTokens.space.section};
  }
  ${partSelector(assistantViewContract, "section")} + ${partSelector(assistantViewContract, "section")} {
    margin-top: ${uiTokens.space.panel};
  }
  ${partSelector(assistantViewContract, "section")} h3 {
    font-size: ${uiTokens.type.body};
    margin: 0 0 ${uiTokens.space.group};
  }
  ${partSelector(assistantViewContract, "status")} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
  }
  ${panel} ${partSelector(workCardContract, "root")} {
    width: 100%;
    margin-block: ${uiTokens.space.group};
  }
  ${root} ${partSelector(assistantQuestionContract, "root")} {
    margin-block: ${uiTokens.space.section};
  }
  ${root} ${partSelector(assistantQuestionContract, "answer")} {
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
  ${root} ${partSelector(assistantQuestionContract, "options")} {
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
    ${partSelector(assistantViewContract, "latest")} {
      padding-inline: ${uiTokens.space.pageInlineCompact};
    }
  }
  ${root} {
    container-type: inline-size;
  }
`;
