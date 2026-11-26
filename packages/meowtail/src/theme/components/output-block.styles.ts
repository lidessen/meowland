import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { DiffBlock } from "../../components/diff-block";
import type { OutputBlock } from "../../components/output-block";
import type { ReadBlock } from "../../components/read-block";
import type { SearchBlock } from "../../components/search-block";
import type { StatusDot } from "../../components/status-dot";
import type { StateDot } from "../../components/state-dot";
import type { TerminalBlock } from "../../components/terminal-block";
import { ui } from "../utilities";
const outputBlockPartRefs = parts<typeof OutputBlock>("output-block");
const diffBlockPartRefs = parts<typeof DiffBlock>("diff-block");
const readBlockPartRefs = parts<typeof ReadBlock>("read-block");
const searchBlockPartRefs = parts<typeof SearchBlock>("search-block");
const statusDotPartRefs = parts<typeof StatusDot>("status-dot");
const stateDotPartRefs = parts<typeof StateDot>("state-dot");
const terminalBlockPartRefs = parts<typeof TerminalBlock>("terminal-block");
export const outputBlockStyles = css`
  ${outputBlockPartRefs.root} {
    min-width: 0;
    overflow: hidden;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
  }
  ${outputBlockPartRefs.header} {
    display: flex;
    align-items: start;
    gap: 12px;
    padding: 8px 14px;
    background: ${uiTokens.surface.fill};
    font: ${uiTokens.type.micro} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
  }
  ${outputBlockPartRefs.title} {
    min-width: 0;
    flex: 1;
    overflow-wrap: anywhere;
  }
  ${outputBlockPartRefs.actions}, ${outputBlockPartRefs.toggle} {
    border: 0;
    background: transparent;
    color: ${uiTokens.ink.secondary};
    font: inherit;
    cursor: pointer;
    padding: 0;
  }
  ${outputBlockPartRefs.body} {
    padding: 12px 14px;
    overflow: auto;
    font: ${uiTokens.type.code} / ${uiTokens.type.line.body} ${uiTokens.type.mono};
  }
  ${outputBlockPartRefs.line} {
    min-height: 22px;
    white-space: pre;
  }
  ${outputBlockPartRefs.root}[data-output-wrap="true"] ${outputBlockPartRefs.line},
  ${outputBlockPartRefs.root}[data-output-wrap="true"] ${outputBlockPartRefs.fold} {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  ${outputBlockPartRefs.fold}[hidden] {
    display: none;
  }
  ${outputBlockPartRefs.fold} {
    white-space: pre;
  }
  ${outputBlockPartRefs.fold}:not([open]) [data-fold-open], ${outputBlockPartRefs.fold}[open] [data-fold-closed] {
    display: none;
  }
  ${outputBlockPartRefs.feedback} {
    display: block;
    padding: 4px 14px;
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
  }
  ${outputBlockPartRefs.feedback}:empty {
    display: none;
  }
  ${outputBlockPartRefs.actions}:focus-visible, ${outputBlockPartRefs.toggle}:focus-visible, ${outputBlockPartRefs.body}:focus-visible {
    ${ui.focus.inset}
  }
  ${readBlockPartRefs.number} {
    display: inline-block;
    min-width: 4ch;
    margin-right: 12px;
    text-align: right;
    color: ${uiTokens.ink.tertiary};
    user-select: none;
  }
  ${readBlockPartRefs.root} [data-read-highlight="true"] {
    background: ${uiTokens.state.hover};
    box-shadow: inset 3px 0 ${uiTokens.status.info};
  }
  ${diffBlockPartRefs.line}[data-diff-kind="added"] {
    color: ${uiTokens.status.success};
    background: color-mix(in srgb, ${uiTokens.status.success} 10%, transparent);
    box-shadow: inset 3px 0 ${uiTokens.status.success};
  }
  ${diffBlockPartRefs.line}[data-diff-kind="removed"] {
    color: ${uiTokens.status.danger};
    background: color-mix(in srgb, ${uiTokens.status.danger} 10%, transparent);
    box-shadow: inset 3px 0 ${uiTokens.status.danger};
  }
  ${diffBlockPartRefs.path}, ${searchBlockPartRefs.path} {
    font-weight: ${uiTokens.type.weight.medium};
  }
  :where(${readBlockPartRefs.root}, ${diffBlockPartRefs.root}) ${outputBlockPartRefs.header} {
    padding: 10px 18px 8px 22px;
    color: ${uiTokens.ink.secondary};
  }
  :where(${readBlockPartRefs.root}, ${diffBlockPartRefs.root}) ${outputBlockPartRefs.body} {
    padding: 6px 22px 20px;
    font: ${uiTokens.type.code} / ${uiTokens.type.line.code} ${uiTokens.type.mono};
  }
  :where(${readBlockPartRefs.root}, ${diffBlockPartRefs.root}) ${outputBlockPartRefs.line} {
    min-height: 19px;
  }
  ${diffBlockPartRefs.root} ${outputBlockPartRefs.body} {
    padding-inline: 0;
    display: grid;
    grid-template-columns: minmax(max-content, 1fr);
  }
  ${diffBlockPartRefs.line}, ${diffBlockPartRefs.path}, ${diffBlockPartRefs.root} ${outputBlockPartRefs.toggle} {
    padding-inline: 22px;
  }
  ${diffBlockPartRefs.line}[data-diff-kind="context"] {
    color: ${uiTokens.ink.secondary};
  }
  ${searchBlockPartRefs.root} ${outputBlockPartRefs.header} {
    align-items: center;
    font: ${uiTokens.type.label} / ${uiTokens.type.line.label} ${uiTokens.type.sans};
    color: ${uiTokens.ink.secondary};
  }
  ${searchBlockPartRefs.root} ${outputBlockPartRefs.title} {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${searchBlockPartRefs.root} ${outputBlockPartRefs.body} {
    padding: 8px 14px 12px 0;
    font: ${uiTokens.type.code} / ${uiTokens.type.line.code} ${uiTokens.type.mono};
  }
  ${searchBlockPartRefs.root} ${outputBlockPartRefs.line} {
    padding-left: 14px;
  }
  ${searchBlockPartRefs.path}:is(summary) {
    cursor: pointer;
  }
  ${searchBlockPartRefs.number} {
    color: ${uiTokens.ink.tertiary};
  }
  ${terminalBlockPartRefs.root} ${outputBlockPartRefs.root} {
    background: ${uiTokens.terminal.surface};
    color: ${uiTokens.terminal.ink};
  }
  ${terminalBlockPartRefs.root} :is(${outputBlockPartRefs.actions}, ${outputBlockPartRefs.toggle}) {
    color: ${uiTokens.terminal.muted};
  }
  ${terminalBlockPartRefs.root} :is(${outputBlockPartRefs.actions}, ${outputBlockPartRefs.toggle}, ${outputBlockPartRefs.body}):focus-visible {
    outline-color: ${uiTokens.terminal.focus};
  }
  ${terminalBlockPartRefs.status}[data-tone="danger"] {
    color: ${uiTokens.terminal.danger};
    background: color-mix(in srgb, ${uiTokens.terminal.danger} 10%, transparent);
  }
  ${terminalBlockPartRefs.status}[data-tone="danger"] > ${statusDotPartRefs.root} {
    background: currentColor;
  }
  ${terminalBlockPartRefs.runState} ${stateDotPartRefs.root}[data-state="done"] {
    color: ${uiTokens.terminal.success};
  }
  ${terminalBlockPartRefs.runState} ${stateDotPartRefs.root}[data-state="warning"] {
    color: ${uiTokens.terminal.warning};
  }
  ${terminalBlockPartRefs.command} {
    color: ${uiTokens.terminal.command};
    margin: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre;
    font: ${uiTokens.type.code} / ${uiTokens.type.line.body} ${uiTokens.type.mono};
  }
  ${terminalBlockPartRefs.root} ${outputBlockPartRefs.header} {
    padding-left: 30px;
    max-height: 150px;
    overflow-y: auto;
    background: ${uiTokens.terminal.surface};
  }
  ${terminalBlockPartRefs.root} ${outputBlockPartRefs.title} > div {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
  }
  ${terminalBlockPartRefs.root}[data-terminal-body="true"] ${outputBlockPartRefs.header} {
    border-bottom: 1px solid ${uiTokens.terminal.divider};
  }
  ${terminalBlockPartRefs.root} ${outputBlockPartRefs.body} {
    padding-left: 30px;
    max-height: var(--ui-terminal-output-max-height, none);
  }
  ${terminalBlockPartRefs.root}[data-terminal-body="false"] ${outputBlockPartRefs.body} {
    display: none;
  }
  ${terminalBlockPartRefs.prompt} {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  ${terminalBlockPartRefs.promptLine} {
    position: relative;
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
    font: ${uiTokens.type.code} / ${uiTokens.type.line.body} ${uiTokens.type.mono};
  }
  ${terminalBlockPartRefs.cwd} {
    flex: none;
    color: ${uiTokens.terminal.prompt};
  }
  ${terminalBlockPartRefs.runState} {
    position: absolute;
    left: -22px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
  }
  ${terminalBlockPartRefs.runStateLabel} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  /* The finished-but-not-clean state is the shared badge; the prompt's own dot steps aside for it. */
  ${terminalBlockPartRefs.prompt}:has(+ ${terminalBlockPartRefs.status}) ${terminalBlockPartRefs.runState} {
    display: none;
  }
  ${terminalBlockPartRefs.span}[data-ansi-bold="true"] {
    font-weight: ${uiTokens.type.weight.semibold};
  }
  ${terminalBlockPartRefs.span}:is([data-ansi-color="31"], [data-ansi-color="91"]) {
    color: ${uiTokens.terminal.danger};
  }
  ${terminalBlockPartRefs.span}:is([data-ansi-color="32"], [data-ansi-color="92"]) {
    color: ${uiTokens.terminal.success};
  }
  ${terminalBlockPartRefs.span}:is([data-ansi-color="33"], [data-ansi-color="93"]) {
    color: ${uiTokens.terminal.warning};
  }
  ${terminalBlockPartRefs.span}:is([data-ansi-color="34"], [data-ansi-color="94"], [data-ansi-color="36"], [data-ansi-color="96"]) {
    color: ${uiTokens.terminal.info};
  }
  ${terminalBlockPartRefs.span}:is([data-ansi-color="35"], [data-ansi-color="95"]) {
    color: ${uiTokens.terminal.reference};
  }
  ${terminalBlockPartRefs.span}[data-ansi-color="90"] {
    color: ${uiTokens.terminal.muted};
  }

  @media (pointer: coarse) {
    ${outputBlockPartRefs.actions}[data-meowui-part],
    ${outputBlockPartRefs.toggle}[data-meowui-part] {
      min-width: 44px;
      min-height: 44px;
      padding: 0 6px;
    }
  }

  /* Native summaries draw the same rotating chevron as Disclosure. */
  :where(${outputBlockPartRefs.toggle}) {
    display: flex;
    align-items: center;
    gap: 6px;
    list-style: none;
  }
  :where(${outputBlockPartRefs.toggle})::-webkit-details-marker {
    display: none;
  }
  :where(${outputBlockPartRefs.toggle})::before {
    content: "";
    flex: none;
    width: 14px;
    height: 14px;
    background: currentColor;
    mask: ${uiTokens.glyph.chevron} center / 14px 14px no-repeat;
    transition: transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  :where(details[open] > ${outputBlockPartRefs.toggle})::before {
    transform: rotate(90deg);
  }
  @media (prefers-reduced-motion: reduce) {
    :where(${outputBlockPartRefs.toggle})::before {
      transition: none;
    }
  }
`;
