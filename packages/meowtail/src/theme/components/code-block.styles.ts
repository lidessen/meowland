import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { CodeBlock } from "../../components/code-block";
import { ui } from "../utilities";
const codeBlockPartRefs = parts<typeof CodeBlock>("code-block");
export const codeBlockStyles = css`
  ${codeBlockPartRefs.root} {
    min-width: 0;
    max-width: 100%;
    margin: 0;
    border: 0;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
    overflow: hidden;
  }
  ${codeBlockPartRefs.header} {
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
  ${codeBlockPartRefs.title} {
    min-width: 0;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.weight.medium} ${uiTokens.type.caption} / ${uiTokens.type.leading}
      ${uiTokens.type.sans};
    overflow-wrap: anywhere;
  }
  ${codeBlockPartRefs.caption} {
    min-width: 0;
    color: ${uiTokens.ink.tertiary};
    font: ${uiTokens.type.weight.regular} ${uiTokens.type.caption} / ${uiTokens.type.leading}
      ${uiTokens.type.sans};
    overflow-wrap: anywhere;
  }
  ${codeBlockPartRefs.language} {
    font: ${uiTokens.type.code} / ${uiTokens.type.line.code} ${uiTokens.type.mono};
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${codeBlockPartRefs.actions} {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: ${uiTokens.space.group};
    min-width: 0;
    flex-shrink: 1;
    margin-inline-start: auto;
    font: ${uiTokens.type.micro} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
  }
  ${codeBlockPartRefs.actions} [aria-pressed="true"] {
    background: ${uiTokens.action.soft};
    color: ${uiTokens.action.primary};
  }
  ${codeBlockPartRefs.root} ${codeBlockPartRefs.content} {
    margin: 0;
    padding: 16px;
    overflow: auto;
    border: 0;
    border-radius: 0;
    background: transparent;
    font: ${uiTokens.type.code} / ${uiTokens.type.line.code} ${uiTokens.type.mono};
    white-space: pre;
    overflow-wrap: normal;
  }
  ${codeBlockPartRefs.content}[data-wrap="true"] {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  ${codeBlockPartRefs.root} ${codeBlockPartRefs.code} {
    padding: 0;
    background: transparent;
    font: inherit;
    white-space: inherit;
  }
  ${codeBlockPartRefs.feedback} {
    display: block;
    padding: ${uiTokens.space.group} ${uiTokens.space.section};
    font-size: ${uiTokens.type.caption};
  }
  ${codeBlockPartRefs.feedback}:empty {
    display: none;
  }
  ${codeBlockPartRefs.content}:focus-visible {
    ${ui.focus.inset}
  }

  @media (pointer: coarse) {
    ${codeBlockPartRefs.actions}[data-meowui-part] > * {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
