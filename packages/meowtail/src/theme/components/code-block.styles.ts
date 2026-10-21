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
    /* Host actions take the free space, so the original language/actions row is unchanged. */
    justify-content: flex-start;
    gap: 12px;
    padding: 9px 14px;
    border-bottom: 0;
    background: ${uiTokens.codeBanner};
  }
  ${partSelector(codeBlockContract, "title")} {
    min-width: 0;
    color: ${uiTokens.foreground};
    font: 500 ${uiTokens.fontCaption}/${uiTokens.leading} ${uiTokens.font};
    overflow-wrap: anywhere;
  }
  ${partSelector(codeBlockContract, "caption")} {
    min-width: 0;
    color: ${uiTokens.captionForeground};
    font: 400 ${uiTokens.fontCaption}/${uiTokens.leading} ${uiTokens.font};
    overflow-wrap: anywhere;
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
    justify-content: flex-end;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
    flex-shrink: 1;
    margin-inline-start: auto;
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

  @media (pointer: coarse) {
    ${partSelector(codeBlockContract, "actions")}[data-meowui-part] > * {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
