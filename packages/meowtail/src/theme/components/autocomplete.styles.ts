import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { Autocomplete } from "../../components/autocomplete";
import type { Popover } from "../../components/popover";
const autocomplete = parts<typeof Autocomplete>("autocomplete");
const popover = parts<typeof Popover>("popover");
export const autocompleteStyles = css`
  ${autocomplete.root} {
    min-width: 0;
  }
  /* Surface, height and states come from the shared field surface. */
  ${autocomplete.input} {
    width: 100%;
    padding: 0 ${uiTokens.control.fieldInset};
  }
  ${autocomplete.input}::placeholder {
    color: ${uiTokens.ink.secondary};
  }
  ${popover.panel}:has(> ${autocomplete.list}) {
    padding: 6px;
  }
  ${autocomplete.list} {
    display: grid;
  }
  ${autocomplete.list}:empty {
    display: none;
  }
  ${autocomplete.option} {
    box-sizing: border-box;
    display: grid;
    gap: 2px;
    min-height: 32px;
    padding: 6px 10px;
    border-radius: ${uiTokens.radius.md};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.bodyCompact} ${uiTokens.type.sans};
    cursor: pointer;
    overflow-wrap: anywhere;
  }
  /* The active option is where the arrow keys are; it is painted like a focused menu item. */
  ${autocomplete.option}[aria-selected="true"] {
    background: ${uiTokens.state.hover};
  }
  @media (hover: hover) {
    ${autocomplete.option}:hover {
      background: ${uiTokens.state.hover};
    }
  }
  ${autocomplete.description} {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
  }
  ${autocomplete.description}[hidden],
  ${autocomplete.status}[hidden] {
    display: none;
  }
  ${autocomplete.status} {
    margin: 0;
    padding: 6px 10px;
    color: ${uiTokens.ink.secondary};
  }
  @media (pointer: coarse) {
    ${autocomplete.input},
    ${autocomplete.option} {
      min-height: 44px;
      font-size: ${uiTokens.type.touchField};
    }
  }
`;
