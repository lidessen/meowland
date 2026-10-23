import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing, surface, text } from "../recipes";
import { chartTokens } from "../shared/chart.tokens";
import { mermaidDiagramContract } from "../../components/mermaid-diagram.contract";

const part = (name: (typeof mermaidDiagramContract.parts)[number]) =>
  partSelector(mermaidDiagramContract, name);

/*
 * A diagram is content to look at, so it sits on the raised surface with the hairline edge, its
 * header a divider apart. Inside, Pele's variables take the library's roles: shapes on the overlay
 * rung with the control hairline, so they lift off both the frame and a group; groups a step
 * below on the canvas rung; connectors in tertiary ink; emphasis in the accent; charts in the
 * shared series order. Text draws at body size. Colors follow the scheme without a redraw.
 */
export const mermaidDiagramStyles = css`
  ${part("root")} {
    min-width: 0;
    max-width: 100%;
    margin: 0;
    ${surface("raised")}
    overflow: hidden;
  }
  ${part("header")} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 12px;
    padding: 8px 8px 8px 16px;
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  }
  ${part("title")} {
    min-width: 0;
    ${text("label")}
    overflow-wrap: anywhere;
  }
  ${part("caption")} {
    min-width: 0;
    ${text("caption")}
    color: ${uiTokens.ink.tertiary};
    overflow-wrap: anywhere;
  }
  ${part("actions")} {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: ${uiTokens.space.group};
    min-width: 0;
    margin-inline-start: auto;
  }
  ${part("canvas")} {
    position: relative;
    min-width: 0;
    padding: ${uiTokens.space.panel};
    color: ${uiTokens.ink.primary};
    font-size: ${uiTokens.type.body};
    --pele-bg: ${uiTokens.surface.raised};
    --pele-fg: ${uiTokens.ink.primary};
    --pele-muted: ${uiTokens.ink.secondary};
    --pele-line: ${uiTokens.ink.tertiary};
    --pele-surface: ${uiTokens.surface.overlay};
    --pele-surface-alt: ${uiTokens.surface.canvas};
    --pele-border: ${uiTokens.line.control};
    --pele-accent: ${uiTokens.accent.base};
    --pele-error: ${uiTokens.status.danger};
    --pele-critical: ${uiTokens.status.danger};
    --pele-font: ${uiTokens.type.sans};
    --pele-font-mono: ${uiTokens.type.mono};
    --pele-radius: ${uiTokens.radius.md};
    --pele-title-weight: ${uiTokens.type.weight.semibold};
    --pele-heading-weight: ${uiTokens.type.weight.semibold};
    --pele-bold-weight: ${uiTokens.type.weight.semibold};
    --pele-series-1: ${chartTokens.series1};
    --pele-series-2: ${chartTokens.series2};
    --pele-series-3: ${chartTokens.series3};
    --pele-series-4: ${chartTokens.series4};
    --pele-series-5: ${chartTokens.series5};
    --pele-series-6: ${chartTokens.series6};
    --pele-series-7: ${chartTokens.series7};
    --pele-series-8: ${chartTokens.series8};
    --pele-zoom-top: ${uiTokens.space.group};
    --pele-zoom-right: ${uiTokens.space.group};
  }
  /* Nothing drawn yet: the canvas keeps no empty band above the source. After a failure only
     the error line and the source show, not the engine's own message. */
  ${part("root")}:not([data-state="ready"]) ${part("canvas")} {
    padding: 0;
  }
  ${part("root")}[data-state="error"] ${part("canvas")} {
    display: none;
  }
  /*
   * Charts follow the data-visualization rules: thin marks with surface gaps, recessive grid and
   * axes, text in text ink. Pele draws them; these rules restyle its marks, and its class names
   * are not an API, so the browser test pins each one used here.
   */
  /* The pie reads as a donut: a ring with 2px surface gaps between slices. */
  ${part("canvas")} .pele-slices {
    stroke-width: 2px;
    mask-image: radial-gradient(circle closest-side, transparent 56%, black 56.5%);
  }
  /* Slice labels sit on the ring, on saturated series colors in both schemes. */
  ${part("canvas")} .pele-slice-labels[fill] {
    fill: ${uiTokens.inverse.ink};
    font-weight: ${uiTokens.type.weight.medium};
  }
  ${part("canvas")} :is(.pele-legend, .pele-axis-labels, .pele-axis-titles) {
    fill: ${uiTokens.ink.secondary};
  }
  ${part("canvas")} .pele-legend rect {
    rx: 50%;
  }
  ${part("canvas")} .pele-grid {
    stroke: ${uiTokens.line.divider};
  }
  ${part("canvas")} .pele-axis {
    stroke: ${uiTokens.line.edge};
  }
  /* Bars narrow to a little over half their slot around their own center, so the plot reads as
     marks rather than a block of color; the data end keeps a small round. */
  ${part("canvas")} .pele-bars rect {
    transform: scaleX(0.56);
    transform-box: fill-box;
    transform-origin: center;
    rx: 4px;
  }
  /* Line points: a filled dot ringed in the surface, large enough to read over a bar. */
  ${part("canvas")} .pele-line circle {
    r: 4px;
    stroke: ${uiTokens.surface.raised};
    stroke-width: 2px;
  }
  ${part("canvas")} > svg {
    display: block;
    max-width: 100%;
    height: auto;
    margin-inline: auto;
  }
  ${part("source")} {
    margin: 0;
    padding: 16px;
    overflow: auto;
    background: ${uiTokens.surface.fill};
    font: ${uiTokens.type.code} / ${uiTokens.type.line.code} ${uiTokens.type.mono};
    white-space: pre;
  }
  ${part("source")}:focus-visible {
    ${focusRing({ inset: true })}
  }
  ${part("error")} {
    margin: 0;
    padding: 12px 16px 0;
    ${text("caption")}
    color: ${uiTokens.status.danger};
  }
  ${part("feedback")}:empty {
    display: none;
  }
  ${part("feedback")} {
    display: block;
    padding: 0 16px 12px;
    ${text("caption")}
  }
`;
