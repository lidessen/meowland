import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { codeHighlightTokens } from "../shared/code-highlight.tokens";
import { outputBlockContract as block } from "../../components/output-block";
import { readBlockContract as read } from "../../components/read-block.contract";
import { diffBlockContract as diff } from "../../components/diff-block";
import { searchBlockContract as search } from "../../components/search-block";
import { terminalBlockContract as terminal } from "../../components/terminal-block";

export const outputBlockStyles = css`
  ${partSelector(block, "root")} {
    min-width: 0;
    overflow: hidden;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
  }
  ${partSelector(block, "header")} {
    display: flex;
    align-items: start;
    gap: 12px;
    padding: 9px 14px;
    background: ${uiTokens.surface.fill};
    font: ${uiTokens.type.micro}/18px ${uiTokens.type.sans};
  }
  ${partSelector(block, "title")} {
    min-width: 0;
    flex: 1;
    overflow-wrap: anywhere;
  }
  ${partSelector(block, "actions")}, ${partSelector(block, "toggle")} {
    border: 0;
    background: transparent;
    color: ${uiTokens.ink.secondary};
    font: inherit;
    cursor: pointer;
    padding: 0;
  }
  ${partSelector(block, "body")} {
    padding: 12px 14px;
    overflow: auto;
    font: ${uiTokens.type.code}/22px ${uiTokens.type.mono};
  }
  ${partSelector(block, "line")} {
    min-height: 22px;
    white-space: pre;
  }
  ${partSelector(block, "root")}[data-output-wrap="true"] ${partSelector(block, "line")},
  ${partSelector(block, "root")}[data-output-wrap="true"] ${partSelector(block, "fold")} {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  ${partSelector(block, "fold")}[hidden] {
    display: none;
  }
  ${partSelector(block, "fold")} {
    white-space: pre;
  }
  ${partSelector(block, "fold")}:not([open]) [data-fold-open], ${partSelector(block, "fold")}[open] [data-fold-closed] {
    display: none;
  }
  ${partSelector(block, "feedback")} {
    display: block;
    padding: 4px 14px;
    font: ${uiTokens.type.caption}/18px ${uiTokens.type.sans};
  }
  ${partSelector(block, "feedback")}:empty {
    display: none;
  }
  ${partSelector(block, "actions")}:focus-visible, ${partSelector(block, "toggle")}:focus-visible, ${partSelector(block, "body")}:focus-visible {
    outline: 1.5px solid ${uiTokens.state.focus};
    outline-offset: -1px;
  }
  ${partSelector(read, "number")} {
    display: inline-block;
    min-width: 4ch;
    margin-right: 12px;
    text-align: right;
    color: ${uiTokens.ink.tertiary};
    user-select: none;
  }
  ${partSelector(read, "root")} [data-read-highlight="true"] {
    background: ${uiTokens.state.hover};
    box-shadow: inset 3px 0 ${uiTokens.status.info};
  }
  ${partSelector(diff, "line")}[data-diff-kind="added"] {
    color: ${uiTokens.status.success};
    background: color-mix(in srgb, ${uiTokens.status.success} 10%, transparent);
    box-shadow: inset 3px 0 ${uiTokens.status.success};
  }
  ${partSelector(diff, "line")}[data-diff-kind="removed"] {
    color: ${uiTokens.status.danger};
    background: color-mix(in srgb, ${uiTokens.status.danger} 10%, transparent);
    box-shadow: inset 3px 0 ${uiTokens.status.danger};
  }
  ${partSelector(diff, "path")}, ${partSelector(search, "path")} {
    font-weight: 500;
  }
  :where(${partSelector(read, "root")}, ${partSelector(diff, "root")}) ${partSelector(block, "header")} {
    padding: 10px 18px 8px 22px;
    color: ${uiTokens.ink.secondary};
  }
  :where(${partSelector(read, "root")}, ${partSelector(diff, "root")}) ${partSelector(block, "body")} {
    padding: 6px 22px 20px;
    font: ${uiTokens.type.code}/19px ${uiTokens.type.mono};
  }
  :where(${partSelector(read, "root")}, ${partSelector(diff, "root")}) ${partSelector(block, "line")} {
    min-height: 19px;
  }
  ${partSelector(diff, "root")} ${partSelector(block, "body")} {
    padding-inline: 0;
    display: grid;
    grid-template-columns: minmax(max-content, 1fr);
  }
  ${partSelector(diff, "line")}, ${partSelector(diff, "path")}, ${partSelector(diff, "root")} ${partSelector(block, "toggle")} {
    padding-inline: 22px;
  }
  ${partSelector(diff, "line")}[data-diff-kind="context"] {
    color: ${uiTokens.ink.secondary};
  }
  ${partSelector(search, "root")} ${partSelector(block, "header")} {
    align-items: center;
    font: ${uiTokens.type.label}/20px ${uiTokens.type.sans};
    color: ${uiTokens.ink.secondary};
  }
  ${partSelector(search, "root")} ${partSelector(block, "title")} {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${partSelector(search, "root")} ${partSelector(block, "body")} {
    padding: 8px 14px 12px 0;
    font: ${uiTokens.type.code}/19px ${uiTokens.type.mono};
  }
  ${partSelector(search, "root")} ${partSelector(block, "line")} {
    padding-left: 14px;
  }
  ${partSelector(search, "path")}:is(summary) {
    cursor: pointer;
  }
  ${partSelector(search, "number")} {
    color: ${uiTokens.ink.tertiary};
  }
  ${partSelector(terminal, "command")} {
    margin: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre;
    font: ${uiTokens.type.code}/22px ${uiTokens.type.mono};
  }
  ${partSelector(terminal, "root")} ${partSelector(block, "header")} {
    padding-left: 30px;
    max-height: 150px;
    overflow-y: auto;
    background: ${uiTokens.surface.fill};
  }
  ${partSelector(terminal, "root")} ${partSelector(block, "title")} > div {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
  }
  ${partSelector(terminal, "root")}[data-terminal-body="true"] ${partSelector(block, "header")} {
    border-bottom: 1px solid ${uiTokens.line.divider};
  }
  ${partSelector(terminal, "root")} ${partSelector(block, "body")} {
    padding-left: 30px;
    max-height: var(--ui-terminal-output-max-height, none);
  }
  ${partSelector(terminal, "root")}[data-terminal-body="false"] ${partSelector(block, "body")} {
    display: none;
  }
  ${partSelector(terminal, "prompt")} {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  ${partSelector(terminal, "promptLine")} {
    position: relative;
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
    font: ${uiTokens.type.code}/22px ${uiTokens.type.mono};
  }
  ${partSelector(terminal, "cwd")} {
    flex: none;
    color: ${uiTokens.ink.tertiary};
  }
  ${partSelector(terminal, "runState")} {
    position: absolute;
    left: -22px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
  }
  ${partSelector(terminal, "runStateLabel")} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ${partSelector(terminal, "status")} {
    flex: none;
    font: ${uiTokens.type.micro}/22px ${uiTokens.type.sans};
    color: ${uiTokens.ink.tertiary};
  }
  ${partSelector(terminal, "status")}[data-terminal-error="true"] {
    color: ${uiTokens.status.danger};
  }
  ${partSelector(terminal, "span")}[data-ansi-bold="true"] {
    font-weight: 700;
  }
  ${partSelector(terminal, "span")}:is([data-ansi-color="31"], [data-ansi-color="91"]) {
    color: ${uiTokens.status.danger};
  }
  ${partSelector(terminal, "span")}:is([data-ansi-color="32"], [data-ansi-color="92"]) {
    color: ${uiTokens.status.success};
  }
  ${partSelector(terminal, "span")}:is([data-ansi-color="33"], [data-ansi-color="93"]) {
    color: ${uiTokens.status.warning};
  }
  ${partSelector(terminal, "span")}:is([data-ansi-color="34"], [data-ansi-color="94"], [data-ansi-color="36"], [data-ansi-color="96"]) {
    color: ${uiTokens.status.info};
  }
  ${partSelector(terminal, "span")}:is([data-ansi-color="35"], [data-ansi-color="95"]) {
    color: ${codeHighlightTokens.function};
  }
  ${partSelector(terminal, "span")}[data-ansi-color="90"] {
    color: ${uiTokens.ink.tertiary};
  }

  @media (pointer: coarse) {
    ${partSelector(block, "actions")}[data-meowui-part],
    ${partSelector(block, "toggle")}[data-meowui-part] {
      min-width: 44px;
      min-height: 44px;
      padding: 0 6px;
    }
  }

  /* Native summaries draw the same rotating chevron as Disclosure. */
  :where(${partSelector(block, "toggle")}) {
    display: flex;
    align-items: center;
    gap: 6px;
    list-style: none;
  }
  :where(${partSelector(block, "toggle")})::-webkit-details-marker {
    display: none;
  }
  :where(${partSelector(block, "toggle")})::before {
    content: "";
    flex: none;
    width: 14px;
    height: 14px;
    background: currentColor;
    mask: ${uiTokens.glyph.chevron} center / 14px 14px no-repeat;
    transition: transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  :where(details[open] > ${partSelector(block, "toggle")})::before {
    transform: rotate(90deg);
  }
  @media (prefers-reduced-motion: reduce) {
    :where(${partSelector(block, "toggle")})::before {
      transition: none;
    }
  }
`;
