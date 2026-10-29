import { compileTokens, defineTokens, type TokenSet } from "meowcss";
import { css, defineTheme, parts } from "meowcss/meowjsx";
import type {
  Breadcrumb,
  Card,
  CodeBlock,
  NavList,
  Page,
  PageHeader,
  Prose,
  SearchInput,
  Section,
  Table,
} from "meowtail";
import {
  journalUiTokens,
  meowUiTokens,
  standardOptions,
  standardThemeStyles,
  standardThemeTokens,
  uiTokens,
} from "meowtail/theme";

const breadcrumb = parts<typeof Breadcrumb>("breadcrumb");
const card = parts<typeof Card>("card");
const codeBlock = parts<typeof CodeBlock>("code-block");
const navList = parts<typeof NavList>("nav-list");
const page = parts<typeof Page>("page");
const pageHeader = parts<typeof PageHeader>("page-header");
const prose = parts<typeof Prose>("prose");
const searchInput = parts<typeof SearchInput>("search-input");
const section = parts<typeof Section>("section");
const table = parts<typeof Table>("table");

/** Measurements owned by the documentation layout. */
export const docsTokens = defineTokens("docs", {
  sidebarWidth: "232px",
  headerHeight: "56px",
  readingWidth: "720px",
  homeWidth: "960px",
  previewHeight: "440px",
  previewHeightTall: "680px",
  codeHeight: "480px",
});

/** The root attribute that selects the reader's site theme; standard when absent. */
export const DOCS_THEME_ATTRIBUTE = "data-docs-theme";

/** Where the reader's choices persist; the playground reads the same keys. */
export const DOCS_APPEARANCE_STORE = "meowland-docs-appearance";
export const DOCS_THEME_STORE = "meowland-docs-theme";

/** The site themes a reader can choose besides standard, as the gallery's `theme` parameter names them. */
export const DOCS_THEMES = ["journal", "meow"] as const;
export type DocsTheme = "standard" | (typeof DOCS_THEMES)[number];

/**
 * One theme's values of the same `--ui-*` roles, in force under `data-docs-theme="<name>"`. The
 * site keeps one stylesheet and one theme root, so switching themes is one attribute and needs no
 * reload. These rules have the same zero specificity as the standard ones and follow them, so they
 * win for every scheme.
 */
function scopedThemeTokens(name: (typeof DOCS_THEMES)[number], tokens: TokenSet) {
  const scope = `[${DOCS_THEME_ATTRIBUTE}="${name}"]`;
  return css`
    ${compileTokens(tokens, {
      constants: `:where(${scope}[data-meowui-theme-root], ${scope} [data-meowui-theme-root])`,
      sources: [
        {
          options: "scheme",
          selector: `:where(${scope}[data-meowui-scope], ${scope} [data-meowui-scope])`,
        },
      ],
    })}
  `;
}

export const docsJournalTokenStyles = scopedThemeTokens("journal", journalUiTokens);
export const docsMeowTokenStyles = scopedThemeTokens("meow", meowUiTokens);

