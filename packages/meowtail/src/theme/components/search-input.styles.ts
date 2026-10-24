import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { SearchInput } from "../../components/search-input";
const searchInputPartRefs = parts<typeof SearchInput>("search-input");
export const searchInputStyles = css`
  /* Surface, height and states come from the shared field surface. */
  ${searchInputPartRefs.root} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    padding-inline: ${uiTokens.control.fieldInset};
  }
  ${searchInputPartRefs.icon} {
    display: flex;
    flex: none;
    color: ${uiTokens.ink.tertiary};
  }
  ${searchInputPartRefs.control} {
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
    /* The wrapper's hairlines render as whole pixels. */
    min-height: calc(${uiTokens.control.regular} - 2px);
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: inherit;
    font: ${uiTokens.type.body} / ${uiTokens.type.line.body} ${uiTokens.type.sans};
    outline: none;
    box-shadow: none;
  }
  ${searchInputPartRefs.control}::placeholder {
    color: ${uiTokens.ink.secondary};
  }
  ${searchInputPartRefs.control}:focus-visible {
    outline: none;
  }
  ${searchInputPartRefs.root}:has(:disabled) :where(${searchInputPartRefs.control}, ${searchInputPartRefs.icon}) {
    color: inherit;
    cursor: not-allowed;
  }
`;
