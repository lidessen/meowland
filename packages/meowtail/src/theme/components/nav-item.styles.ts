import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { NavItem } from "../../components/nav-item";
import { ui } from "../utilities";
const navItemPartRefs = parts<typeof NavItem>("nav-item");
export const navItemStyles = css`
  :where(${navItemPartRefs.root}) {
    box-sizing: border-box;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  :where(${navItemPartRefs.root}):focus-visible {
    ${ui.focus.ring}
  }
  ${navItemPartRefs.root} {
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
  :where(${navItemPartRefs.root}[aria-current="page"]) {
    color: ${uiTokens.ink.primary};
    background: ${uiTokens.accent.selected};
    font-weight: ${uiTokens.type.weight.medium};
  }
  @media (hover: hover) {
    ${navItemPartRefs.root}:hover:not(:disabled):not([aria-current="page"]) {
      background: ${uiTokens.state.hover};
    }
  }
  ${navItemPartRefs.root}:disabled {
    color: ${uiTokens.ink.tertiary};
    cursor: not-allowed;
  }
  ${navItemPartRefs.icon} {
    display: inline-flex;
    width: ${uiTokens.icon.size};
    flex-shrink: 0;
  }
  ${navItemPartRefs.icon} svg {
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
  }
  ${navItemPartRefs.badge} {
    margin-left: auto;
    flex-shrink: 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
  }
  ${navItemPartRefs.label} {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  @media (pointer: coarse) {
    ${navItemPartRefs.root} {
      min-height: 44px;
    }
  }
`;
