import { css, partSelector } from "meowcss/meowjsx";
import { chatTaskContract } from "../../chat/task";
import { uiTokens } from "../tokens";

const part = (name: (typeof chatTaskContract.parts)[number]) =>
  partSelector(chatTaskContract, name);

export const chatTaskStyles = css`
  ${part("root")} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-content: start;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
    max-width: 100%;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
    overflow-wrap: anywhere;
  }
  ${part("header")} {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: ${uiTokens.spaceGroup} ${uiTokens.spaceSection};
    min-width: 0;
  }
  ${part("title")} {
    flex: 1 1 14rem;
    min-width: 0;
    font-weight: 600;
  }
  ${part("status")} {
    display: inline-flex;
    align-items: baseline;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
    max-width: 100%;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
  }
  ${part("status")} > :first-child {
    flex: 0 0 auto;
  }
  ${part("description")}, ${part("execution")}, ${part("reply")} {
    min-width: 0;
    margin: 0;
    white-space: pre-wrap;
    color: ${uiTokens.mutedForeground};
  }
  ${part("progress")} {
    display: grid;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
  }
  ${part("progressBar")} {
    display: block;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    height: ${uiTokens.spaceGroup};
    accent-color: ${uiTokens.info};
  }
  ${part("body")} {
    display: grid;
    align-content: start;
    gap: ${uiTokens.spaceSection};
    box-sizing: border-box;
    min-width: 0;
    padding-inline-start: ${uiTokens.spaceSection};
    border-inline-start: 1px solid ${uiTokens.borderSoft};
  }
  ${part("body")} > :first-child {
    margin-block-start: 0;
  }
  ${part("body")} > :last-child {
    margin-block-end: 0;
  }
  ${part("footer")} {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
  }
  ${part("root")} > [hidden], ${part("body")}:empty, ${part("footer")}:empty {
    display: none;
  }
`;
