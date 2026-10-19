import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { tableContract } from "../../components/table";
import { accentTokens, layerTokens, lineTokens, radiusTokens } from "../palette";

const part = (name: (typeof tableContract.parts)[number]) => partSelector(tableContract, name);

export const tableStyles = css`
  ${part("root")} {
    min-width: 0;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/1.4 ${uiTokens.font};
  }
  ${part("scroller")} {
    overflow: auto;
    border: ${lineTokens.width} solid ${lineTokens.edge};
    border-radius: ${radiusTokens.card};
    background: ${layerTokens.raised};
  }
  ${part("table")} {
    width: 100%;
    min-width: 24rem;
    border-collapse: collapse;
    table-layout: fixed;
  }
  ${part("heading")},
  ${part("cell")} {
    box-sizing: border-box;
    min-width: 0;
    padding: 8px 12px;
    overflow-wrap: anywhere;
    text-align: start;
    vertical-align: middle;
  }
  ${part("heading")}[data-align="end"],
  ${part("cell")}[data-align="end"] {
    text-align: end;
  }
  ${part("heading")} {
    position: relative;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
    font-weight: 600;
    background: ${layerTokens.sunken};
  }
  ${part("sort")} {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: inherit;
    cursor: pointer;
  }
  ${part("heading")}[aria-sort="ascending"] ${part("sort")}::after,
  ${part("heading")}[aria-sort="descending"] ${part("sort")}::after {
    content: "";
    width: 0;
    height: 0;
    border-inline: 4px solid transparent;
  }
  ${part("heading")}[aria-sort="ascending"] ${part("sort")}::after {
    border-bottom: 5px solid currentColor;
  }
  ${part("heading")}[aria-sort="descending"] ${part("sort")}::after {
    border-top: 5px solid currentColor;
  }
  ${part("sort")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  ${part("resize")} {
    position: absolute;
    inset-block: 0;
    inset-inline-end: 0;
    width: 8px;
    cursor: col-resize;
  }
  ${part("resize")}::after {
    content: "";
    position: absolute;
    inset-block: 6px;
    inset-inline-end: 3px;
    width: 1px;
    background: ${uiTokens.borderSoft};
  }
  ${part("row")} + ${part("row")} ${part("cell")} {
    border-top: ${lineTokens.width} solid ${lineTokens.divider};
  }
  ${part("row")}[data-selected="true"] ${part("cell")} {
    background: ${accentTokens.soft};
  }
  ${part("cell")}[data-table-select],
  ${part("heading")}:has(${part("select")}) {
    width: 44px;
    padding-inline: 10px;
  }
  ${part("select")} {
    display: grid;
    place-items: center;
  }
`;
