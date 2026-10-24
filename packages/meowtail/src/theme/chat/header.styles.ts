import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { ChatHeader } from "../../chat/header";
const chatHeaderPartRefs = parts<typeof ChatHeader>("chat-header");
export const chatHeaderStyles = css`
  ${chatHeaderPartRefs.root} {
    display: flex;
    flex-wrap: wrap;
    gap: ${uiTokens.space.section};
    align-items: center;
    padding: 10px 28px 10px 20px;
    border-bottom: 1px solid ${uiTokens.line.edge};
  }

  ${chatHeaderPartRefs.identity} {
    min-width: 0;
    flex: 1 1 240px;
    overflow-wrap: anywhere;
  }

  ${chatHeaderPartRefs.controls} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${uiTokens.space.group};
    margin-inline-start: auto;
    min-width: 0;
  }

  ${chatHeaderPartRefs.eyebrow} {
    display: block;
    margin-bottom: 4px;
    color: ${uiTokens.ink.tertiary};
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.caption};
    font-weight: ${uiTokens.type.weight.regular};
  }

  ${chatHeaderPartRefs.title} {
    margin: 0;
    font-size: ${uiTokens.type.body};
    font-weight: ${uiTokens.type.weight.medium};
    line-height: ${uiTokens.type.line.bodyCompact};
  }

  ${chatHeaderPartRefs.description} {
    max-width: 560px;
    margin: 4px 0 0;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.label};
    line-height: ${uiTokens.type.line.label};
  }

  ${chatHeaderPartRefs.status} {
    white-space: nowrap;
  }

  ${chatHeaderPartRefs.actions} {
    display: flex;
    align-items: center;
  }

  @media (max-width: 680px) {
    ${chatHeaderPartRefs.root} {
      gap: ${uiTokens.space.group};
      padding: ${uiTokens.space.section};
    }

    ${chatHeaderPartRefs.controls} {
      width: 100%;
      justify-content: space-between;
    }

    ${chatHeaderPartRefs.description} {
      font-size: ${uiTokens.type.caption};
    }
  }

  @media (max-width: 360px) and (max-height: 700px) {
    ${chatHeaderPartRefs.root} {
      gap: ${uiTokens.space.group};
      padding: ${uiTokens.space.section};
    }

    ${chatHeaderPartRefs.title} {
      font-size: ${uiTokens.type.body};
    }

    ${chatHeaderPartRefs.description} {
      font-size: ${uiTokens.type.caption};
      line-height: ${uiTokens.type.line.caption};
    }
  }
`;
