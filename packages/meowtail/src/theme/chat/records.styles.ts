import { css, partSelector } from "meowcss/meowjsx";
import { chatTokens, uiTokens } from "../tokens";
import { radiusTokens } from "../palette";
import { chatProcessContract } from "../../chat/process";
import { chatSourcesContract } from "../../chat/sources";
import { chatToolCallContract } from "../../chat/tool-call";
import { outputBlockContract } from "../../components/output-block";

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
  ${partSelector(chatToolCallContract, "root")},
  ${partSelector(chatProcessContract, "root")},
  ${partSelector(chatSourcesContract, "root")}
  ) {
    ${rowDelta}: calc(${chatTokens.fontBody} - 14px);
    /* Where a row's own label begins. What a row owns rather than sits beside — its
    description, and the rows a group holds — starts here, so a labeled group and the rows
    inside it read as one ladder instead of as peers. */
    ${rowIndent}: calc(${uiTokens.iconSize} + var(${rowDelta}, 0px) + ${chatTokens.leadingGap});
  }

  :is(
  ${partSelector(chatToolCallContract, "header")},
  ${partSelector(chatProcessContract, "summary")},
  ${partSelector(chatSourcesContract, "summary")}
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
  ${partSelector(chatToolCallContract, "icon")},
  ${partSelector(chatProcessContract, "icon")},
  ${partSelector(chatProcessContract, "expandedIcon")},
  ${partSelector(chatSourcesContract, "icon")}
  ) {
    display: grid;
    place-items: center;
    width: calc(${uiTokens.iconSize} + var(${rowDelta}, 0px));
    height: calc(${uiTokens.iconSize} + var(${rowDelta}, 0px));
    flex: 0 0 auto;
  }

  /* Registered glyphs render two px under their box: the CSS edge overrides each svg's own
  size, so one row keeps one optical glyph size whatever icon the caller passes. */
  :is(
  ${partSelector(chatToolCallContract, "icon")},
  ${partSelector(chatProcessContract, "icon")},
  ${partSelector(chatProcessContract, "expandedIcon")},
  ${partSelector(chatSourcesContract, "icon")},
  ${partSelector(chatToolCallContract, "chevron")}
  )
  svg {
    width: calc(14px + var(${rowDelta}, 0px));
    height: calc(14px + var(${rowDelta}, 0px));
  }

  ${partSelector(chatToolCallContract, "root")} {
    container-type: inline-size;
    min-width: 0;
    display: grid;
    gap: 0;
    margin-top: 0;
    padding: 0;
    border: 0;
    border-radius: ${uiTokens.controlRadius};
    background: transparent;
    color: ${uiTokens.subtleForeground};
    font-size: ${uiTokens.fontBody};
  }

  ${partSelector(chatToolCallContract, "header")} {
    min-width: 0;
  }

  ${partSelector(chatToolCallContract, "icon")} {
    border-radius: ${radiusTokens.mark};
    color: inherit;
    background: transparent;
    font-size: ${uiTokens.fontBody};
    line-height: 1;
  }

  ${partSelector(chatToolCallContract, "status")} {
    flex: 0 1 auto;
    white-space: normal;
    overflow-wrap: anywhere;
    min-width: 0;
    margin-left: 2px;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
  }

  ${partSelector(chatToolCallContract, "label")} {
    flex: 0 1 auto;
    min-width: 0;
    overflow-wrap: anywhere;
    text-wrap: balance;
    font-weight: 400;
  }

  /* Both the action and its target can yield to long state facts in constrained containers. */
  ${partSelector(chatToolCallContract, "header")}:has(> ${partSelector(chatToolCallContract, "summary")}) > ${partSelector(chatToolCallContract, "label")} {
    flex-shrink: 1;
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-state="error"] ${partSelector(chatToolCallContract, "status")} {
    color: ${uiTokens.danger};
  }

  /* Color is kept for states that need the reader: waiting and errors. Running and
     finished rows stay neutral, so a long chain reads quietly. */
  ${partSelector(chatToolCallContract, "root")}[data-tool-state="running"] ${partSelector(chatToolCallContract, "status")} {
    color: ${uiTokens.mutedForeground};
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-state="waiting"] ${partSelector(chatToolCallContract, "status")} {
    color: ${uiTokens.warning};
  }

  ${partSelector(chatToolCallContract, "detail")},
  ${partSelector(chatToolCallContract, "body")} {
    min-width: 0;
    margin: 0;
    color: ${uiTokens.mutedForeground};
    font: ${uiTokens.fontBody}/1.65 ${uiTokens.font};
  }

  ${partSelector(chatToolCallContract, "detail")} {
    padding-inline-start: var(${rowIndent});
  }

  ${partSelector(chatToolCallContract, "body")} {
    margin-block: ${uiTokens.spaceGroup};
    margin-inline-start: var(${rowIndent});
  }

  ${partSelector(chatToolCallContract, "body")} {
    display: grid;
    gap: ${uiTokens.spaceGroup};
    overflow-wrap: anywhere;
  }
  ${partSelector(chatToolCallContract, "root")} [hidden] {
    display: none;
  }
  ${partSelector(chatToolCallContract, "outputSummary")} {
    margin: 0;
    color: ${uiTokens.foreground};
  }
  ${partSelector(chatToolCallContract, "actions")} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
  }
  ${partSelector(chatToolCallContract, "input")} ${partSelector(outputBlockContract, "body")},
  ${partSelector(chatToolCallContract, "output")} ${partSelector(outputBlockContract, "body")} {
    max-height: 24rem;
  }
  ${partSelector(chatToolCallContract, "root")}[data-tool-state="success"] ${partSelector(chatToolCallContract, "status")} {
    color: ${uiTokens.subtleForeground};
  }
  ${partSelector(chatToolCallContract, "root")}[data-tool-state="running"] {
    color: ${uiTokens.subtleForeground};
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-state="error"] {
    color: ${uiTokens.subtleForeground};
  }

  ${partSelector(chatProcessContract, "root")} {
    min-width: 0;
    border: 0;
    background: transparent;
    color: ${uiTokens.subtleForeground};
    font-size: ${uiTokens.fontBody};
  }

  ${partSelector(chatProcessContract, "summary")} {
    display: flex;
    width: fit-content;
    max-width: 100%;
    padding: 0;
    list-style: none;
    cursor: pointer;
    user-select: none;
    border-radius: ${uiTokens.controlRadius};
    -webkit-tap-highlight-color: transparent;
  }

  ${partSelector(chatProcessContract, "label")} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ${partSelector(chatProcessContract, "summary")}::-webkit-details-marker {
    display: none;
  }

  ${partSelector(chatProcessContract, "icon")},
  ${partSelector(chatProcessContract, "expandedIcon")},
  ${partSelector(chatSourcesContract, "icon")} {
    transform: rotate(0deg);
    transition: transform ${uiTokens.durationSettle} ${uiTokens.ease};
  }

  ${partSelector(chatProcessContract, "root")}[open]:not([data-process-icon="custom"]) > ${partSelector(chatProcessContract, "summary")} > ${partSelector(chatProcessContract, "icon")},
  ${partSelector(chatSourcesContract, "root")}[open] > ${partSelector(chatSourcesContract, "summary")} > ${partSelector(chatSourcesContract, "icon")} {
    transform: rotate(90deg);
  }

  ${partSelector(chatProcessContract, "expandedIcon")} {
    display: none;
  }

  ${partSelector(chatProcessContract, "root")}[open][data-process-icon="custom"] > ${partSelector(chatProcessContract, "summary")} > ${partSelector(chatProcessContract, "icon")} {
    display: none;
  }

  ${partSelector(chatProcessContract, "root")}[open] > ${partSelector(chatProcessContract, "summary")} > ${partSelector(chatProcessContract, "expandedIcon")} {
    display: grid;
  }

  ${partSelector(chatProcessContract, "summary")}:hover {
    color: ${uiTokens.mutedForeground};
  }

  ${partSelector(chatProcessContract, "summary")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }

  /* A group's contents belong to its row, so they hang under its label instead of lining up
  with it; the step the summary keeps above them is the same "attached" step a row keeps
  before its own body. */
  ${partSelector(chatProcessContract, "body")} {
    margin: 0 0 ${uiTokens.spaceGroup};
    padding-block: ${uiTokens.spaceGroup};
    padding-inline: var(${rowIndent}) 0;
    border-left: 0;
    line-height: 1.65;
  }

  ${partSelector(chatProcessContract, "body")} > :first-child {
    margin-top: 0;
  }

  ${partSelector(chatProcessContract, "body")} > :last-child {
    margin-bottom: 0;
  }

  ${partSelector(chatProcessContract, "body")} > p + p {
    margin-top: ${uiTokens.spaceGroup};
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] {
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] + ${partSelector(chatToolCallContract, "root")} {
    margin-top: 0;
  }

  /* An interactive row is a summary or an action button, and both start from the same chrome:
  the row's own text, no control surface of their own, and one focus stop. */
  ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] > ${partSelector(chatToolCallContract, "header")} {
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
    border-radius: ${uiTokens.controlRadius};
    -webkit-tap-highlight-color: transparent;
  }

  /* The chevron swaps with the leading glyph, so it centres in the row whatever height the
  row takes — a coarse pointer raises it, and a wrapping label grows it. */
  ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] ${partSelector(chatToolCallContract, "chevron")} {
    position: absolute;
    left: 0;
    inset-block: 0;
    margin-block: auto;
    display: grid;
    place-items: center;
    width: calc(${uiTokens.iconSize} + var(${rowDelta}, 0px));
    height: calc(${uiTokens.iconSize} + var(${rowDelta}, 0px));
    opacity: 0;
    transition:
      opacity ${uiTokens.durationSettle} ${uiTokens.ease},
      transform ${uiTokens.durationSettle} ${uiTokens.ease};
  }

  ${partSelector(chatToolCallContract, "root")}[open] ${partSelector(chatToolCallContract, "chevron")} {
    transform: rotate(90deg);
  }

  ${partSelector(chatToolCallContract, "header")}:is(:hover, :focus-visible) > ${partSelector(chatToolCallContract, "chevron")} {
    opacity: 1;
  }

  ${partSelector(chatToolCallContract, "header")}:is(:hover, :focus-visible) > ${partSelector(chatToolCallContract, "icon")} {
    opacity: 0;
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-collapsible="true"] > ${partSelector(chatToolCallContract, "header")}::-webkit-details-marker {
    display: none;
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] ${partSelector(chatToolCallContract, "icon")} {
    border-radius: 0;
    color: inherit;
    font-size: 0;
    transition: transform ${uiTokens.durationSettle} ${uiTokens.ease};
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] ${partSelector(chatToolCallContract, "label")} {
    color: inherit;
    font-weight: 400;
    overflow-wrap: anywhere;
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] ${partSelector(chatToolCallContract, "status")} {
    margin-left: 2px;
    font-size: ${uiTokens.fontCaption};
    white-space: normal;
    flex-shrink: 1;
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-state="error"][data-tool-interactive="true"] ${partSelector(chatToolCallContract, "status")} {
    color: ${uiTokens.danger};
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-state="running"][data-tool-interactive="true"] ${partSelector(chatToolCallContract, "status")} {
    color: ${uiTokens.mutedForeground};
  }

  /* A row that needs the reader states it once, in the color of both the leading glyph and the
  status, so a chain can be read down its left edge instead of out to each row's far end. */
  ${partSelector(chatToolCallContract, "root")}[data-tool-state="error"] ${partSelector(chatToolCallContract, "icon")} {
    color: ${uiTokens.danger};
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-state="running"] ${partSelector(chatToolCallContract, "icon")} {
    color: ${uiTokens.foreground};
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-state="waiting"] ${partSelector(chatToolCallContract, "icon")} {
    color: ${uiTokens.warning};
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] > ${partSelector(chatToolCallContract, "header")}:hover ${partSelector(chatToolCallContract, "label")} {
    color: ${uiTokens.mutedForeground};
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] > ${partSelector(chatToolCallContract, "header")}:hover {
    color: ${uiTokens.mutedForeground};
  }

  ${partSelector(chatToolCallContract, "summary")} {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1 1 0;
    color: inherit;
  }

  ${partSelector(chatToolCallContract, "summary")}::before {
    content: "";
    display: inline-block;
    width: 2px;
    height: 2px;
    margin: 0 8px 3px 2px;
    border-radius: 1px;
    background: ${uiTokens.captionForeground};
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-default-complete="true"] ${partSelector(chatToolCallContract, "status")} {
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
    ${partSelector(chatToolCallContract, "header")} {
      display: grid;
      grid-template-columns: calc(${uiTokens.iconSize} + var(${rowDelta}, 0px)) minmax(0, 1fr);
      align-items: start;
      row-gap: 0;
    }
    ${partSelector(chatToolCallContract, "icon")} {
      grid-column: 1;
      grid-row: 1;
      align-self: start;
      margin-block-start: calc(
        (
            (${chatTokens.rowLine} + var(${rowDelta}, 0px)) -
              (${uiTokens.iconSize} + var(${rowDelta}, 0px))
          ) /
          2
      );
    }
    ${partSelector(chatToolCallContract, "label")},
    ${partSelector(chatToolCallContract, "summary")},
    ${partSelector(chatToolCallContract, "status")} {
      grid-column: 2;
      margin-inline-start: 0;
    }
    ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] ${partSelector(chatToolCallContract, "chevron")} {
      inset-block: auto;
      top: calc(
        (
            (${chatTokens.rowLine} + var(${rowDelta}, 0px)) -
              (${uiTokens.iconSize} + var(${rowDelta}, 0px))
          ) /
          2
      );
      margin-block: 0;
    }
    ${partSelector(chatToolCallContract, "summary")}::before {
      display: none;
    }
  }

  @media (pointer: coarse) {
    ${partSelector(chatProcessContract, "summary")},
    ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] > ${partSelector(chatToolCallContract, "header")} {
      min-height: ${uiTokens.controlHeight};
    }

    ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] ${partSelector(chatToolCallContract, "status")} {
      font-size: ${uiTokens.fontCaption};
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ${partSelector(chatProcessContract, "icon")},
    ${partSelector(chatSourcesContract, "icon")},
    ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] ${partSelector(chatToolCallContract, "icon")} {
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
    column-gap: ${uiTokens.spaceGroup};
    align-items: baseline;
    min-width: 0;
    padding-block: ${uiTokens.spaceGroup};
  }

  .chat-tool-call-sections > section + section {
    border-top: 1px solid ${uiTokens.borderSoft};
  }

  .chat-tool-call-sections h4 {
    align-self: start;
    margin: 0;
    color: ${uiTokens.captionForeground};
    font-size: ${uiTokens.fontCaption};
    font-weight: 500;
    font-family: ${uiTokens.font};
    line-height: 1.65;
  }

  .chat-tool-call-sections p {
    margin: 0;
    color: ${uiTokens.mutedForeground};
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontBody};
    line-height: 1.65;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  ${partSelector(chatSourcesContract, "summary")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 3px;
  }

  ${partSelector(chatToolCallContract, "root")}[data-tool-interactive="true"] > ${partSelector(chatToolCallContract, "header")}:focus-visible {
    outline: none;
  }

  ${partSelector(chatToolCallContract, "header")}:focus-visible > ${partSelector(chatToolCallContract, "chevron")} {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
    border-radius: ${radiusTokens.mark};
  }

  ${partSelector(chatSourcesContract, "root")} {
    margin-top: 16px;
    padding-top: 0;
    border-top: 0;
    color: ${uiTokens.subtleForeground};
    font-size: calc(${chatTokens.fontBody} - 1px);
  }

  ${partSelector(chatSourcesContract, "summary")} {
    list-style: none;
    cursor: pointer;
  }

  ${partSelector(chatSourcesContract, "summary")}::-webkit-details-marker {
    display: none;
  }

  ${partSelector(chatSourcesContract, "summary")}::marker {
    content: "";
  }

  ${partSelector(chatSourcesContract, "list")} {
    display: grid;
    gap: 10px;
    margin: 8px 0 0;
    padding: 0;
    list-style: none;
    max-height: 320px;
    overflow-y: auto;
  }

  ${partSelector(chatSourcesContract, "item")} {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  ${partSelector(chatSourcesContract, "link")} {
    color: ${uiTokens.info};
    font-size: ${uiTokens.fontBody};
    font-weight: 500;
    line-height: 20px;
    text-decoration: none;
    overflow-wrap: anywhere;
    text-underline-offset: 3px;
  }

  ${partSelector(chatSourcesContract, "link")}:is(:hover, :focus-visible) {
    text-decoration: underline dotted;
  }

  ${partSelector(chatSourcesContract, "description")} {
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontLabel};
    line-height: 19px;
    overflow-wrap: anywhere;
  }

  ${partSelector(chatToolCallContract, "body")} {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  ${partSelector(chatToolCallContract, "body")} pre {
    margin: 4px 0;
    padding: 12px 16px;
    max-width: 100%;
    max-height: 260px;
    overflow: auto;
    border: 0;
    border-radius: ${uiTokens.radiusLarge};
    background: ${uiTokens.codeSurface};
    font: ${uiTokens.fontCaption}/18px ${uiTokens.mono};
    white-space: pre-wrap;
  }

  @media (prefers-reduced-motion: reduce) {
    ${partSelector(chatToolCallContract, "chevron")} {
      transition: none;
    }
  }

  @media (pointer: coarse) {
    ${partSelector(chatSourcesContract, "summary")} {
      min-height: ${uiTokens.controlHeight};
    }
  }
`;
