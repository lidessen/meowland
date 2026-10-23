import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";
import { navItemContract } from "../../components/nav-item";

export const navItemStyles = css`
  :where(${partSelector(navItemContract, "root")}) {
    box-sizing: border-box;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body}/${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  :where(${partSelector(navItemContract, "root")}):focus-visible {
    ${focusRing()}
  }
  ${partSelector(navItemContract, "root")} {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    padding: 6px 12px;
    border: 0;
    border-radius: ${uiTokens.radius.lg};
    color: ${uiTokens.ink.primary};
    background: transparent;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
  }
  :where(${partSelector(navItemContract, "root")}[aria-current="page"]) {
    color: ${uiTokens.ink.primary};
    background: ${uiTokens.accent.selected};
    font-weight: 500;
  }
  @media (hover: hover) {
    ${partSelector(navItemContract, "root")}:hover:not(:disabled):not([aria-current="page"]) {
      background: ${uiTokens.state.hover};
    }
  }
  ${partSelector(navItemContract, "root")}:disabled {
    color: ${uiTokens.ink.tertiary};
    cursor: not-allowed;
  }
  ${partSelector(navItemContract, "icon")} {
    display: inline-flex;
    width: ${uiTokens.icon.size};
    flex-shrink: 0;
  }
  ${partSelector(navItemContract, "icon")} svg {
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
  }
  ${partSelector(navItemContract, "badge")} {
    margin-left: auto;
    flex-shrink: 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
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
