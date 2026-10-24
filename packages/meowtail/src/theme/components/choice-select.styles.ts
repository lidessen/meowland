import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { ChoiceSelect } from "../../components/choice-select";
import type { Popover } from "../../components/popover";
const choiceSelectPartRefs = parts<typeof ChoiceSelect>("choice-select");
const popoverPartRefs = parts<typeof Popover>("popover");
export const choiceSelectStyles = css`
  ${choiceSelectPartRefs.root} {
    position: relative;
    min-width: 0;
  }
  /* Surface, height and states come from the shared field surface. */
  ${choiceSelectPartRefs.trigger} {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    /* The chevron sits where the native Select draws its own. */
    padding: 0 10px 0 ${uiTokens.control.fieldInset};
    text-align: start;
    cursor: pointer;
  }
  ${choiceSelectPartRefs.value} {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${choiceSelectPartRefs.indicator} {
    display: flex;
    color: ${uiTokens.ink.secondary};
  }
  ${choiceSelectPartRefs.indicator} svg {
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
  }
  ${popoverPartRefs.panel}:has(> ${choiceSelectPartRefs.list}) {
    padding: 6px;
  }
  ${choiceSelectPartRefs.list} {
    display: grid;
    gap: 0;
  }
  ${choiceSelectPartRefs.search} {
    box-sizing: border-box;
    width: 100%;
    min-height: 32px;
    padding: 4px 8px;
    margin-bottom: 4px;
    border: 1px solid ${uiTokens.line.control};
    border-radius: ${uiTokens.radius.lg};
    background: ${uiTokens.surface.field};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.body} ${uiTokens.type.sans};
  }
  ${choiceSelectPartRefs.search}:focus-visible {
    border-color: ${uiTokens.state.focus};
    outline: none;
  }
  ${choiceSelectPartRefs.search}::placeholder {
    color: ${uiTokens.ink.secondary};
  }
  ${choiceSelectPartRefs.empty} {
    margin: 0;
    padding: ${uiTokens.space.section} ${uiTokens.control.inset};
    color: ${uiTokens.ink.secondary};
  }
  ${choiceSelectPartRefs.option}[hidden],
  ${choiceSelectPartRefs.group}[hidden],
  ${choiceSelectPartRefs.empty}[hidden] {
    display: none;
  }
  /* Group labels and separators match Menu: small uppercase heading, full-bleed band. */
  ${choiceSelectPartRefs.group} {
    padding: 8px 10px 4px;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.micro};
    font-weight: ${uiTokens.type.weight.medium};
    letter-spacing: ${uiTokens.type.trackingCaps};
    text-transform: uppercase;
  }
  ${choiceSelectPartRefs.group}:not(:first-child) {
    border-top: 1px solid ${uiTokens.line.divider};
    margin: 4px -6px 0;
    padding-inline: 16px;
  }
  ${choiceSelectPartRefs.option} {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    width: 100%;
    min-height: 32px;
    padding: 6px 10px;
    border: 0;
    border-radius: ${uiTokens.radius.md};
    background: transparent;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.bodyCompact} ${uiTokens.type.sans};
    text-align: start;
    cursor: pointer;
    overflow-wrap: anywhere;
  }
  ${choiceSelectPartRefs.option}::after {
    content: "";
    width: 12px;
    flex: 0 0 12px;
  }
  ${choiceSelectPartRefs.option}[aria-selected="true"]::after {
    content: "✓";
  }
  ${choiceSelectPartRefs.option}[aria-selected="true"] {
    font-weight: ${uiTokens.type.weight.regular};
  }
  ${choiceSelectPartRefs.option}:focus {
    background: ${uiTokens.state.hover};
    outline: none;
  }
  ${choiceSelectPartRefs.option}:disabled {
    color: ${uiTokens.ink.tertiary};
    cursor: not-allowed;
  }
  ${choiceSelectPartRefs.native} {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ${choiceSelectPartRefs.validation} {
    display: block;
    margin-top: ${uiTokens.space.group};
    color: ${uiTokens.status.danger};
    font-size: ${uiTokens.type.caption};
  }
  ${choiceSelectPartRefs.validation}:empty {
    display: none;
  }
  @media (hover: hover) {
    ${choiceSelectPartRefs.trigger}:hover:not(:disabled):not([aria-invalid="true"]) {
      border-color: ${uiTokens.ink.secondary};
    }
    ${choiceSelectPartRefs.option}:hover:not(:disabled) {
      background: ${uiTokens.state.hover};
    }
  }
  @media (pointer: coarse) {
    ${choiceSelectPartRefs.trigger},
    ${choiceSelectPartRefs.search},
    ${choiceSelectPartRefs.option} {
      min-height: 44px;
      font-size: ${uiTokens.type.touchField};
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${choiceSelectPartRefs.trigger} {
      transition: none;
    }
  }
`;
