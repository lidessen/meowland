import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { chatHeaderContract } from "../../chat/header";

export const chatHeaderStyles = css`
  ${partSelector(chatHeaderContract, "root")} {
    display: flex;
    flex-wrap: wrap;
    gap: ${uiTokens.spaceSection};
    align-items: center;
    padding: 10px 28px 10px 20px;
    border-bottom: 0.5px solid ${uiTokens.borderSubtle};
  }

  ${partSelector(chatHeaderContract, "identity")} {
    min-width: 0;
    flex: 1 1 240px;
    overflow-wrap: anywhere;
  }

  ${partSelector(chatHeaderContract, "controls")} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    margin-inline-start: auto;
    min-width: 0;
  }

  ${partSelector(chatHeaderContract, "eyebrow")} {
    display: block;
    margin-bottom: 4px;
    color: ${uiTokens.subtleForeground};
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontCaption};
    font-weight: 400;
  }

  ${partSelector(chatHeaderContract, "title")} {
    margin: 0;
    font-size: ${uiTokens.fontBody};
    font-weight: 500;
    line-height: 20px;
  }

  ${partSelector(chatHeaderContract, "description")} {
    max-width: 560px;
    margin: 4px 0 0;
    color: ${uiTokens.subtleForeground};
    font-size: 13px;
    line-height: 20px;
  }

  ${partSelector(chatHeaderContract, "status")} {
    white-space: nowrap;
  }

  ${partSelector(chatHeaderContract, "actions")} {
    display: flex;
    align-items: center;
  }

  @media (max-width: 680px) {
    ${partSelector(chatHeaderContract, "root")} {
      gap: ${uiTokens.spaceGroup};
      padding: ${uiTokens.spaceSection};
    }

    ${partSelector(chatHeaderContract, "controls")} {
      width: 100%;
      justify-content: space-between;
    }

    ${partSelector(chatHeaderContract, "description")} {
      font-size: ${uiTokens.fontCaption};
    }
  }

  @media (max-width: 360px) and (max-height: 700px) {
    ${partSelector(chatHeaderContract, "root")} {
      gap: ${uiTokens.spaceGroup};
      padding: ${uiTokens.spaceSection};
    }

    ${partSelector(chatHeaderContract, "title")} {
      font-size: ${uiTokens.fontBody};
    }

    ${partSelector(chatHeaderContract, "description")} {
      font-size: ${uiTokens.fontCaption};
      line-height: 1.45;
    }
  }
`;
