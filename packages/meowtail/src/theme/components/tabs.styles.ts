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
    /* Same track as SegmentedControl: one control height, concentric radii. */
    padding: ${uiTokens.trackInset};
    border-radius: calc(${uiTokens.radiusSmall} + ${uiTokens.trackInset});
    background: ${uiTokens.surfaceMuted};
  }
  ${partSelector(tabsContract, "indicator")} {
    position: absolute;
    inset-block: ${uiTokens.trackInset};
    inset-inline-start: ${uiTokens.trackInset};
    width: calc((100% - 2 * ${uiTokens.trackInset}) / ${tabsCount});
    box-sizing: border-box;
    border-radius: ${uiTokens.radiusSmall};
    background: ${uiTokens.thumbSurface};
    box-shadow: ${uiTokens.shadowThumb};
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
    min-height: calc(${uiTokens.controlHeight} - 2 * ${uiTokens.trackInset});
    padding: 0 12px;
    border: 0;
    border-radius: ${uiTokens.radiusSmall};
    background: transparent;
    color: ${uiTokens.mutedForeground};
    font: inherit;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    transition: color 180ms ease;
  }
  ${partSelector(tabsContract, "tab")}[aria-selected="true"] {
    color: ${uiTokens.foreground};
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
    outline-offset: -2px;
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
