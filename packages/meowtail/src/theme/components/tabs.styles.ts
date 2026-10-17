import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { tabsContract, tabsCount, tabsIndex } from "../../components/tabs";

export const tabsStyles = css`
  ${partSelector(tabsContract, "root")} {
    min-width: 0;
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontBody};
  }
  ${partSelector(tabsContract, "list")} {
    position: relative;
    display: grid;
    grid-template-columns: repeat(${tabsCount}, minmax(0, 1fr));
    padding: 4px;
    border-radius: ${uiTokens.radiusLarge};
    background: ${uiTokens.surfaceMuted};
  }
  ${partSelector(tabsContract, "indicator")} {
    position: absolute;
    inset-block: 4px;
    inset-inline-start: 4px;
    width: calc((100% - 8px) / ${tabsCount});
    box-sizing: border-box;
    border: 0.5px solid ${uiTokens.borderSubtle};
    border-radius: ${uiTokens.controlRadius};
    background: ${uiTokens.surface};
    transform: translateX(calc(${tabsIndex} * 100%));
    transition: transform 180ms ease;
    pointer-events: none;
  }
  ${partSelector(tabsContract, "indicator")}:dir(rtl) {
    transform: translateX(calc(${tabsIndex} * -100%));
  }
  ${partSelector(tabsContract, "indicator")}[hidden] {
    display: none;
  }
  ${partSelector(tabsContract, "tab")} {
    position: relative;
    min-width: 0;
    box-sizing: border-box;
    min-height: 34px;
    padding: 0 12px;
    border: 0;
    border-radius: ${uiTokens.controlRadius};
    background: transparent;
    color: ${uiTokens.mutedForeground};
    font: inherit;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    transition: color 180ms ease;
  }
  ${partSelector(tabsContract, "tab")}[aria-selected="true"] {
    color: ${uiTokens.foreground};
    font-weight: 600;
  }
  ${partSelector(tabsContract, "tab")}:hover:not(:disabled) {
    color: ${uiTokens.foreground};
  }
  ${partSelector(tabsContract, "tab")}:disabled {
    color: ${uiTokens.subtleForeground};
    cursor: default;
  }
  ${partSelector(tabsContract, "tab")}:focus-visible,
  ${partSelector(tabsContract, "panel")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: -2px;
  }
  ${partSelector(tabsContract, "tab")}:focus-visible {
    outline: none;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 4px;
  }
  ${partSelector(tabsContract, "panel")} {
    padding-block: ${uiTokens.spaceSection};
    overflow-wrap: anywhere;
  }
  ${partSelector(tabsContract, "panel")}[hidden] {
    display: none;
  }
  @media (pointer: coarse) {
    ${partSelector(tabsContract, "tab")} {
      min-height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :where(${partSelector(tabsContract, "indicator")}, ${partSelector(tabsContract, "tab")}) {
      transition: none;
    }
  }
`;
