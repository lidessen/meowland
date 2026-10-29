import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { chartTokens } from "../shared/chart.tokens";
import type { Chart } from "../../components/chart";
const chart = parts<typeof Chart>("chart");
export const chartStyles = css`
  ${chart.root} {
    display: grid;
    gap: ${uiTokens.space.group};
    min-width: 0;
    margin: 0;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  ${chart.caption} {
    display: grid;
    gap: 2px;
  }
  ${chart.title} {
    font-weight: ${uiTokens.type.weight.medium};
  }
  ${chart.description} {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
  }
  ${chart.legend} {
    display: flex;
    flex-wrap: wrap;
    gap: 4px ${uiTokens.space.section};
    margin: 0;
    padding: 0;
    list-style: none;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
  }
  ${chart.legend}[hidden] {
    display: none;
  }
  ${chart.legendItem} {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  ${chart.swatch} {
    flex: none;
    fill: currentColor;
  }
  /* Series colors in their fixed order; each mark reads its slot. */
  :is(${chart.swatch}, ${chart.bar}, ${chart.series})[data-series="1"] {
    color: ${chartTokens.series1};
  }
  :is(${chart.swatch}, ${chart.bar}, ${chart.series})[data-series="2"] {
    color: ${chartTokens.series2};
  }
  :is(${chart.swatch}, ${chart.bar}, ${chart.series})[data-series="3"] {
    color: ${chartTokens.series3};
  }
  :is(${chart.swatch}, ${chart.bar}, ${chart.series})[data-series="4"] {
    color: ${chartTokens.series4};
  }
  :is(${chart.swatch}, ${chart.bar}, ${chart.series})[data-series="5"] {
    color: ${chartTokens.series5};
  }
  :is(${chart.swatch}, ${chart.bar}, ${chart.series})[data-series="6"] {
    color: ${chartTokens.series6};
  }
  :is(${chart.swatch}, ${chart.bar}, ${chart.series})[data-series="7"] {
    color: ${chartTokens.series7};
  }
  :is(${chart.swatch}, ${chart.bar}, ${chart.series})[data-series="8"] {
    color: ${chartTokens.series8};
  }
  ${chart.plot} {
    position: relative;
    min-width: 0;
    border-radius: ${uiTokens.radius.md};
    outline: none;
    touch-action: pan-y;
  }
  ${chart.plot}:focus-visible {
    outline: 2px solid ${uiTokens.state.focus};
    outline-offset: 2px;
  }
  ${chart.svg} {
    display: block;
    overflow: visible;
  }
  ${chart.gridLine} {
    stroke: ${uiTokens.line.divider};
    stroke-width: 1;
    shape-rendering: crispEdges;
  }
  ${chart.gridLine}[data-zero="true"] {
    stroke: ${uiTokens.line.control};
  }
  :is(${chart.tick}, ${chart.category}) {
    fill: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    font-variant-numeric: tabular-nums;
  }
  ${chart.cursor} {
    stroke: ${uiTokens.line.controlHover};
    stroke-width: 1;
    stroke-dasharray: 3 3;
  }
  ${chart.bar} {
    fill: currentColor;
    transition: opacity ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  /* The inspected category stays full; the others step back. */
  ${chart.plot}:has(${chart.bar}[data-active]) ${chart.bar}:not([data-active]) {
    opacity: 0.45;
  }
  ${chart.line} {
    stroke: currentColor;
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  ${chart.marker} {
    fill: currentColor;
    stroke: ${uiTokens.surface.knockout};
    stroke-width: 1.5;
  }
  ${chart.tooltip} {
    position: absolute;
    /* Below the plot, so the readout never covers the marks it describes. */
    top: calc(100% + 4px);
    z-index: 1;
    max-width: min(280px, 100%);
    padding: 6px 8px;
    border-radius: ${uiTokens.radius.md};
    background: ${uiTokens.inverse.surface};
    color: ${uiTokens.inverse.ink};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    pointer-events: none;
  }
  ${chart.tooltip}[hidden] {
    display: none;
  }
  ${chart.live} {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ${chart.data} {
    font-size: ${uiTokens.type.caption};
  }
  ${chart.dataToggle} {
    width: fit-content;
    color: ${uiTokens.ink.secondary};
    cursor: pointer;
  }
  ${chart.dataToggle}:focus-visible {
    outline: 2px solid ${uiTokens.state.focus};
    outline-offset: 2px;
    border-radius: ${uiTokens.radius.xs};
  }
  ${chart.data}[open] > ${chart.dataToggle} {
    margin-bottom: ${uiTokens.space.group};
  }
  @media (prefers-reduced-motion: reduce) {
    ${chart.bar} {
      transition: none;
    }
  }
`;
