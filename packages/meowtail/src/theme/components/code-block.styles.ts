import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";
import { codeBlockContract } from "../../components/code-block.contract";

export const codeBlockStyles = css`
  ${partSelector(codeBlockContract, "root")} {
    min-width: 0;
    max-width: 100%;
    margin: 0;
    border: 0;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body}/${uiTokens.type.leading} ${uiTokens.type.sans};
    overflow: hidden;
  }
  ${partSelector(codeBlockContract, "header")} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    /* Host actions take the free space, so the original language/actions row is unchanged. */
    justify-content: flex-start;
    gap: 12px;
    padding: 8px 14px;
    border-bottom: 0;
    background: ${uiTokens.surface.fill};
  }
  ${partSelector(codeBlockContract, "title")} {
    min-width: 0;
    color: ${uiTokens.ink.primary};
    font: 500 ${uiTokens.type.caption}/${uiTokens.type.leading} ${uiTokens.type.sans};
    overflow-wrap: anywhere;
  }
  ${partSelector(codeBlockContract, "caption")} {
    min-width: 0;
    color: ${uiTokens.ink.tertiary};
    font: 400 ${uiTokens.type.caption}/${uiTokens.type.leading} ${uiTokens.type.sans};
    overflow-wrap: anywhere;
  }
  ${partSelector(codeBlockContract, "language")} {
    font: ${uiTokens.type.code}/18px ${uiTokens.type.mono};
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${partSelector(codeBlockContract, "actions")} {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: ${uiTokens.space.group};
    min-width: 0;
    flex-shrink: 1;
    margin-inline-start: auto;
    font: ${uiTokens.type.micro}/18px ${uiTokens.type.sans};
  }
  ${partSelector(codeBlockContract, "actions")} [aria-pressed="true"] {
    background: ${uiTokens.action.soft};
    color: ${uiTokens.action.primary};
  }
  ${partSelector(codeBlockContract, "root")} ${partSelector(codeBlockContract, "content")} {
    margin: 0;
    padding: 16px;
    overflow: auto;
    border: 0;
    border-radius: 0;
    background: transparent;
    font: ${uiTokens.type.code}/19px ${uiTokens.type.mono};
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
    padding: ${uiTokens.space.group} ${uiTokens.space.section};
    font-size: ${uiTokens.type.caption};
  }
  ${partSelector(codeBlockContract, "feedback")}:empty {
    display: none;
  }
  ${partSelector(codeBlockContract, "content")}:focus-visible {
    ${focusRing({ inset: true })}
  }

  @media (pointer: coarse) {
    ${partSelector(codeBlockContract, "actions")}[data-meowui-part] > * {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
