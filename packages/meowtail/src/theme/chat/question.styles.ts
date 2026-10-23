import { css, partSelector } from "meowcss/meowjsx";
import { chatTokens, uiTokens } from "../tokens";
import { chatQuestionContract } from "../../chat/question";

export const chatQuestionStyles = css`
  ${partSelector(chatQuestionContract, "root")} {
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
  ${partSelector(chatQuestionContract, "root")}[hidden] {
    display: none;
  }
  ${partSelector(chatQuestionContract, "eyebrow")} {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    font-weight: ${uiTokens.type.weight.medium};
    margin-bottom: ${uiTokens.space.group};
  }
  ${partSelector(chatQuestionContract, "title")} {
    margin: 0;
    font-size: ${uiTokens.type.body};
    font-weight: ${uiTokens.type.weight.medium};
    line-height: ${uiTokens.type.line.reading};
    overflow-wrap: anywhere;
  }
  ${partSelector(chatQuestionContract, "description")} {
    margin: ${uiTokens.space.group} 0 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.leading};
  }
  ${partSelector(chatQuestionContract, "content")} {
    margin-top: 16px;
    min-width: 0;
  }
  ${partSelector(chatQuestionContract, "feedback")} {
    margin-top: ${uiTokens.space.section};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.leading};
  }
  ${partSelector(chatQuestionContract, "feedback")}:has(> [hidden]:only-child) {
    display: none;
  }
  ${partSelector(chatQuestionContract, "actions")} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${uiTokens.space.group};
    margin-top: ${uiTokens.space.section};
  }
`;