/** A reading environment built from the shared palette and component metadata. */
export const docsStyles = css`
  html,
  body {
    margin: 0;
    padding: 0;
  }
  html {
    scroll-padding-top: 88px;
    /* Mobile Safari outlines every tapped target; each control here shows its own pressed state. */
    -webkit-tap-highlight-color: transparent;
  }
  body {
    background: ${uiTokens.surface.canvas};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.reading} ${uiTokens.type.sans};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  * {
    box-sizing: border-box;
  }
  .docs-shell a:not(:where([data-meowui-part="link/root"], ${prose.root} a)) {
    color: inherit;
    text-decoration: none;
  }
  :focus-visible {
    outline: 2px solid ${uiTokens.state.focus};
    outline-offset: 3px;
  }
  [hidden] {
    display: none !important;
  }
  .docs-shell {
    display: grid;
    grid-template-columns: ${docsTokens.sidebarWidth} minmax(0, 1fr);
    align-items: start;
    min-height: 100vh;
  }

  /* The catalog is compact and visually separate from the reading surface. */
  .docs-mobile-bar {
    display: none;
  }
  .docs-sidebar {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-height: 0;
    padding: 0 12px;
    background: ${uiTokens.surface.canvas};
    border-right: ${uiTokens.line.width} solid ${uiTokens.line.edge};
  }
  .docs-brand {
    display: flex;
    align-items: center;
    gap: 9px;
    height: 76px;
    flex-shrink: 0;
    padding: 0 10px;
    color: ${uiTokens.ink.primary};
    font-size: ${uiTokens.type.title};
    font-weight: ${uiTokens.type.weight.semibold};
    letter-spacing: -0.02em;
  }
  /* The mark is a tile on its own paper; rounding it makes it one on any ground. */
  .docs-brand > img {
    width: 28px;
    height: 28px;
    border-radius: ${uiTokens.radius.md};
    object-fit: contain;
  }
  .docs-brand > span {
    margin-left: auto;
    color: ${uiTokens.ink.tertiary};
    font: ${uiTokens.type.micro} / ${uiTokens.type.line.micro} ${uiTokens.type.mono};
    letter-spacing: 0;
  }
  .docs-search {
    flex: none;
    margin-bottom: 4px;
  }
  /* The sidebar search is the library SearchInput as-is: same surface, states and ring. */
  .docs-search ${searchInput.control} {
    font-size: ${uiTokens.type.label};
  }
  .docs-catalog-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 24px 10px 12px;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.micro};
    font-weight: ${uiTokens.type.weight.medium};
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .docs-catalog-label > span {
    font-family: ${uiTokens.type.mono};
    font-variant-numeric: tabular-nums;
    letter-spacing: 0;
  }
  .docs-catalog {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding: 0 0 24px;
    scrollbar-width: thin;
    scrollbar-color: ${uiTokens.line.edge} transparent;
  }
  /* NavList keeps its own rows, group titles, radius and selection; the
     sidebar only sets density. */
  .docs-catalog ${navList.root} {
    gap: 20px;
    font-size: ${uiTokens.type.label};
  }
  .docs-catalog ${navList.group} {
    gap: 2px;
  }
  .docs-catalog ${navList.groupTitle} {
    padding-block: 0 6px;
  }
  .docs-catalog ${navList.item} {
    min-height: 32px;
    color: ${uiTokens.ink.secondary};
  }
  .docs-catalog ${navList.item}[aria-current="page"] {
    color: ${uiTokens.ink.primary};
  }
  .docs-catalog-empty {
    margin: 12px 10px;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    overflow-wrap: anywhere;
  }

  .docs-main {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .docs-header {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 12px;
    height: ${docsTokens.headerHeight};
    padding: 0 40px;
    background: ${uiTokens.surface.canvas};
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    min-width: 0;
  }
  /* Search: a field-shaped trigger in the header and a dialog over the site index. */
  .docs-search-open {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: none;
    height: 32px;
    margin-left: auto;
    padding: 0 6px 0 10px;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.md};
    background: ${uiTokens.surface.raised};
    color: ${uiTokens.ink.tertiary};
    font: inherit;
    font-size: ${uiTokens.type.label};
    cursor: pointer;
  }
  .docs-search-open[hidden] {
    display: none;
  }
  .docs-search-open > span {
    min-width: 120px;
    text-align: left;
  }
  .docs-search-open:hover {
    border-color: ${uiTokens.line.control};
    color: ${uiTokens.ink.secondary};
  }
  :is(.docs-search-open, .docs-search-field) kbd {
    padding: 1px 6px;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.sm};
    color: ${uiTokens.ink.tertiary};
    font: ${uiTokens.type.micro} / ${uiTokens.type.line.micro} ${uiTokens.type.mono};
  }
  .docs-search-dialog {
    width: min(600px, calc(100vw - 32px));
    max-height: min(560px, calc(100dvh - 120px));
    margin: 12vh auto auto;
    padding: 0;
    overflow: hidden;
    border: 0;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.overlay};
    color: ${uiTokens.ink.primary};
    box-shadow: ${uiTokens.shadow.float};
  }
  .docs-search-dialog[open] {
    display: flex;
    flex-direction: column;
    animation: docs-search-enter ${uiTokens.motion.settle} ${uiTokens.motion.enter};
  }
  .docs-search-dialog::backdrop {
    background: ${uiTokens.surface.scrim};
  }
  @keyframes docs-search-enter {
    from {
      opacity: 0;
      transform: translateY(-6px) scale(0.98);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .docs-search-dialog[open] {
      animation: none;
    }
  }
  .docs-search-field {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.divider};
    color: ${uiTokens.ink.tertiary};
  }
  .docs-search-field input {
    flex: 1;
    min-width: 0;
    height: 52px;
    border: 0;
    outline: 0;
    background: transparent;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} ${uiTokens.type.sans};
  }
  .docs-search-field input::-webkit-search-cancel-button {
    display: none;
  }
  .docs-search-results {
    flex: 1;
    min-height: 0;
    margin: 0;
    padding: 6px;
    overflow-y: auto;
    list-style: none;
  }
  .docs-search-results:empty {
    display: none;
  }
  .docs-search-results a {
    display: grid;
    gap: 2px;
    padding: 10px 12px;
    border-radius: ${uiTokens.radius.lg};
    color: inherit;
    text-decoration: none;
  }
  .docs-search-results a[aria-selected="true"] {
    background: ${uiTokens.accent.selected};
  }
  .docs-search-title {
    font-weight: ${uiTokens.type.weight.medium};
  }
  .docs-search-meta {
    overflow: hidden;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .docs-search-empty {
    margin: 0;
    padding: 28px 16px;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.label};
    text-align: center;
  }
  /* On the narrowest screens the header keeps the trail readable: Playground becomes its icon. */
  @media (max-width: 480px) {
    .docs-header-link > span {
      display: none;
    }
    .docs-header-link {
      padding: 0 8px;
    }
  }
  @media (max-width: 900px) {
    .docs-search-open > span,
    .docs-search-open > kbd {
      display: none;
    }
    .docs-search-open {
      width: 32px;
      padding: 0;
      justify-content: center;
    }
  }
  /*
   * The appearance menu: one quiet icon button that shows the current scheme and opens a small
   * panel with the two choices that set how the site looks, the theme and the scheme.
   */
  .docs-appearance-menu {
    position: relative;
    flex: none;
  }
  .docs-appearance {
    display: inline-grid;
    place-items: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: ${uiTokens.radius.md};
    background: transparent;
    color: ${uiTokens.ink.secondary};
    cursor: pointer;
  }
  .docs-appearance[hidden] {
    display: none;
  }
  .docs-appearance:hover,
  .docs-appearance[aria-expanded="true"] {
    background: ${uiTokens.state.hover};
    color: ${uiTokens.ink.primary};
  }
  .docs-appearance > svg {
    display: none;
  }
  .docs-appearance[data-appearance="auto"] > .docs-appearance-auto,
  .docs-appearance[data-appearance="light"] > .docs-appearance-light,
  .docs-appearance[data-appearance="dark"] > .docs-appearance-dark {
    display: block;
  }
  .docs-appearance-panel {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 3;
    display: grid;
    gap: 4px;
    width: 208px;
    padding: 6px;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.overlay};
    color: ${uiTokens.ink.primary};
    box-shadow: ${uiTokens.shadow.float};
  }
  .docs-appearance-panel[hidden] {
    display: none;
  }
  .docs-appearance-panel fieldset {
    display: grid;
    margin: 0;
    padding: 0;
    border: 0;
  }
  /* A background line: a fieldset border would break around its legend. */
  .docs-appearance-panel fieldset + fieldset {
    padding-top: 4px;
    background: linear-gradient(${uiTokens.line.divider}, ${uiTokens.line.divider}) top / 100%
      ${uiTokens.line.width} no-repeat;
  }
  /* Floated, the legend is an ordinary block, so the fieldset starts above it. */
  .docs-appearance-panel legend {
    float: left;
    width: 100%;
    padding: 8px 8px 4px;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.micro};
    font-weight: ${uiTokens.type.weight.medium};
    line-height: ${uiTokens.type.line.micro};
    letter-spacing: ${uiTokens.type.trackingCaps};
    text-transform: uppercase;
  }
  .docs-appearance-panel label {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: ${uiTokens.control.small};
    padding: 0 8px;
    border-radius: ${uiTokens.radius.md};
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    line-height: ${uiTokens.type.line.label};
    cursor: pointer;
  }
  .docs-appearance-panel label:hover {
    background: ${uiTokens.state.hover};
    color: ${uiTokens.ink.primary};
  }
  .docs-appearance-panel label:has(input:focus-visible) {
    outline: 2px solid ${uiTokens.state.focus};
    outline-offset: -2px;
  }
  /* The radio stays in the Tab and arrow-key order; the row shows its state. */
  .docs-appearance-panel input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }
  .docs-appearance-panel label > span {
    flex: 1;
  }
  .docs-appearance-panel label::after {
    content: "";
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
    background: currentColor;
    mask: ${uiTokens.glyph.check} center / contain no-repeat;
    visibility: hidden;
  }
  .docs-appearance-panel label:has(input:checked) {
    color: ${uiTokens.ink.primary};
    font-weight: ${uiTokens.type.weight.medium};
  }
  .docs-appearance-panel label:has(input:checked)::after {
    color: ${uiTokens.accent.ink};
    visibility: visible;
  }
  .docs-appearance-menu:has(.docs-appearance:not([hidden])) + .docs-header-link {
    margin-left: 0;
  }
  /* The filter shows its keyboard shortcut at its end. */
  .docs-search-wrap {
    position: relative;
    flex: none;
  }
  .docs-search-key {
    position: absolute;
    top: 50%;
    right: 10px;
    display: grid;
    place-items: center;
    min-width: 20px;
    height: 20px;
    padding: 0 4px;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.sm};
    color: ${uiTokens.ink.tertiary};
    font: ${uiTokens.type.micro}/1 ${uiTokens.type.mono};
    pointer-events: none;
    transform: translateY(-50%);
  }
  .docs-search-wrap:focus-within .docs-search-key {
    display: none;
  }
  .docs-search-wrap ${searchInput.control} {
    padding-right: 36px;
  }
  /* The way to the playground: a quiet labeled link, not an unnamed glyph. */
  .docs-header-link {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 4px;
    min-height: 32px;
    margin-left: auto;
    padding: 0 10px;
    border-radius: ${uiTokens.radius.md};
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    font-weight: ${uiTokens.type.weight.medium};
    text-decoration: none;
  }
  .docs-header-link:hover {
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
  }
  .docs-header ${breadcrumb.item}:not(:last-child) ${breadcrumb.current} {
    color: ${uiTokens.ink.secondary};
    font-weight: ${uiTokens.type.weight.regular};
  }
  .docs-header ${breadcrumb.current} {
    font-size: ${uiTokens.type.caption};
    font-weight: ${uiTokens.type.weight.medium};
  }

  /* Identity, installation and prose share one reading axis. */
  .docs-content {
    min-width: 0;
    padding: 48px 40px 0;
  }
  .docs-article {
    width: 100%;
    max-width: ${docsTokens.readingWidth};
    min-width: 0;
    margin-inline: auto;
  }
  .docs-article ${page.root}, .docs-article ${section.root} {
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.line.reading};
  }
  .docs-article ${page.header} {
    margin-bottom: 32px;
    gap: 12px;
  }
  .docs-article ${page.eyebrow} {
    font-size: ${uiTokens.type.micro};
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .docs-article ${pageHeader.copy} {
    gap: 14px;
  }
  .docs-article ${pageHeader.title} {
    font-size: ${uiTokens.type.hero};
    line-height: ${uiTokens.type.line.hero};
    font-weight: ${uiTokens.type.weight.semibold};
    letter-spacing: -0.035em;
  }
  .docs-article ${pageHeader.description} {
    max-width: 62ch;
    font-size: ${uiTokens.type.title};
    line-height: ${uiTokens.type.line.title};
  }
  .docs-article ${page.content}, .docs-sections {
    display: grid;
    gap: 40px;
    min-width: 0;
  }
  .docs-article ${section.root} {
    gap: 16px;
    scroll-margin-top: 88px;
  }
  .docs-article ${section.title} {
    font-size: ${uiTokens.type.heading};
    font-weight: ${uiTokens.type.weight.semibold};
    line-height: ${uiTokens.type.line.heading};
    letter-spacing: -0.02em;
  }
  .docs-article ${section.description} {
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.line.reading};
  }
  .docs-article ${section.content} {
    gap: 16px;
  }
  .docs-reading-layout {
    display: grid;
    gap: 32px;
    min-width: 0;
  }
  .docs-toc {
    min-width: 0;
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    color: ${uiTokens.ink.secondary};
  }
  .docs-toc-desktop {
    display: none;
  }
  .docs-toc-disclosure {
    border-block: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    padding-block: 12px;
  }
  .docs-toc-disclosure > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    list-style: none;
    color: ${uiTokens.ink.primary};
    cursor: pointer;
    font-weight: ${uiTokens.type.weight.medium};
  }
  .docs-toc-disclosure > summary::-webkit-details-marker {
    display: none;
  }
  .docs-toc-disclosure > summary > svg {
    color: ${uiTokens.ink.tertiary};
    transition: transform ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  .docs-toc-disclosure[open] > summary > svg {
    transform: rotate(180deg);
  }
  .docs-toc nav {
    display: grid;
    gap: 10px;
    padding-top: 16px;
  }
  .docs-toc a {
    display: block;
  }
  .docs-toc a:hover {
    color: ${uiTokens.ink.primary};
  }
  .docs-note {
    margin: 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    line-height: ${uiTokens.type.line.label};
  }
  .docs-example {
    min-width: 0;
    gap: 12px;
  }
  .docs-example-head {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
  .docs-example-title {
    margin: 0;
    font-size: ${uiTokens.type.body};
    font-weight: ${uiTokens.type.weight.semibold};
    letter-spacing: -0.005em;
  }
  /* One specimen: the live preview on the raised surface, its code recessed
     beneath it, inside a single hairline frame. */
  .docs-specimen {
    min-width: 0;
    overflow: hidden;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.raised};
    box-shadow: ${uiTokens.shadow.raised};
  }
  ${card.root}.docs-preview-card {
    padding: 0;
    overflow: hidden;
    border: 0;
    border-radius: 0;
    background: ${uiTokens.surface.canvas};
    box-shadow: none;
  }
  .docs-preview-frame {
    display: block;
    width: 100%;
    height: ${docsTokens.previewHeight};
    border: 0;
  }
  .docs-preview-frame-tall {
    height: ${docsTokens.previewHeightTall};
  }

  /* Code scrolls locally. Static pages omit actions that require a runtime. */
  .docs-article ${codeBlock.root} {
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.xl};
  }
  .docs-specimen ${codeBlock.root} {
    border: 0;
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
    border-radius: 0;
  }
  /* Once tabs show one panel at a time, the code fills the frame on its own. */
  [data-docs-tabs="ready"] .docs-specimen ${codeBlock.root} {
    border-top: 0;
  }
  [data-docs-panel][hidden] {
    display: none;
  }
  /* Props: the name, a required mark and its JSDoc stack in the first column; types wrap. */
  .docs-prop {
    display: grid;
    gap: 4px;
    min-width: 12rem;
  }
  .docs-prop-name {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .docs-prop-name > code {
    font-weight: ${uiTokens.type.weight.semibold};
  }
  .docs-prop-required {
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
  }
  .docs-prop-note {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    line-height: ${uiTokens.type.line.label};
    white-space: normal;
  }
  .docs-prop-type {
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .docs-prop-shape {
    display: block;
    padding: 8px 12px;
    border-radius: ${uiTokens.radius.md};
    background: ${uiTokens.surface.fill};
    font-size: ${uiTokens.type.label};
  }
  .docs-prop-none {
    color: ${uiTokens.ink.tertiary};
  }
  /* Preview and Code: text tabs on a hairline, the selected one underlined in ink; the way into
     the playground sits at the far end of the same line. */
  .docs-example-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  }
  .docs-tabs {
    display: flex;
    gap: 20px;
  }
  a.docs-example-open {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    padding: 6px 0 8px;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    font-weight: ${uiTokens.type.weight.medium};
    white-space: nowrap;
  }
  a.docs-example-open:hover {
    color: ${uiTokens.ink.primary};
  }
  .docs-tabs[hidden] {
    display: none;
  }
  .docs-tabs button {
    margin: 0 0 -1px;
    padding: 6px 0 8px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: none;
    color: ${uiTokens.ink.secondary};
    font: inherit;
    font-size: ${uiTokens.type.label};
    font-weight: ${uiTokens.type.weight.medium};
    cursor: pointer;
  }
  .docs-tabs button:hover {
    color: ${uiTokens.ink.primary};
  }
  .docs-tabs button[aria-selected="true"] {
    border-bottom-color: ${uiTokens.ink.primary};
    color: ${uiTokens.ink.primary};
  }
  .docs-article ${codeBlock.header} {
    padding: 10px 16px;
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.divider};
    background: transparent;
  }
  /* The code actions need script; they appear once the page wires them. */
  .docs-article ${codeBlock.actions} {
    display: none;
  }
  [data-docs-code-actions] .docs-article ${codeBlock.actions} {
    display: flex;
  }
  .docs-article ${codeBlock.content} {
    max-height: ${docsTokens.codeHeight};
    padding: 16px;
    font-size: ${uiTokens.type.code};
    line-height: ${uiTokens.type.line.code};
    scrollbar-width: thin;
  }
  .docs-install {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-width: 0;
    padding: 12px 16px;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.lg};
    background: ${uiTokens.surface.raised};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.code} / ${uiTokens.type.line.code} ${uiTokens.type.mono};
  }
  .docs-install > svg {
    flex: none;
    color: ${uiTokens.ink.secondary};
  }
  .docs-install > span {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .docs-install-copy {
    display: inline-grid;
    place-items: center;
    flex: none;
    width: 28px;
    height: 28px;
    margin: -4px -8px -4px 0;
    padding: 0;
    border: 0;
    border-radius: ${uiTokens.radius.md};
    background: transparent;
    color: ${uiTokens.ink.tertiary};
    cursor: pointer;
  }
  .docs-install-copy[hidden] {
    display: none;
  }
  .docs-install-copy:hover {
    background: ${uiTokens.state.hover};
    color: ${uiTokens.ink.primary};
  }
  .docs-install-copy > svg:last-child,
  .docs-install-copy[data-copied] > svg:first-child {
    display: none;
  }
  .docs-install-copy[data-copied] > svg:last-child {
    display: block;
    color: ${uiTokens.status.success};
  }

  /* A wider introduction leads into an index, rather than another gallery. */
  .docs-content-home .docs-article {
    max-width: ${docsTokens.homeWidth};
  }
  .docs-home-hero {
    display: grid;
    gap: 40px;
    grid-template-columns: minmax(0, 1.65fr) minmax(240px, 1fr);
    align-items: start;
    padding-block: 12px 28px;
  }
  .docs-home-intro {
    min-width: 0;
  }
  .docs-home-eyebrow {
    margin: 0 0 24px;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.micro};
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .docs-home-intro ${pageHeader.title} {
    max-width: 17ch;
    font-size: ${uiTokens.type.hero};
    line-height: ${uiTokens.type.line.hero};
    letter-spacing: -0.04em;
    text-wrap: balance;
  }
  .docs-home-intro ${pageHeader.description} {
    max-width: 46ch;
    margin-top: 8px;
    font-size: ${uiTokens.type.title};
    line-height: ${uiTokens.type.line.title};
  }
  .docs-home-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px 24px;
    margin-top: 28px;
    font-size: ${uiTokens.type.label};
  }
  .docs-home-actions .docs-home-primary {
    display: inline-flex;
    align-items: center;
    min-height: 38px;
    padding: 7px 14px;
    border-radius: ${uiTokens.radius.md};
    background: ${uiTokens.action.primary};
    color: ${uiTokens.action.onPrimary};
    font-weight: ${uiTokens.type.weight.medium};
    text-decoration: none;
  }
  .docs-home-actions .docs-home-primary:hover {
    background: ${uiTokens.action.primaryHover};
    color: ${uiTokens.action.onPrimary};
  }
  .docs-home-route {
    min-width: 0;
    padding-top: 6px;
  }
  .docs-home-route-label {
    margin: 0 0 12px;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.micro};
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .docs-home-route h2 {
    margin: 0 0 18px;
    font: ${uiTokens.type.weight.semibold} ${uiTokens.type.heading} / ${uiTokens.type.line.heading}
      ${uiTokens.type.sans};
    letter-spacing: -0.025em;
  }
  .docs-home-route ol {
    list-style: none;
    margin: 20px 0 0;
    padding: 0;
  }
  .docs-home-route li + li {
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  }
  .docs-home-route li > a {
    display: flex;
    gap: 14px;
    padding-block: 14px;
  }
  .docs-route-step {
    flex: none;
    padding-top: 2px;
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.code} / ${uiTokens.type.line.code} ${uiTokens.type.mono};
  }
  .docs-home-route li > a > span:last-child {
    display: grid;
    gap: 2px;
  }
  .docs-home-route strong {
    font-size: ${uiTokens.type.label};
    font-weight: ${uiTokens.type.weight.medium};
  }
  .docs-home-route strong + span {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
  }
  .docs-home-route li > a:hover strong,
  .docs-package-link:hover strong {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .docs-home-page ${page.content} {
    gap: 48px;
  }
  .docs-package-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 36px;
  }
  .docs-package-link {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr);
    gap: 16px;
    padding-block: 24px;
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    min-width: 0;
  }
  .docs-package-number {
    padding-top: 4px;
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.code} / ${uiTokens.type.line.code} ${uiTokens.type.mono};
  }
  .docs-package-link strong {
    font-size: ${uiTokens.type.title};
    font-weight: ${uiTokens.type.weight.semibold};
    letter-spacing: -0.02em;
  }
  .docs-package-link p {
    margin: 8px 0 12px;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    line-height: ${uiTokens.type.line.label};
  }
  .docs-package-version {
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.micro} / ${uiTokens.type.line.micro} ${uiTokens.type.mono};
  }
  .docs-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
  }
  .docs-card-link:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  /* The component index reads like a table of contents: a name and its one line. */
  .docs-index {
    display: grid;
    gap: 8px;
  }
  .docs-index-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    column-gap: 32px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .docs-index-list > li {
    display: grid;
    align-content: start;
    gap: 2px;
    min-width: 0;
    padding: 10px 0;
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  }
  .docs-index-list a {
    color: ${uiTokens.ink.primary};
    font-weight: ${uiTokens.type.weight.medium};
    text-decoration: none;
  }
  .docs-index-list a:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .docs-index-list span {
    display: -webkit-box;
    overflow: hidden;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  /* Reading content uses the library's Prose rhythm; the docs only set their
     reading size and keep headings clear of the sticky header. */
  .docs-article ${prose.root} {
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.line.reading};
  }
  .docs-article ${prose.root} > :where(h2, h3, h4) {
    scroll-margin-top: 88px;
  }
  /* MDX callouts are recessed notes inside the reading flow. */
  .docs-article .mdx-callout {
    display: grid;
    gap: ${uiTokens.space.group};
    padding: 12px 16px;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.secondary};
  }
  .docs-article .mdx-callout > * {
    margin: 0;
  }
  .docs-article .mdx-callout-warning {
    background: color-mix(in srgb, ${uiTokens.status.warning} 9%, transparent);
    color: ${uiTokens.ink.primary};
  }
  .docs-article ${table.root} {
    max-width: 100%;
    font-size: ${uiTokens.type.label};
  }
  .docs-article ${table.scroller} {
    border-color: ${uiTokens.line.edge};
    background: ${uiTokens.surface.canvas};
  }
  .docs-article ${table.heading}, .docs-article ${table.cell} {
    padding: 12px 16px;
  }
  /* Previous and next pages: two quiet cards at the end of the reading column. */
  .docs-pager {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${uiTokens.space.group};
    /* The same column as the footer below it. */
    max-width: ${docsTokens.readingWidth};
    margin: 64px auto 0;
  }
  .docs-content-home .docs-pager {
    max-width: ${docsTokens.homeWidth};
  }
  .docs-pager + .docs-footer {
    margin-top: 40px;
  }
  .docs-pager-link {
    display: grid;
    gap: 4px;
    min-width: 0;
    padding: 14px 16px;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.xl};
    color: ${uiTokens.ink.primary};
    text-decoration: none;
    transition: background-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  .docs-pager-link:hover {
    background: ${uiTokens.state.hover};
  }
  .docs-pager-link:focus-visible {
    outline: 2px solid ${uiTokens.state.focus};
    outline-offset: 2px;
  }
  .docs-pager-next {
    grid-column: 2;
    text-align: right;
  }
  .docs-pager-direction {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
  }
  .docs-pager-next .docs-pager-direction {
    justify-content: flex-end;
  }
  .docs-pager-title {
    overflow: hidden;
    font-weight: ${uiTokens.type.weight.medium};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .docs-footer {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: space-between;
    max-width: ${docsTokens.readingWidth};
    margin: 64px auto 0;
    padding: 20px 0 28px;
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.micro};
  }
  .docs-content-home .docs-footer {
    max-width: ${docsTokens.homeWidth};
  }
  .docs-footer a:hover {
    color: ${uiTokens.ink.primary};
    text-decoration: underline;
  }

  @media (min-width: 1280px) {
    .docs-article:has(.docs-reference-page) {
      max-width: 928px;
    }
    .docs-reference-page > * > ${page.header} {
      max-width: ${docsTokens.readingWidth};
    }
    .docs-reading-layout {
      grid-template-columns: minmax(0, 720px) 160px;
      gap: 48px;
      align-items: start;
    }
    .docs-sections {
      grid-column: 1;
      grid-row: 1;
    }
    .docs-toc {
      grid-column: 2;
      grid-row: 1;
      position: sticky;
      top: 96px;
    }
    .docs-toc-disclosure {
      display: none;
    }
    .docs-toc-desktop {
      display: block;
      padding-left: 16px;
      border-left: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    }
    .docs-toc-title {
      margin: 0;
      color: ${uiTokens.ink.primary};
      font-size: ${uiTokens.type.micro};
      font-weight: ${uiTokens.type.weight.medium};
    }
    .docs-content:not(.docs-content-home) :is(.docs-footer, .docs-pager) {
      max-width: 928px;
    }
  }
  @media (max-width: 1100px) {
    .docs-home-hero {
      grid-template-columns: minmax(0, 1fr);
      gap: 36px;
    }
    .docs-home-intro ${pageHeader.title} {
      max-width: 16ch;
    }
    .docs-home-route {
      padding-top: 28px;
      border-top: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    }
    .docs-home-route ol {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
    }
    .docs-home-route li + li {
      border-top: 0;
    }
    .docs-home-route .docs-install {
      max-width: 360px;
    }
  }
  @media (max-width: 900px) {
    html {
      scroll-padding-top: 120px;
    }
    .docs-shell {
      grid-template-columns: minmax(0, 1fr);
    }
    .docs-mobile-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 60px;
      padding: 0 20px;
      border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.divider};
      background: ${uiTokens.surface.canvas};
    }
    .docs-mobile-brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: ${uiTokens.type.title};
      letter-spacing: -0.4px;
    }
    .docs-mobile-brand {
      color: ${uiTokens.ink.primary};
      font-weight: ${uiTokens.type.weight.semibold};
    }
    .docs-mobile-brand > img {
      width: 28px;
      height: 28px;
      border-radius: ${uiTokens.radius.md};
      object-fit: contain;
    }
    .docs-mobile-brand > span {
      color: ${uiTokens.ink.tertiary};
      font: ${uiTokens.type.micro} / ${uiTokens.type.line.micro} ${uiTokens.type.mono};
      font-weight: ${uiTokens.type.weight.regular};
      letter-spacing: 0;
    }
    .docs-navigation-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 44px;
      min-height: 36px;
      padding: 6px 10px;
      border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
      border-radius: ${uiTokens.radius.md};
      background: ${uiTokens.surface.canvas};
      color: ${uiTokens.ink.primary};
      font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
      cursor: pointer;
    }
    .docs-navigation-toggle[aria-expanded="true"] {
      background: ${uiTokens.surface.fill};
    }
    .docs-sidebar {
      position: static;
      height: auto;
      max-height: 60vh;
      padding: 16px 20px 0;
      border-right: 0;
      border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    }
    .docs-sidebar > .docs-brand {
      display: none;
    }
    .docs-catalog ${navList.item} {
      min-height: 40px;
    }
    .docs-header {
      height: 44px;
      padding-inline: 20px;
    }
    .docs-content {
      padding: 32px 20px 0;
    }
    .docs-article ${pageHeader.title} {
      font-size: ${uiTokens.type.pageTitle};
      line-height: ${uiTokens.type.line.pageTitle};
    }
    .docs-article ${pageHeader.description} {
      font-size: ${uiTokens.type.body};
    }
    .docs-article ${page.header} {
      margin-bottom: 24px;
    }
    .docs-article ${section.title} {
      font-size: ${uiTokens.type.heading};
    }
    .docs-reading-layout {
      gap: 28px;
    }
    .docs-sections {
      gap: 36px;
    }
    .docs-home-hero {
      padding-top: 0;
      padding-bottom: 12px;
      gap: 32px;
    }
    .docs-home-eyebrow {
      margin-bottom: 20px;
    }
    .docs-home-intro ${pageHeader.title} {
      max-width: 14ch;
    }
    .docs-home-route ol {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
    .docs-home-route li + li {
      border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
    }
    .docs-package-grid {
      grid-template-columns: minmax(0, 1fr);
    }
    .docs-package-link {
      padding-block: 20px;
    }
    .docs-article ${codeBlock.content} {
      padding: 16px;
    }
    .docs-footer {
      margin-top: 48px;
      padding-bottom: 24px;
    }
  }
`;

/** One assembly retains the shared token identities and light/dark schemes. */
export const docsTheme = defineTheme({
  options: standardOptions,
  defaults: { scheme: "auto" },
  tokens: [...standardThemeTokens, docsTokens],
  styles: [...standardThemeStyles, docsJournalTokenStyles, docsMeowTokenStyles, docsStyles],
});
