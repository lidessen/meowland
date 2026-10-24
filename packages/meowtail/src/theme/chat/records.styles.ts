import { css, parts } from "meowcss/meowjsx";
import { chatTokens, uiTokens } from "../tokens";

import { ui } from "../utilities";
import type { ChatProcess } from "../../chat/process";
import type { ChatSources } from "../../chat/sources";
import type { ChatToolCall } from "../../chat/tool-call";
import type { OutputBlock } from "../../components/output-block";
const chatProcessPartRefs = parts<typeof ChatProcess>("chat-process");
const chatSourcesPartRefs = parts<typeof ChatSources>("chat-sources");
const chatToolCallPartRefs = parts<typeof ChatToolCall>("chat-tool-call");
const outputBlockPartRefs = parts<typeof OutputBlock>("output-block");
/** How far the chat type scale sits above the 14px body the row metrics were drawn at. */
const rowDelta = "--chat-row-delta";
/** Where a row's label begins; anything the row owns rather than sits beside starts here. */
const rowIndent = "--chat-row-indent";

export const chatRecordsStyles = css`
  /* One process row, shared by every disclosure row in the chat surface: a leading glyph box,
  a one-line label, and the pair of numbers that measures both. The rows are drawn at a 14px
  body, so the boxes ride the chat type scale: a host that enlarges the text moves the glyph
  box, the glyph, the line box and the label indent together instead of leaving fixed boxes
  around larger text. The pitch between rows stays the list's business. */
  :is(
  ${chatToolCallPartRefs.root},
  ${chatProcessPartRefs.root},
  ${chatSourcesPartRefs.root}
  ) {
    ${rowDelta}: calc(${chatTokens.fontBody} - 14px);
    /* Where a row's own label begins. What a row owns rather than sits beside — its
    description, and the rows a group holds — starts here, so a labeled group and the rows
    inside it read as one ladder instead of as peers. */
    ${rowIndent}: calc(${uiTokens.icon.size} + var(${rowDelta}, 0px) + ${chatTokens.leadingGap});
  }

  :is(
  ${chatToolCallPartRefs.header},
  ${chatProcessPartRefs.summary},
  ${chatSourcesPartRefs.summary}
  ) {
    display: flex;
    align-items: center;
    gap: ${chatTokens.leadingGap};
    min-height: calc(${chatTokens.rowLine} + var(${rowDelta}, 0px));
    box-sizing: border-box;
    font-size: calc(${chatTokens.fontBody} - 1px);
    line-height: calc(${chatTokens.rowLine} + var(${rowDelta}, 0px));
  }

  :is(
  ${chatToolCallPartRefs.icon},
  ${chatProcessPartRefs.icon},
  ${chatProcessPartRefs.expandedIcon},
  ${chatSourcesPartRefs.icon}
  ) {
    display: grid;
    place-items: center;
    width: calc(${uiTokens.icon.size} + var(${rowDelta}, 0px));
    height: calc(${uiTokens.icon.size} + var(${rowDelta}, 0px));
    flex: 0 0 auto;
  }

  /* Registered glyphs render two px under their box: the CSS edge overrides each svg's own
  size, so one row keeps one optical glyph size whatever icon the caller passes. */
  :is(
  ${chatToolCallPartRefs.icon},
  ${chatProcessPartRefs.icon},
  ${chatProcessPartRefs.expandedIcon},
  ${chatSourcesPartRefs.icon},
  ${chatToolCallPartRefs.chevron}
  )
  svg {
    width: calc(14px + var(${rowDelta}, 0px));
    height: calc(14px + var(${rowDelta}, 0px));
  }

  ${chatToolCallPartRefs.root} {
    container-type: inline-size;
    min-width: 0;
    display: grid;
    gap: 0;
    margin-top: 0;
    padding: 0;
    border: 0;
    border-radius: ${uiTokens.radius.lg};
    background: transparent;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.body};
  }

  ${chatToolCallPartRefs.header} {
    min-width: 0;
  }

  ${chatToolCallPartRefs.icon} {
    position: relative;
    border-radius: ${uiTokens.radius.xs};
    color: ${uiTokens.ink.tertiary};
    background: transparent;
    font-size: ${uiTokens.type.body};
    line-height: 1;
  }

  /* The state badge comes from shared/state-badge.styles.ts; the row only places it. */
  ${chatToolCallPartRefs.status} {
    margin-left: 6px;
  }

  /* The host's account of the state: a second header line, aligned with the label. */
  ${chatToolCallPartRefs.header}:has(> ${chatToolCallPartRefs.fact}:not([hidden])) {
    flex-wrap: wrap;
    row-gap: 0;
  }
  ${chatToolCallPartRefs.fact} {
    flex: 1 0 100%;
    margin: -4px 0 2px;
    padding-inline-start: var(${rowIndent});
    font-weight: ${uiTokens.type.weight.regular};
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    overflow-wrap: anywhere;
  }

  ${chatToolCallPartRefs.label} {
    flex: 0 1 auto;
    min-width: 0;
    overflow-wrap: anywhere;
    text-wrap: balance;
    color: ${uiTokens.ink.secondary};
    font-weight: ${uiTokens.type.weight.medium};
  }

  /* Beside a target the verb keeps its words; the target is what yields and truncates. */
  ${chatToolCallPartRefs.header}:has(> ${chatToolCallPartRefs.summary}) > ${chatToolCallPartRefs.label} {
    flex-shrink: 0;
    max-width: 50%;
  }

  ${chatToolCallPartRefs.detail},
  ${chatToolCallPartRefs.body} {
    min-width: 0;
    margin: 0;
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.reading} ${uiTokens.type.sans};
  }

  ${chatToolCallPartRefs.detail} {
    padding-inline-start: var(${rowIndent});
  }

  ${chatToolCallPartRefs.body} {
    margin-block: ${uiTokens.space.group};
    margin-inline-start: var(${rowIndent});
  }

  ${chatToolCallPartRefs.body} {
    display: grid;
    gap: ${uiTokens.space.group};
    overflow-wrap: anywhere;
  }
  ${chatToolCallPartRefs.root} [hidden] {
    display: none;
  }
  ${chatToolCallPartRefs.outputSummary} {
    margin: 0;
    color: ${uiTokens.ink.primary};
  }
  ${chatToolCallPartRefs.actions} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${uiTokens.space.group};
  }
  ${chatToolCallPartRefs.input} ${outputBlockPartRefs.body},
  ${chatToolCallPartRefs.output} ${outputBlockPartRefs.body} {
    max-height: 24rem;
  }
  ${chatToolCallPartRefs.root}[data-tool-state="running"] {
    color: ${uiTokens.ink.tertiary};
  }

  ${chatToolCallPartRefs.root}[data-tool-state="error"] {
    color: ${uiTokens.ink.tertiary};
  }

  ${chatProcessPartRefs.root} {
    min-width: 0;
    border: 0;
    background: transparent;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.body};
  }

  ${chatProcessPartRefs.summary} {
    display: flex;
    width: fit-content;
    max-width: 100%;
    padding: 0;
    list-style: none;
    cursor: pointer;
    user-select: none;
    border-radius: ${uiTokens.radius.lg};
    -webkit-tap-highlight-color: transparent;
  }

  ${chatProcessPartRefs.label} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ${chatProcessPartRefs.summary}::-webkit-details-marker {
    display: none;
  }

  ${chatProcessPartRefs.icon},
  ${chatProcessPartRefs.expandedIcon},
  ${chatSourcesPartRefs.icon} {
    transform: rotate(0deg);
    transition: transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }

  ${chatProcessPartRefs.root}[open]:not([data-process-icon="custom"]) > ${chatProcessPartRefs.summary} > ${chatProcessPartRefs.icon},
  ${chatSourcesPartRefs.root}[open] > ${chatSourcesPartRefs.summary} > ${chatSourcesPartRefs.icon} {
    transform: rotate(90deg);
  }

  ${chatProcessPartRefs.expandedIcon} {
    display: none;
  }

  ${chatProcessPartRefs.root}[open][data-process-icon="custom"] > ${chatProcessPartRefs.summary} > ${chatProcessPartRefs.icon} {
    display: none;
  }

  ${chatProcessPartRefs.root}[open] > ${chatProcessPartRefs.summary} > ${chatProcessPartRefs.expandedIcon} {
    display: grid;
  }

  ${chatProcessPartRefs.summary}:hover {
    color: ${uiTokens.ink.secondary};
  }

  ${chatProcessPartRefs.summary}:focus-visible {
    ${ui.focus.ring}
  }

  /* A group's contents belong to its row, so they hang under its label instead of lining up
  with it; the step the summary keeps above them is the same "attached" step a row keeps
  before its own body. */
  ${chatProcessPartRefs.body} {
    margin: 0 0 ${uiTokens.space.group};
    padding-block: ${uiTokens.space.group};
    padding-inline: var(${rowIndent}) 0;
    border-left: 0;
    line-height: ${uiTokens.type.line.reading};
  }

  ${chatProcessPartRefs.body} > :first-child {
    margin-top: 0;
  }

  ${chatProcessPartRefs.body} > :last-child {
    margin-bottom: 0;
  }

  ${chatProcessPartRefs.body} > p + p {
    margin-top: ${uiTokens.space.group};
  }

  ${chatToolCallPartRefs.root}[data-tool-interactive="true"] {
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  ${chatToolCallPartRefs.root}[data-tool-interactive="true"] + ${chatToolCallPartRefs.root} {
    margin-top: 0;
  }

  /* An interactive row is a summary or an action button, and both start from the same chrome:
  the row's own text, no control surface of their own, and one focus stop. */
  ${chatToolCallPartRefs.root}[data-tool-interactive="true"] > ${chatToolCallPartRefs.header} {
    position: relative;
    width: 100%;
    max-width: 100%;
    padding: 0;
    border: 0;
    appearance: none;
    background: none;
    color: inherit;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    list-style: none;
    border-radius: ${uiTokens.radius.lg};
    -webkit-tap-highlight-color: transparent;
  }

  /* The chevron swaps with the leading glyph, so it centres in the row whatever height the
  row takes — a coarse pointer raises it, and a wrapping label grows it. */
  ${chatToolCallPartRefs.root}[data-tool-interactive="true"] ${chatToolCallPartRefs.chevron} {
    position: absolute;
    left: 0;
    inset-block: 0;
    margin-block: auto;
    display: grid;
    place-items: center;
    width: calc(${uiTokens.icon.size} + var(${rowDelta}, 0px));
    height: calc(${uiTokens.icon.size} + var(${rowDelta}, 0px));
    opacity: 0;
    transition:
      opacity ${uiTokens.motion.settle} ${uiTokens.motion.ease},
      transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }

  ${chatToolCallPartRefs.root}[open] ${chatToolCallPartRefs.chevron} {
    transform: rotate(90deg);
  }

  ${chatToolCallPartRefs.header}:is(:hover, :focus-visible) > ${chatToolCallPartRefs.chevron} {
    opacity: 1;
  }

  ${chatToolCallPartRefs.header}:is(:hover, :focus-visible) > ${chatToolCallPartRefs.icon} {
    opacity: 0;
  }

  ${chatToolCallPartRefs.root}[data-tool-collapsible="true"] > ${chatToolCallPartRefs.header}::-webkit-details-marker {
    display: none;
  }

  ${chatToolCallPartRefs.root}[data-tool-interactive="true"] ${chatToolCallPartRefs.icon} {
    border-radius: 0;
    font-size: 0;
    transition: transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }

  ${chatToolCallPartRefs.root}[data-tool-interactive="true"] ${chatToolCallPartRefs.label} {
    overflow-wrap: anywhere;
  }

  ${chatToolCallPartRefs.root}[data-tool-interactive="true"] > ${chatToolCallPartRefs.header}:hover ${chatToolCallPartRefs.label} {
    color: ${uiTokens.ink.primary};
  }

  ${chatToolCallPartRefs.root}[data-tool-interactive="true"] > ${chatToolCallPartRefs.header}:hover {
    color: ${uiTokens.ink.secondary};
  }

  ${chatToolCallPartRefs.summary} {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 0 1 auto;
    margin-inline-start: 2px;
    color: ${uiTokens.ink.tertiary};
  }

  ${chatToolCallPartRefs.root}[data-tool-default-complete="true"] ${chatToolCallPartRefs.status} {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* A narrow host gives each fact a readable line instead of making two thin text columns. */
  @container (max-width: 400px) {
    ${chatToolCallPartRefs.header} {
      display: grid;
      grid-template-columns: calc(${uiTokens.icon.size} + var(${rowDelta}, 0px)) minmax(0, 1fr);
      align-items: start;
      row-gap: 0;
    }
    ${chatToolCallPartRefs.icon} {
      grid-column: 1;
      grid-row: 1;
      align-self: start;
      margin-block-start: calc(
        (
            (${chatTokens.rowLine} + var(${rowDelta}, 0px)) -
              (${uiTokens.icon.size} + var(${rowDelta}, 0px))
          ) /
          2
      );
    }
    ${chatToolCallPartRefs.label},
    ${chatToolCallPartRefs.summary},
    ${chatToolCallPartRefs.status} {
      grid-column: 2;
      margin-inline-start: 0;
    }
    ${chatToolCallPartRefs.status} {
      justify-self: start;
      margin-block: 2px;
    }
    ${chatToolCallPartRefs.fact} {
      grid-column: 2;
      margin: 0;
      padding-inline-start: 0;
    }
    ${chatToolCallPartRefs.root}[data-tool-interactive="true"] ${chatToolCallPartRefs.chevron} {
      inset-block: auto;
      top: calc(
        (
            (${chatTokens.rowLine} + var(${rowDelta}, 0px)) -
              (${uiTokens.icon.size} + var(${rowDelta}, 0px))
          ) /
          2
      );
      margin-block: 0;
    }
  }

  @media (pointer: coarse) {
    ${chatProcessPartRefs.summary},
    ${chatToolCallPartRefs.root}[data-tool-interactive="true"] > ${chatToolCallPartRefs.header} {
      min-height: ${uiTokens.control.regular};
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ${chatProcessPartRefs.icon},
    ${chatSourcesPartRefs.icon},
    ${chatToolCallPartRefs.root}[data-tool-interactive="true"] ${chatToolCallPartRefs.icon} {
      transition: none;
    }
  }

  .chat-tool-call-sections {
    display: grid;
    gap: 0;
    min-width: 0;
  }

  .chat-tool-call-sections > section {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    column-gap: ${uiTokens.space.group};
    align-items: baseline;
    min-width: 0;
    padding-block: ${uiTokens.space.group};
  }

  .chat-tool-call-sections > section + section {
    border-top: 1px solid ${uiTokens.line.divider};
  }

  .chat-tool-call-sections h4 {
    align-self: start;
    margin: 0;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    font-weight: ${uiTokens.type.weight.medium};
    font-family: ${uiTokens.type.sans};
    line-height: ${uiTokens.type.line.caption};
  }

  .chat-tool-call-sections p {
    margin: 0;
    color: ${uiTokens.ink.secondary};
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.line.reading};
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  ${chatSourcesPartRefs.summary}:focus-visible {
    ${ui.focus.ring}
  }

  ${chatToolCallPartRefs.root}[data-tool-interactive="true"] > ${chatToolCallPartRefs.header}:focus-visible {
    outline: none;
  }

  ${chatToolCallPartRefs.header}:focus-visible > ${chatToolCallPartRefs.chevron} {
    ${ui.focus.ring}
    border-radius: ${uiTokens.radius.xs};
  }

  ${chatSourcesPartRefs.root} {
    margin-top: 16px;
    padding-top: 0;
    border-top: 0;
    color: ${uiTokens.ink.tertiary};
    font-size: calc(${chatTokens.fontBody} - 1px);
  }

  ${chatSourcesPartRefs.summary} {
    list-style: none;
    cursor: pointer;
  }

  ${chatSourcesPartRefs.summary}::-webkit-details-marker {
    display: none;
  }

  ${chatSourcesPartRefs.summary}::marker {
    content: "";
  }

  ${chatSourcesPartRefs.list} {
    display: grid;
    gap: 10px;
    margin: 8px 0 0;
    padding: 0;
    list-style: none;
    max-height: 320px;
    overflow-y: auto;
  }

  ${chatSourcesPartRefs.item} {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  ${chatSourcesPartRefs.link} {
    color: ${uiTokens.status.info};
    font-size: ${uiTokens.type.body};
    font-weight: ${uiTokens.type.weight.medium};
    line-height: ${uiTokens.type.line.bodyCompact};
    text-decoration: none;
    overflow-wrap: anywhere;
    text-underline-offset: 3px;
  }

  ${chatSourcesPartRefs.link}:is(:hover, :focus-visible) {
    text-decoration: underline dotted;
  }

  ${chatSourcesPartRefs.description} {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    line-height: ${uiTokens.type.line.label};
    overflow-wrap: anywhere;
  }

  ${chatToolCallPartRefs.body} {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  ${chatToolCallPartRefs.body} pre {
    margin: 4px 0;
    padding: 12px 16px;
    max-width: 100%;
    max-height: 260px;
    overflow: auto;
    border: 0;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.fill};
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.code} ${uiTokens.type.mono};
    white-space: pre-wrap;
  }

  @media (prefers-reduced-motion: reduce) {
    ${chatToolCallPartRefs.chevron} {
      transition: none;
    }
  }

  @media (pointer: coarse) {
    ${chatSourcesPartRefs.summary} {
      min-height: ${uiTokens.control.regular};
    }
  }
`;
