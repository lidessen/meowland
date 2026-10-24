import { css, parts } from "meowcss/meowjsx";
import { chatTokens, uiTokens } from "../tokens";

import type { ChatQuestion } from "../../chat/question";
const chatQuestionPartRefs = parts<typeof ChatQuestion>("chat-question");
export const chatQuestionStyles = css`
  ${chatQuestionPartRefs.root} {
    box-sizing: border-box;
    width: 100%;
    max-width: 38rem;
    padding: 16px 20px;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    box-shadow: ${uiTokens.shadow.raised};
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.raised};
    color: ${uiTokens.ink.primary};
    font: ${chatTokens.fontBody} / ${chatTokens.leading} ${uiTokens.type.sans};
  }
  ${chatQuestionPartRefs.root}[hidden] {
    display: none;
  }
  ${chatQuestionPartRefs.eyebrow} {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    font-weight: ${uiTokens.type.weight.medium};
    margin-bottom: ${uiTokens.space.group};
  }
  ${chatQuestionPartRefs.title} {
    margin: 0;
    font-size: ${uiTokens.type.body};
    font-weight: ${uiTokens.type.weight.medium};
    line-height: ${uiTokens.type.line.reading};
    overflow-wrap: anywhere;
  }
  ${chatQuestionPartRefs.description} {
    margin: ${uiTokens.space.group} 0 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.leading};
  }
  ${chatQuestionPartRefs.content} {
    margin-top: 16px;
    min-width: 0;
  }
  ${chatQuestionPartRefs.feedback} {
    margin-top: ${uiTokens.space.section};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.leading};
  }
  ${chatQuestionPartRefs.feedback}:has(> [hidden]:only-child) {
    display: none;
  }
  ${chatQuestionPartRefs.actions} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${uiTokens.space.group};
    margin-top: ${uiTokens.space.section};
  }
`;
