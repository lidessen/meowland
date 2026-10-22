import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { searchInputContract } from "../../components/search-input";

export const searchInputStyles = css`
  /* Surface, height and states come from the shared field surface. */
  ${partSelector(searchInputContract, "root")} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    padding-inline: ${uiTokens.fieldPaddingInline};
  }
  ${partSelector(searchInputContract, "icon")} {
    display: flex;
    flex: none;
    color: ${uiTokens.subtleForeground};
  }
  ${partSelector(searchInputContract, "control")} {
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
    /* The wrapper's hairlines render as whole pixels. */
    min-height: calc(${uiTokens.controlHeight} - 2px);
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: inherit;
    font: ${uiTokens.fontBody}/22px ${uiTokens.font};
    outline: none;
    box-shadow: none;
  }
  ${partSelector(searchInputContract, "control")}::placeholder {
    color: ${uiTokens.placeholder};
  }
  ${partSelector(searchInputContract, "control")}:focus-visible {
    outline: none;
  }
  ${partSelector(searchInputContract, "root")}:has(:disabled) :where(${partSelector(searchInputContract, "control")}, ${partSelector(searchInputContract, "icon")}) {
    color: inherit;
    cursor: not-allowed;
  }
`;
