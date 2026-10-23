import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { searchInputContract } from "../../components/search-input";

export const searchInputStyles = css`
  /* Surface, height and states come from the shared field surface. */
  ${partSelector(searchInputContract, "root")} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    padding-inline: ${uiTokens.control.fieldInset};
  }
  ${partSelector(searchInputContract, "icon")} {
    display: flex;
    flex: none;
    color: ${uiTokens.ink.tertiary};
  }
  ${partSelector(searchInputContract, "control")} {
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
  ${partSelector(searchInputContract, "control")}::placeholder {
    color: ${uiTokens.ink.secondary};
  }
  ${partSelector(searchInputContract, "control")}:focus-visible {
    outline: none;
  }
  ${partSelector(searchInputContract, "root")}:has(:disabled) :where(${partSelector(searchInputContract, "control")}, ${partSelector(searchInputContract, "icon")}) {
    color: inherit;
    cursor: not-allowed;
  }
`;
