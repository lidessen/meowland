import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { chatHeaderContract } from "../../chat/header";

export const chatHeaderStyles = css`
  ${partSelector(chatHeaderContract, "root")} {
    display: flex;
    flex-wrap: wrap;
    gap: ${uiTokens.space.section};
    align-items: center;
    padding: 10px 28px 10px 20px;
    border-bottom: 1px solid ${uiTokens.line.edge};
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
    gap: ${uiTokens.space.group};
    margin-inline-start: auto;
    min-width: 0;
  }

  ${partSelector(chatHeaderContract, "eyebrow")} {
    display: block;
    margin-bottom: 4px;
    color: ${uiTokens.ink.tertiary};
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.caption};
    font-weight: 400;
  }

  ${partSelector(chatHeaderContract, "title")} {
    margin: 0;
    font-size: ${uiTokens.type.body};
    font-weight: 500;
    line-height: 20px;
  }

  ${partSelector(chatHeaderContract, "description")} {
    max-width: 560px;
    margin: 4px 0 0;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.label};
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
      gap: ${uiTokens.space.group};
      padding: ${uiTokens.space.section};
    }

    ${partSelector(chatHeaderContract, "controls")} {
      width: 100%;
      justify-content: space-between;
    }

    ${partSelector(chatHeaderContract, "description")} {
      font-size: ${uiTokens.type.caption};
    }
  }

  @media (max-width: 360px) and (max-height: 700px) {
    ${partSelector(chatHeaderContract, "root")} {
      gap: ${uiTokens.space.group};
      padding: ${uiTokens.space.section};
    }

    ${partSelector(chatHeaderContract, "title")} {
      font-size: ${uiTokens.type.body};
    }

    ${partSelector(chatHeaderContract, "description")} {
      font-size: ${uiTokens.type.caption};
      line-height: 1.45;
    }
  }
`;
