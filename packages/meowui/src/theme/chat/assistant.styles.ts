import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens, chatTokens } from "../tokens";
import { assistantViewContract } from "../../chat/assistant";
import { assistantStepsContract } from "../../chat/assistant-content";
import { assistantMarkdownContract } from "../../chat/assistant-markdown";
import { assistantComposerContract } from "../../chat/assistant-composer";
import { assistantQuestionContract } from "../../chat/assistant-question";
import { chatHeaderContract } from "../../chat/header";
import { pageFrameContract } from "../../components/page-frame";
import { chatComposerContract } from "../../chat/composer";
import { workCardContract } from "../../components/work-card";

const root = partSelector(assistantViewContract, "root");
const layout = partSelector(assistantViewContract, "layout");
const messages = partSelector(assistantViewContract, "messages");
const viewport = partSelector(assistantViewContract, "viewport");
const content = partSelector(assistantViewContract, "content");
const composer = partSelector(assistantViewContract, "composer");
const panel = `${root} [data-assistant-panel]`;

/** The complete composition belongs to the shared theme, never a demo stylesheet. */
export const assistantStyles = css`
  ${root} {
    height: 100%; min-height: 0; min-width: 0;
    color: ${uiTokens.foreground}; background: ${uiTokens.background};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
  }
  ${root} > ${partSelector(pageFrameContract, "root")} { height: 100%; }
  ${root} ${partSelector(chatHeaderContract, "root")} { padding: ${uiTokens.spaceGroup} ${uiTokens.spaceSection}; }
  ${layout} {
    display: grid; position: relative; height: 100%; min-height: 0; min-width: 0;
    grid-template-areas: "messages" "composer";
    grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto;
  }
  ${root}[data-activity-open="true"] ${layout} {
    grid-template-areas: "messages activity" "composer activity";
    grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  }
  ${messages} { grid-area: messages; position: relative; min-height: 0; min-width: 0; }
  ${viewport} { height: 100%; overflow-y: auto; overflow-anchor: none; overscroll-behavior-y: contain; scrollbar-gutter: stable; }
  ${viewport}:focus-visible { outline: 2px solid ${uiTokens.focus}; outline-offset: -2px; }
  ${content} { max-width: ${uiTokens.containerContent}; margin-inline: auto; padding: ${uiTokens.spaceSection} ${uiTokens.spacePanel}; box-sizing: border-box; }
  ${content} [data-assistant-message-id] { padding-block: ${uiTokens.spaceGroup}; }
  ${content} [data-assistant-message-header] { display: flex; flex-wrap: wrap; align-items: baseline; gap: ${uiTokens.spaceGroup}; color: ${uiTokens.mutedForeground}; font-size: ${uiTokens.fontCaption}; }
  ${content} [data-assistant-message-header] strong { color: ${uiTokens.foreground}; }
  ${content} [data-assistant-part-id] { margin-block: ${uiTokens.spaceGroup}; overflow-wrap: anywhere; }
  ${root} ${partSelector(assistantMarkdownContract, "root")} { font-size: ${chatTokens.fontBody}; line-height: ${chatTokens.messageLeading}; overflow-wrap: anywhere; }
  ${root} ${partSelector(assistantMarkdownContract, "root")} > :first-child { margin-top: 0; }
  ${root} ${partSelector(assistantMarkdownContract, "root")} > :last-child { margin-bottom: 0; }
  ${root} ${partSelector(assistantMarkdownContract, "root")} pre { overflow-x: auto; padding: ${uiTokens.spaceGroup}; background: ${uiTokens.codeSurface}; border-radius: ${uiTokens.radiusSmall}; font: ${uiTokens.fontCaption}/1.6 ${uiTokens.mono}; }
  ${root} ${partSelector(assistantMarkdownContract, "root")} table { border-collapse: collapse; display: block; max-width: 100%; overflow-x: auto; }
  ${root} ${partSelector(assistantMarkdownContract, "root")} :is(th, td) { padding: ${uiTokens.spaceGroup}; border: 1px solid ${uiTokens.borderSoft}; text-align: start; }
  ${root} ${partSelector(assistantMarkdownContract, "root")} a { color: ${uiTokens.info}; }
  ${partSelector(assistantViewContract, "latest")} { position: absolute; bottom: ${uiTokens.spaceGroup}; right: max(${uiTokens.spacePanel}, calc((100% - ${uiTokens.containerContent}) / 2 + ${uiTokens.spacePanel})); z-index: 1; }
  ${composer} { grid-area: composer; width: 100%; max-width: ${uiTokens.containerContent}; margin-inline: auto; padding: ${uiTokens.spaceGroup} ${uiTokens.spacePanel} max(${uiTokens.spaceSection}, env(safe-area-inset-bottom)); box-sizing: border-box; min-width: 0; }
  ${composer} ${partSelector(chatComposerContract, "input")} { min-height: 1.6em; max-height: min(30dvh, 240px); overflow-y: auto; }
  ${root} ${partSelector(assistantComposerContract, "choices")} { display: flex; align-items: center; flex-wrap: wrap; min-width: 0; gap: ${uiTokens.spaceGroup}; }
  ${root} ${partSelector(assistantComposerContract, "feedback")}, ${partSelector(assistantViewContract, "feedback")} { margin: ${uiTokens.spaceGroup} 0; color: ${uiTokens.mutedForeground}; font-size: ${uiTokens.fontCaption}; }
  ${partSelector(assistantViewContract, "empty")} { padding-block: ${uiTokens.spacePanel}; }
  ${partSelector(assistantViewContract, "empty")} h2 { font-size: ${uiTokens.fontPageTitle}; margin-block: ${uiTokens.spaceSection}; }
  ${partSelector(assistantStepsContract, "root")} { list-style: none; margin: 0; padding: 0; }
  ${partSelector(assistantStepsContract, "step")} { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: baseline; gap: ${uiTokens.spaceGroup}; padding-block: ${uiTokens.spaceGroup}; font-size: ${uiTokens.fontBody}; }
  ${partSelector(assistantStepsContract, "description")} { margin: 0; color: ${uiTokens.mutedForeground}; white-space: pre-wrap; }
  ${partSelector(assistantStepsContract, "status")} { color: ${uiTokens.mutedForeground}; font-size: ${uiTokens.fontCaption}; }
  ${panel} { grid-area: activity; position: static; width: 100%; height: 100%; max-width: none; max-height: none; margin: 0; padding: 0; box-sizing: border-box; border: 0; border-left: 1px solid ${uiTokens.borderSoft}; border-radius: 0; color: inherit; background: ${uiTokens.sidebarSurface}; overflow: hidden; }
  ${panel}[open] { display: flex; flex-direction: column; }
  ${partSelector(assistantViewContract, "activityHeader")} { display: flex; align-items: center; flex-wrap: wrap; gap: ${uiTokens.spaceGroup}; padding: ${uiTokens.spaceGroup} ${uiTokens.spaceSection}; border-bottom: 1px solid ${uiTokens.borderSoft}; flex: 0 0 auto; }
  ${partSelector(assistantViewContract, "activityHeader")} h2 { flex: 1; margin: 0; font-size: ${uiTokens.fontTitle}; }
  ${partSelector(assistantViewContract, "activityBody")}, ${partSelector(assistantViewContract, "workDetail")} { min-height: 0; overflow-y: auto; padding: ${uiTokens.spaceSection}; }
  ${partSelector(assistantViewContract, "section")} + ${partSelector(assistantViewContract, "section")} { margin-top: ${uiTokens.spacePanel}; }
  ${partSelector(assistantViewContract, "section")} h3 { font-size: ${uiTokens.fontBody}; margin: 0 0 ${uiTokens.spaceGroup}; }
  ${partSelector(assistantViewContract, "status")} { display: flex; align-items: center; gap: ${uiTokens.spaceGroup}; }
  ${panel} ${partSelector(workCardContract, "root")} { width: 100%; margin-block: ${uiTokens.spaceGroup}; }
  ${root} ${partSelector(assistantQuestionContract, "root")} { margin-block: ${uiTokens.spaceSection}; }
  ${root} ${partSelector(assistantQuestionContract, "answer")} { box-sizing: border-box; width: 100%; resize: vertical; min-height: ${uiTokens.controlLarge}; font: inherit; color: inherit; border: 1px solid ${uiTokens.border}; border-radius: ${uiTokens.controlRadius}; background: ${uiTokens.inputSurface}; padding: ${uiTokens.spaceGroup}; }
  ${root} ${partSelector(assistantQuestionContract, "options")} { margin-bottom: ${uiTokens.spaceGroup}; }
  ${root} [hidden] { display: none !important; }
  @container (max-width: 759px) {
    ${root}[data-activity-open="true"] ${layout} { grid-template-areas: "messages" "composer"; grid-template-columns: minmax(0, 1fr); }
    ${panel} { position: fixed; inset: 0; width: 100%; height: 100dvh; border: 0; }
    ${content} { padding-inline: ${uiTokens.pageInsetCompactInline}; }
    ${composer} { padding-inline: ${uiTokens.pageInsetCompactInline}; }
    ${partSelector(assistantViewContract, "latest")} { right: ${uiTokens.pageInsetCompactInline}; }
  }
  ${root} { container-type: inline-size; }
`;
