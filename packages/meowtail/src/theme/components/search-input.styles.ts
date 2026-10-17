import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { searchInputContract } from "../../components/search-input";

export const searchInputStyles = css`
  ${partSelector(searchInputContract, "root")} {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    min-height: ${uiTokens.controlHeight};
    padding-inline: ${uiTokens.controlPaddingInline};
    border: 0.5px solid ${uiTokens.border};
    border-radius: ${uiTokens.controlRadius};
    background: ${uiTokens.inputSurface};
    color: ${uiTokens.foreground};
    transition: border-color ${uiTokens.durationResponse} ${uiTokens.ease};
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
    min-height: calc(${uiTokens.controlHeight} - 2px);
    padding: 3px 0;
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
  ${partSelector(searchInputContract, "root")}:focus-within {
    border-color: ${uiTokens.focus};
  }
  ${partSelector(searchInputContract, "root")}:has([aria-invalid="true"]) {
    border-color: ${uiTokens.danger};
  }
  ${partSelector(searchInputContract, "root")}:has(:disabled) {
    background: ${uiTokens.surfaceMuted};
    color: ${uiTokens.subtleForeground};
  }
  ${partSelector(searchInputContract, "root")}:has(:disabled) :where(${partSelector(searchInputContract, "control")}, ${partSelector(searchInputContract, "icon")}) {
    color: inherit;
    cursor: not-allowed;
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(searchInputContract, "root")} {
      transition: none;
    }
  }
`;
