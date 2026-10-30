import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { CodeBlock } from "../../components/code-block";
import { ui } from "../utilities";
const codeBlock = parts<typeof CodeBlock>("code-block");
/*
 * One recessed surface: a compact header (name and language on the start edge, actions in the
 * corner) over the code. Header text and code share the same 16px start edge.
 */
export const codeBlockStyles = css`
  ${codeBlock.root} {
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
  /* Actions sit in the corner, a 6px inset matching the panel item radius; the name wraps beside them. */
  ${codeBlock.header} {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: ${uiTokens.space.group};
    padding: 6px 6px 0 16px;
    background: transparent;
  }
  ${codeBlock.heading} {
    display: flex;
    /* The name keeps a readable width; wide host actions move to their own row instead. */
    flex: 1 1 12rem;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 2px 10px;
    min-width: 0;
    /* Centers one caption line against the 28px actions. */
    padding-block: 5px;
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
  }
  ${codeBlock.title} {
    min-width: 0;
    color: ${uiTokens.ink.primary};
    font-weight: ${uiTokens.type.weight.medium};
    overflow-wrap: anywhere;
  }
  ${codeBlock.caption} {
    min-width: 0;
    color: ${uiTokens.ink.tertiary};
    overflow-wrap: anywhere;
  }
  ${codeBlock.language} {
    min-width: 0;
    color: ${uiTokens.ink.secondary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* After a name, the language is a quiet fact. */
  ${codeBlock.caption} + ${codeBlock.language},
  ${codeBlock.title} + ${codeBlock.language} {
    color: ${uiTokens.ink.tertiary};
  }
  ${codeBlock.actions} {
    display: flex;
    flex: 0 1 auto;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: 2px;
    margin-inline-start: auto;
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
  }
  ${codeBlock.actions} [aria-pressed="true"] {
    background: ${uiTokens.state.active};
    color: ${uiTokens.ink.primary};
  }
  ${codeBlock.copyIcon},
  ${codeBlock.copiedIcon} {
    display: inline-flex;
  }
  ${codeBlock.copiedIcon},
  ${codeBlock.actions} [data-copied="true"] ${codeBlock.copyIcon} {
    display: none;
  }
  ${codeBlock.actions} [data-copied="true"] ${codeBlock.copiedIcon} {
    display: inline-flex;
    color: ${uiTokens.status.success};
  }
  ${codeBlock.root} ${codeBlock.content} {
    margin: 0;
    padding: 6px 16px 16px;
    overflow: auto;
    border: 0;
    border-radius: 0;
    background: transparent;
    font: ${uiTokens.type.code} / ${uiTokens.type.line.code} ${uiTokens.type.mono};
    white-space: pre;
    overflow-wrap: normal;
    scrollbar-width: thin;
  }
  ${codeBlock.content}[data-wrap="true"] {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  ${codeBlock.root} ${codeBlock.code} {
    padding: 0;
    background: transparent;
    font: inherit;
    white-space: inherit;
  }
  /* Announced always; shown only for a failure, aligned with the code. */
  ${codeBlock.feedback} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ${codeBlock.feedback}[data-failed="true"] {
    position: static;
    display: block;
    width: auto;
    height: auto;
    padding: 0 16px 12px;
    clip-path: none;
    white-space: normal;
    color: ${uiTokens.status.danger};
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
  }
  ${codeBlock.content}:focus-visible {
    ${ui.focus.inset}
  }

  @media (pointer: coarse) {
    ${codeBlock.actions}[data-meowui-part] > * {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
