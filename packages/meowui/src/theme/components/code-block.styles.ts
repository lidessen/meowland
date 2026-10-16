import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { codeBlockContract } from "../../components/code-block";

export const codeBlockStyles = css`
  ${partSelector(codeBlockContract, "root")} {
    min-width: 0;
    max-width: 100%;
    margin: 0;
    border: 0;
    border-radius: ${uiTokens.radiusLarge};
    background: ${uiTokens.codeSurface};
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
    overflow: hidden;
  }
  ${partSelector(codeBlockContract, "header")} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 14px;
    border-bottom: 0;
    background: ${uiTokens.codeBanner};
  }
  ${partSelector(codeBlockContract, "language")} {
    font: 11px/18px ${uiTokens.mono};
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${partSelector(codeBlockContract, "actions")} {
    display: flex;
    flex-wrap: wrap;
    gap: ${uiTokens.spaceGroup};
    flex-shrink: 0;
    font: 11px/18px ${uiTokens.font};
  }
  ${partSelector(codeBlockContract, "actions")} [aria-pressed="true"] {
    background: ${uiTokens.primarySoft};
    color: ${uiTokens.primary};
  }
  ${partSelector(codeBlockContract, "root")} ${partSelector(codeBlockContract, "content")} {
    margin: 0;
    padding: 16px;
    overflow: auto;
    border: 0;
    border-radius: 0;
    background: transparent;
    font: 11px/19px ${uiTokens.mono};
    white-space: pre;
    overflow-wrap: normal;
  }
  ${partSelector(codeBlockContract, "content")}[data-wrap="true"] {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  ${partSelector(codeBlockContract, "root")} ${partSelector(codeBlockContract, "code")} {
    padding: 0;
    background: transparent;
    font: inherit;
    white-space: inherit;
  }
  ${partSelector(codeBlockContract, "feedback")} {
    display: block;
    padding: ${uiTokens.spaceGroup} ${uiTokens.spaceSection};
    font-size: ${uiTokens.fontCaption};
  }
  ${partSelector(codeBlockContract, "feedback")}:empty {
    display: none;
  }
  ${partSelector(codeBlockContract, "content")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: -2px;
  }
`;
