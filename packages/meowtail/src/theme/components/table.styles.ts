import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { tableContract } from "../../components/table";
import { accentTokens, layerTokens, lineTokens, radiusTokens } from "../palette";

const part = (name: (typeof tableContract.parts)[number]) => partSelector(tableContract, name);

export const tableStyles = css`
  ${part("root")} {
    min-width: 0;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/1.5 ${uiTokens.font};
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
    padding: 10px 14px;
    overflow-wrap: anywhere;
    text-align: start;
    vertical-align: middle;
  }
  ${part("heading")}[data-align="end"],
  ${part("cell")}[data-align="end"] {
    text-align: end;
  }
  ${part("heading")} {
    position: sticky;
    top: 0;
    z-index: 1;
    padding-block: 8px;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
    font-weight: 600;
    letter-spacing: 0.01em;
    white-space: nowrap;
    background: ${layerTokens.sunken};
  }
  ${part("heading")}:last-child ${part("resize")}::after {
    opacity: 0;
  }
  ${part("sort")} {
    appearance: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-height: 20px;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: inherit;
    cursor: pointer;
  }
  ${part("heading")}[data-align="end"] ${part("sort")} {
    justify-content: flex-end;
  }
  ${part("sort")} svg {
    display: block;
    width: 12px;
    height: 12px;
    flex: none;
    color: ${uiTokens.subtleForeground};
  }
  ${part("heading")}[aria-sort="ascending"] ${part("sort")},
  ${part("heading")}[aria-sort="descending"] ${part("sort")} {
    color: ${uiTokens.foreground};
  }
  ${part("heading")}[aria-sort="ascending"] ${part("sort")} svg,
  ${part("heading")}[aria-sort="descending"] ${part("sort")} svg {
    color: currentColor;
  }
  ${part("sort")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
    border-radius: 2px;
  }
  ${part("resize")} {
    position: absolute;
    inset-block: 0;
    inset-inline-end: 0;
    width: 10px;
    cursor: col-resize;
  }
  ${part("resize")}::after {
    content: "";
    position: absolute;
    inset-block: 8px;
    inset-inline-end: 4px;
    width: 1px;
    background: ${lineTokens.divider};
    transition:
      background-color ${uiTokens.durationResponse} ${uiTokens.ease},
      width ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  @media (hover: hover) {
    ${part("heading")}:hover ${part("resize")}::after,
    ${part("resize")}:hover::after {
      background: ${uiTokens.mutedForeground};
      opacity: 1;
    }
    ${part("resize")}:hover::after {
      width: 2px;
    }
  }
  ${part("body")} ${part("row")} ${part("cell")} {
    transition: background-color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${part("row")} + ${part("row")} ${part("cell")} {
    border-top: ${lineTokens.width} solid ${lineTokens.divider};
  }
  @media (hover: hover) {
    ${part("body")} ${part("row")}:hover ${part("cell")} {
      background: ${uiTokens.hover};
    }
  }
  ${part("body")} ${part("row")}[data-selected="true"] ${part("cell")} {
    background: ${accentTokens.selected};
  }
  @media (hover: hover) {
    ${part("body")} ${part("row")}[data-selected="true"]:hover ${part("cell")} {
      background: color-mix(in srgb, ${accentTokens.selected} 70%, ${uiTokens.hover});
    }
  }
  ${part("body")} ${part("row")}:has(input:disabled) ${part("cell")} {
    color: ${uiTokens.subtleForeground};
  }
  ${part("cell")}[data-table-select],
  ${part("heading")}:has(${part("select")}) {
    width: 44px;
    padding-inline: 12px;
  }
  ${part("select")} {
    display: grid;
    place-items: center;
  }
  @media (prefers-reduced-motion: reduce) {
    ${part("body")} ${part("row")} ${part("cell")},
    ${part("resize")}::after {
      transition: none;
    }
  }
`;
