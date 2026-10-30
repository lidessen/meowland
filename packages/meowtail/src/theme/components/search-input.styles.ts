import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { SearchInput } from "../../components/search-input";
const searchInputPartRefs = parts<typeof SearchInput>("search-input");
/** The Lucide "x" glyph the library draws for close, as a mask: only its shape is used. */
const CLEAR_GLYPH = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 6 6 18'/%3E%3Cpath d='m6 6 12 12'/%3E%3C/svg%3E")`;
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
  /* The native clear button, drawn in the theme instead of the browser's own: the library's
     close glyph at the small icon size, in the icon's ink, at the end of the field. */
  ${searchInputPartRefs.control}::-webkit-search-decoration {
    -webkit-appearance: none;
    appearance: none;
  }
  ${searchInputPartRefs.control}::-webkit-search-cancel-button {
    -webkit-appearance: none;
    appearance: none;
    flex: none;
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
    margin: 0 0 0 ${uiTokens.space.group};
    background-color: ${uiTokens.ink.tertiary};
    -webkit-mask: ${CLEAR_GLYPH} center / contain no-repeat;
    mask: ${CLEAR_GLYPH} center / contain no-repeat;
    cursor: pointer;
  }
  ${searchInputPartRefs.control}::-webkit-search-cancel-button:hover {
    background-color: ${uiTokens.ink.secondary};
  }
  ${searchInputPartRefs.root}:has(:disabled) :where(${searchInputPartRefs.control}, ${searchInputPartRefs.icon}) {
    color: inherit;
    cursor: not-allowed;
  }
`;
