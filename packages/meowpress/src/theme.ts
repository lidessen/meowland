import { css, defineTheme } from "meowcss/meowjsx";
import {
  journalFonts,
  journalThemeTokens,
  standardOptions,
  standardThemeStyles,
  ui,
  uiTokens,
} from "meowtail/theme";

/** Site chrome and the host-owned skill browser; editorial components are painted by Journal. */
const siteStyles = css`
  body {
    margin: 0;
    background: ${uiTokens.surface.canvas};
    color: ${uiTokens.ink.primary};
    font-family: ${uiTokens.type.sans};
    font-optical-sizing: auto;
    -webkit-font-smoothing: antialiased;
  }
  [hidden] {
    display: none !important;
  }
  .site-shell {
    padding: 0 ${uiTokens.space.pageInline};
  }
  .site-icon-label {
    display: inline-flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    max-width: 100%;
    overflow-wrap: anywhere;
  }
  .site-icon-label .meow-github-icon {
    flex-shrink: 0;
  }
  .site-header,
  .site-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${uiTokens.space.section};
    padding-block: ${uiTokens.space.panel};
    ${ui.text.caption}
  }
  .site-header {
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.edge};
  }
  .site-footer {
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.edge};
  }
  .site-name {
    color: ${uiTokens.ink.primary};
    font-family: ${uiTokens.type.display};
    font-size: ${uiTokens.type.title};
    font-weight: ${uiTokens.type.weight.display};
    line-height: ${uiTokens.type.line.title};
    text-decoration: none;
  }
  .site-nav {
    display: flex;
    flex-wrap: wrap;
    gap: ${uiTokens.space.insetBlock};
  }
  .site-nav a,
  .site-footer a,
  .skill-back,
  .skill-browser-actions a {
    color: ${uiTokens.ink.secondary};
    text-decoration: none;
  }
  .site-nav a:hover,
  .site-footer a:hover,
  .site-nav a[aria-current="page"],
  .skill-back:hover,
  .skill-browser-actions a:hover {
    color: ${uiTokens.accent.ink};
    text-decoration: underline;
    text-underline-offset: 0.25em;
  }
  .site-locale-switch {
    display: flex;
    flex-wrap: wrap;
    gap: ${uiTokens.space.insetBlock};
  }
  .site-locale-switch a {
    color: ${uiTokens.ink.tertiary};
    text-decoration: none;
  }
  .site-locale-switch a:hover,
  .site-locale-switch a[aria-current="true"] {
    color: ${uiTokens.accent.ink};
    text-decoration: underline;
    text-underline-offset: 0.25em;
  }
  .translation-notices {
    display: grid;
    gap: ${uiTokens.space.group};
    color: ${uiTokens.ink.tertiary};
  }
  #main-content {
    padding-block: ${uiTokens.space.pageBlock};
  }
  /* Code stays left-to-right on a right-to-left page; the page direction would reorder it. */
  pre {
    direction: ltr;
  }
  .skip-link {
    position: absolute;
    top: 0;
    inset-inline-start: ${uiTokens.space.pageInlineCompact};
    transform: translateY(-110%);
    padding: ${uiTokens.space.group};
    background: ${uiTokens.surface.raised};
    color: ${uiTokens.ink.primary};
    z-index: 1;
  }
  .skip-link:focus {
    transform: none;
  }
  .feed {
    display: grid;
    gap: ${uiTokens.space.section};
  }
  .feed-filter {
    padding-block: ${uiTokens.space.group};
  }
  .feed-filter [aria-pressed="true"] {
    background: ${uiTokens.accent.soft};
    color: ${uiTokens.accent.ink};
  }
  .filter-count {
    color: ${uiTokens.ink.tertiary};
    font-variant-numeric: tabular-nums;
  }
  .home-heading {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: ${uiTokens.space.section};
  }
  .home-heading-copy {
    display: grid;
    gap: ${uiTokens.space.group};
    min-width: 0;
  }
  .hero-image {
    display: block;
    width: 72px;
    max-height: 112px;
    object-fit: contain;
  }
  .feed-image {
    display: block;
    max-width: min(100%, 180px);
    max-height: 180px;
    object-fit: contain;
  }
  .feed-image {
    display: block;
    max-width: min(100%, 180px);
    max-height: 180px;
    object-fit: contain;
  }
  .hero-image {
    margin-inline-start: auto;
  }
  .feed-image {
    margin: ${uiTokens.space.section} auto 0;
  }
  .post-nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${uiTokens.space.panel};
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    padding-top: ${uiTokens.space.section};
  }
  .site-avatar {
    display: grid;
    place-items: center;
    width: 80px;
    height: 80px;
    border-radius: ${uiTokens.radius.full};
    overflow: hidden;
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.accent.ink};
    font-family: ${uiTokens.type.display};
    font-size: ${uiTokens.type.pageTitle};
    line-height: ${uiTokens.type.line.pageTitle};
  }
  .site-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .skill-command-text {
    overflow-wrap: anywhere;
  }
  .skill-back {
    ${ui.text.caption}
  }
  .skill-browser-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: ${uiTokens.space.group};
    padding: ${uiTokens.space.insetBlock};
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    background: ${uiTokens.surface.fill};
    border-radius: ${uiTokens.radius.md};
  }
  .skill-command {
    min-width: 0;
    overflow-wrap: anywhere;
    ${ui.text.caption}
  }
  .skill-scope-badge {
    display: block;
    color: ${uiTokens.accent.ink};
    margin-bottom: ${uiTokens.space.group};
  }
  .skill-browser-actions {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.insetBlock};
    ${ui.text.caption}
  }
  .skill-stage {
    min-width: 0;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.md};
    background: ${uiTokens.surface.raised};
  }
  .skill-view-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: ${uiTokens.space.group};
    padding: ${uiTokens.space.group};
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.edge};
  }
  .skill-browser-actions button,
  .skill-view-tabs button,
  .skill-files button {
    border: 0;
    border-radius: ${uiTokens.radius.sm};
    padding: ${uiTokens.space.group} ${uiTokens.space.insetBlock};
    background: transparent;
    color: ${uiTokens.ink.secondary};
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.caption};
    font-weight: ${uiTokens.type.weight.medium};
    line-height: ${uiTokens.type.line.caption};
    cursor: pointer;
  }
  .skill-browser-actions button {
    background: ${uiTokens.surface.raised};
  }
  .skill-browser-actions button:hover,
  .skill-view-tabs button:hover,
  .skill-files button:hover {
    color: ${uiTokens.ink.primary};
    background: ${uiTokens.state.hover};
  }
  .skill-view-tabs button[aria-pressed="true"],
  .skill-files button.active {
    background: ${uiTokens.accent.soft};
    color: ${uiTokens.accent.ink};
  }
  .skill-browser {
    display: grid;
    grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  }
  .skill-files {
    padding: ${uiTokens.space.insetBlock};
    min-width: 0;
  }
  .skill-files-label {
    display: block;
    margin-bottom: ${uiTokens.space.group};
    ${ui.text.eyebrow}
  }
  .skill-files ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .skill-files ul ul {
    padding-inline-start: ${uiTokens.space.group};
  }
  .skill-files .folder > span {
    display: block;
    padding: ${uiTokens.space.group};
    ${ui.text.caption} color: ${uiTokens.ink.tertiary};
    overflow-wrap: anywhere;
  }
  .skill-files button {
    width: 100%;
    text-align: start;
    overflow-wrap: anywhere;
  }
  .skill-viewer {
    min-width: 0;
    border-inline-start: ${uiTokens.line.width} solid ${uiTokens.line.edge};
  }
  .skill-viewer-bar {
    display: flex;
    justify-content: space-between;
    gap: ${uiTokens.space.group};
    padding: ${uiTokens.space.insetBlock};
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    ${ui.text.caption} color: ${uiTokens.ink.tertiary};
    overflow-wrap: anywhere;
  }
  .skill-file-panel {
    padding: ${uiTokens.space.panel};
  }
  .skill-reading-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.edge};
  }
  .skill-reading-summary span {
    display: grid;
    gap: ${uiTokens.space.group};
    padding: ${uiTokens.space.insetBlock};
    ${ui.text.caption} color: ${uiTokens.ink.secondary};
  }
  .skill-reading-summary strong {
    ${ui.text.body} color: ${uiTokens.ink.primary};
  }
  .skill-reading-summary .has-issue strong {
    color: ${uiTokens.status.warning};
  }
  .skill-graph-canvas {
    padding: ${uiTokens.space.panel};
    overflow: auto;
    max-height: 720px;
  }
  .skill-graph-svg {
    display: block;
    max-width: none;
  }
  .skill-graph-edge {
    fill: none;
    stroke: ${uiTokens.line.controlHover};
    stroke-width: 1.2;
    vector-effect: non-scaling-stroke;
  }
  .skill-graph-edge.external {
    stroke-dasharray: 4 4;
  }
  .skill-graph-arrow {
    fill: ${uiTokens.line.controlHover};
  }
  .skill-graph-edge-label rect {
    fill: ${uiTokens.surface.raised};
  }
  .skill-graph-edge-label text {
    fill: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    text-anchor: middle;
  }
  .skill-graph-node {
    text-decoration: none;
  }
  .skill-graph-node rect {
    fill: ${uiTokens.surface.raised};
    stroke: ${uiTokens.line.control};
    stroke-width: 1;
  }
  .skill-graph-node.external rect,
  .skill-graph-node.unreferenced rect {
    stroke-dasharray: 4 3;
  }
  .skill-graph-node.missing rect {
    fill: ${uiTokens.accent.soft};
    stroke: ${uiTokens.accent.base};
    stroke-dasharray: 3 3;
  }
  .skill-graph-node:hover rect,
  .skill-graph-node.active rect {
    fill: ${uiTokens.accent.soft};
    stroke: ${uiTokens.accent.base};
  }
  .skill-graph-node text {
    pointer-events: none;
    text-anchor: middle;
    font-size: ${uiTokens.type.caption};
  }
  .skill-graph-node-name {
    fill: ${uiTokens.ink.primary};
    font-family: ${uiTokens.type.mono};
    font-weight: ${uiTokens.type.weight.medium};
  }
  .skill-graph-node-role {
    fill: ${uiTokens.ink.secondary};
  }
  .skill-reading-paths,
  .skill-reading-issues,
  .skill-reading-empty {
    padding: ${uiTokens.space.panel};
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.edge};
  }
  .skill-reading-paths h3 {
    margin: 0 0 ${uiTokens.space.insetBlock};
    ${ui.text.title}
  }
  .skill-reading-paths ol {
    display: grid;
    gap: ${uiTokens.space.group};
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .skill-reading-paths li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: ${uiTokens.space.insetBlock};
    padding: ${uiTokens.space.insetBlock};
    background: ${uiTokens.surface.fill};
    border-radius: ${uiTokens.radius.sm};
  }
  .skill-reading-edge,
  .skill-reading-context {
    overflow-wrap: anywhere;
    ${ui.text.caption}
  }
  .skill-reading-edge {
    display: flex;
    align-items: start;
    flex-wrap: wrap;
    gap: ${uiTokens.space.group};
  }
  .skill-reading-edge > .meow-icon {
    color: ${uiTokens.accent.ink};
  }
  .skill-reading-context {
    display: grid;
    color: ${uiTokens.ink.secondary};
  }
  .skill-reading-issues {
    background: ${uiTokens.accent.soft};
  }
  .skill-reading-issues p,
  .skill-reading-empty p {
    ${ui.text.body} overflow-wrap: anywhere;
    color: ${uiTokens.ink.secondary};
  }
  .skill-reading-issues code {
    margin-inline-end: ${uiTokens.space.group};
  }
  .skill-graph-status {
    padding: ${uiTokens.space.insetBlock};
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    overflow-wrap: anywhere;
    ${ui.text.caption} color: ${uiTokens.ink.secondary};
  }
  .mdx-callout {
    padding: ${uiTokens.space.insetBlock};
    background: ${uiTokens.accent.soft};
    border-inline-start: 3px solid ${uiTokens.accent.base};
  }
  @media (max-width: 720px) {
    .site-shell {
      padding-inline: ${uiTokens.space.pageInlineCompact};
    }
    .site-header,
    .site-footer {
      flex-wrap: wrap;
      gap: ${uiTokens.space.insetBlock};
    }
    #main-content {
      padding-block: ${uiTokens.space.pageBlockCompact};
    }
    .skill-browser {
      grid-template-columns: minmax(0, 1fr);
    }
    .skill-files {
      border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    }
    .skill-viewer {
      border-inline-start: 0;
    }
    .skill-file-panel,
    .skill-reading-paths,
    .skill-reading-issues,
    .skill-reading-empty {
      padding: ${uiTokens.space.insetBlock};
    }
    .skill-reading-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .skill-reading-paths li,
    .post-nav {
      grid-template-columns: minmax(0, 1fr);
    }
    .post-nav > span:empty {
      display: none;
    }
    .skill-graph-canvas {
      padding: ${uiTokens.space.group};
    }
  }
  @media (pointer: coarse) {
    .site-nav a,
    .site-footer a,
    .skill-browser-actions button,
    .skill-view-tabs button,
    .skill-files button,
    .feed-filter button {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
    }
  }
`;

/** Journal's component styles and token identities, with only site-owned chrome added. */
export const blogTheme = defineTheme({
  options: standardOptions,
  defaults: { scheme: "auto" },
  tokens: journalThemeTokens,
  styles: [...standardThemeStyles, siteStyles],
});

/** The build publishes Journal's three font families and their licenses locally. */
export const blogFonts = journalFonts;
