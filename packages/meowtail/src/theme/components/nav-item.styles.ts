import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { accentTokens } from "../palette";
import { navItemContract } from "../../components/nav-item";

export const navItemStyles = css`
  :where(${partSelector(navItemContract, "root")}) {
    box-sizing: border-box;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
  }
  :where(${partSelector(navItemContract, "root")}):focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  ${partSelector(navItemContract, "root")} {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    padding: 7px 12px;
    border: 0;
    border-radius: ${uiTokens.controlRadius};
    color: ${uiTokens.foreground};
    background: transparent;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
  }
  :where(${partSelector(navItemContract, "root")}[aria-current="page"]) {
    color: ${uiTokens.foreground};
    background: ${accentTokens.selected};
    font-weight: 500;
  }
  @media (hover: hover) {
    ${partSelector(navItemContract, "root")}:hover:not(:disabled):not([aria-current="page"]) {
      background: ${uiTokens.hover};
    }
  }
  ${partSelector(navItemContract, "root")}:disabled {
    color: ${uiTokens.subtleForeground};
    cursor: not-allowed;
  }
  ${partSelector(navItemContract, "icon")} {
    display: inline-flex;
    width: ${uiTokens.iconSize};
    flex-shrink: 0;
  }
  ${partSelector(navItemContract, "icon")} svg {
    width: ${uiTokens.iconSize};
    height: ${uiTokens.iconSize};
  }
  ${partSelector(navItemContract, "badge")} {
    margin-left: auto;
    flex-shrink: 0;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
  }
  ${partSelector(navItemContract, "label")} {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  @media (pointer: coarse) {
    ${partSelector(navItemContract, "root")} {
      min-height: 44px;
    }
  }
`;
