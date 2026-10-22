import { css, partSelector } from "meowcss/meowjsx";
import { chatTokens, uiTokens } from "../tokens";
import { lineTokens, layerTokens } from "../palette";
import { chatQuestionContract } from "../../chat/question";

export const chatQuestionStyles = css`
  ${partSelector(chatQuestionContract, "root")} {
    box-sizing: border-box;
    width: 100%;
    max-width: 38rem;
    padding: 16px 20px;
    border: ${lineTokens.width} solid ${lineTokens.edge};
    box-shadow: ${uiTokens.shadowRaised};
    border-radius: ${uiTokens.radiusLarge};
    background: ${layerTokens.raised};
    color: ${uiTokens.foreground};
    font: ${chatTokens.fontBody}/24px ${uiTokens.font};
  }
  ${partSelector(chatQuestionContract, "root")}[hidden] {
    display: none;
  }
  ${partSelector(chatQuestionContract, "eyebrow")} {
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
    font-weight: 500;
    margin-bottom: ${uiTokens.spaceGroup};
  }
  ${partSelector(chatQuestionContract, "title")} {
    margin: 0;
    font-size: ${uiTokens.fontBody};
    font-weight: 500;
    line-height: 24px;
    overflow-wrap: anywhere;
  }
  ${partSelector(chatQuestionContract, "description")} {
    margin: ${uiTokens.spaceGroup} 0 0;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontBody};
    line-height: ${uiTokens.leading};
  }
  ${partSelector(chatQuestionContract, "content")} {
    margin-top: 16px;
    min-width: 0;
  }
  ${partSelector(chatQuestionContract, "feedback")} {
    margin-top: ${uiTokens.spaceSection};
    font-size: ${uiTokens.fontBody};
    line-height: ${uiTokens.leading};
  }
  ${partSelector(chatQuestionContract, "feedback")}:has(> [hidden]:only-child) {
    display: none;
  }
  ${partSelector(chatQuestionContract, "actions")} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    margin-top: ${uiTokens.spaceSection};
  }
`;
