import { defineTokens } from "meowcss";
import { css, defineTheme, partSelector } from "meowcss/meowjsx";
import {
  breadcrumbContract,
  cardContract,
  codeBlockContract,
  navListContract,
  pageContract,
  pageHeaderContract,
  proseContract,
  searchInputContract,
  sectionContract,
  tableContract,
} from "meowtail";
import {
  standardOptions,
  standardThemeStyles,
  standardThemeTokens,
  uiTokens,
} from "meowtail/theme";

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

/** A reading environment built from the shared palette and component contracts. */
export const docsStyles = css`
  html,
  body {
    margin: 0;
    padding: 0;
  }
  html {
    scroll-padding-top: 88px;
  }
  body {
    background: ${uiTokens.surface.canvas};
    color: ${uiTokens.ink.primary};
    font: 15px/1.7 ${uiTokens.type.sans};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  * {
    box-sizing: border-box;
  }
  .docs-shell a:not(:where([data-meowui-part="link/root"], ${partSelector(proseContract, "root")} a)) {
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
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .docs-brand > svg {
    width: 21px;
    height: 21px;
    color: ${uiTokens.ink.secondary};
  }
  .docs-brand > span {
    margin-left: auto;
    color: ${uiTokens.ink.tertiary};
    font: ${uiTokens.type.micro}/1.5 ${uiTokens.type.mono};
    letter-spacing: 0;
  }
  .docs-search {
    flex: none;
    margin-bottom: 4px;
  }
  /* The sidebar search is the library SearchInput as-is: same surface, states and ring. */
  .docs-search ${partSelector(searchInputContract, "control")} {
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
    font-weight: 500;
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
  .docs-catalog ${partSelector(navListContract, "root")} {
    gap: 20px;
    font-size: ${uiTokens.type.label};
  }
  .docs-catalog ${partSelector(navListContract, "group")} {
    gap: 2px;
  }
  .docs-catalog ${partSelector(navListContract, "groupTitle")} {
    padding-block: 0 6px;
  }
  .docs-catalog ${partSelector(navListContract, "item")} {
    min-height: 32px;
    color: ${uiTokens.ink.secondary};
  }
  .docs-catalog ${partSelector(navListContract, "item")}[aria-current="page"] {
    color: ${uiTokens.ink.primary};
  }
  .docs-catalog-empty {
    margin: 12px 10px;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    line-height: 1.7;
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
  /* The one way out to the workbench: a quiet labeled link, not an unnamed glyph. */
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
    font-weight: 500;
    text-decoration: none;
  }
  .docs-header-link:hover {
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
  }
  .docs-header ${partSelector(breadcrumbContract, "item")}:not(:last-child) ${partSelector(breadcrumbContract, "current")} {
    color: ${uiTokens.ink.secondary};
    font-weight: 400;
  }
  .docs-header ${partSelector(breadcrumbContract, "current")} {
    font-size: ${uiTokens.type.caption};
    font-weight: 500;
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
  .docs-article ${partSelector(pageContract, "root")}, .docs-article ${partSelector(sectionContract, "root")} {
    font-size: 15px;
    line-height: 1.75;
  }
  .docs-article ${partSelector(pageContract, "header")} {
    margin-bottom: 32px;
    gap: 12px;
  }
  .docs-article ${partSelector(pageContract, "eyebrow")} {
    font-size: ${uiTokens.type.micro};
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .docs-article ${partSelector(pageHeaderContract, "copy")} {
    gap: 14px;
  }
  .docs-article ${partSelector(pageHeaderContract, "title")} {
    font-size: 40px;
    line-height: 1.15;
    font-weight: 500;
    letter-spacing: -0.035em;
  }
  .docs-article ${partSelector(pageHeaderContract, "description")} {
    max-width: 62ch;
    font-size: ${uiTokens.type.title};
    line-height: 1.75;
  }
  .docs-article ${partSelector(pageContract, "content")}, .docs-sections {
    display: grid;
    gap: 40px;
    min-width: 0;
  }
  .docs-article ${partSelector(sectionContract, "root")} {
    gap: 16px;
    scroll-margin-top: 88px;
  }
  .docs-article ${partSelector(sectionContract, "title")} {
    font-size: 25px;
    font-weight: 500;
    line-height: 1.3;
    letter-spacing: -0.02em;
  }
  .docs-article ${partSelector(sectionContract, "description")} {
    font-size: ${uiTokens.type.body};
    line-height: 1.75;
  }
  .docs-article ${partSelector(sectionContract, "content")} {
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
    line-height: 1.6;
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
    font-weight: 500;
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
    line-height: 1.7;
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
    font-weight: 600;
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
  ${partSelector(cardContract, "root")}.docs-preview-card {
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
  .docs-article ${partSelector(codeBlockContract, "root")} {
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.xl};
  }
  .docs-specimen ${partSelector(codeBlockContract, "root")} {
    border: 0;
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
    border-radius: 0;
  }
  .docs-article ${partSelector(codeBlockContract, "header")} {
    padding: 10px 16px;
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.divider};
    background: transparent;
  }
  .docs-article ${partSelector(codeBlockContract, "actions")} {
    display: none;
  }
  .docs-article ${partSelector(codeBlockContract, "content")} {
    max-height: ${docsTokens.codeHeight};
    padding: 16px;
    font-size: ${uiTokens.type.code};
    line-height: 1.75;
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
    font: ${uiTokens.type.code}/1.7 ${uiTokens.type.mono};
  }
  .docs-install > svg {
    flex: none;
    color: ${uiTokens.ink.secondary};
  }
  .docs-install > span {
    min-width: 0;
    overflow-wrap: anywhere;
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
  .docs-home-intro ${partSelector(pageHeaderContract, "title")} {
    max-width: 17ch;
    font-size: 52px;
    line-height: 1.06;
    letter-spacing: -0.04em;
    text-wrap: balance;
  }
  .docs-home-intro ${partSelector(pageHeaderContract, "description")} {
    max-width: 46ch;
    margin-top: 8px;
    font-size: 15px;
    line-height: 1.8;
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
    font-weight: 500;
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
    font: 500 25px/1.25 ${uiTokens.type.display};
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
    font: ${uiTokens.type.code}/1.7 ${uiTokens.type.mono};
  }
  .docs-home-route li > a > span:last-child {
    display: grid;
    gap: 2px;
  }
  .docs-home-route strong {
    font-size: ${uiTokens.type.label};
    font-weight: 500;
  }
  .docs-home-route strong + span {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    line-height: 1.6;
  }
  .docs-home-route li > a:hover strong,
  .docs-package-link:hover strong {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .docs-home-page ${partSelector(pageContract, "content")} {
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
    font: ${uiTokens.type.code}/1.7 ${uiTokens.type.mono};
  }
  .docs-package-link strong {
    font-size: ${uiTokens.type.title};
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .docs-package-link p {
    margin: 8px 0 12px;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    line-height: 1.75;
  }
  .docs-package-version {
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.micro}/1.7 ${uiTokens.type.mono};
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
    gap: 2px;
    min-width: 0;
    padding: 10px 0;
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  }
  .docs-index-list a {
    color: ${uiTokens.ink.primary};
    font-weight: 500;
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
    line-height: 1.5;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  /* Reading content uses the library's Prose rhythm; the docs only set their
     reading size and keep headings clear of the sticky header. */
  .docs-article ${partSelector(proseContract, "root")} {
    font-size: 15px;
    line-height: 1.75;
  }
  .docs-article ${partSelector(proseContract, "root")} > :where(h2, h3, h4) {
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
  .docs-article ${partSelector(tableContract, "root")} {
    max-width: 100%;
    font-size: ${uiTokens.type.label};
  }
  .docs-article ${partSelector(tableContract, "scroller")} {
    border-color: ${uiTokens.line.edge};
    background: ${uiTokens.surface.canvas};
  }
  .docs-article ${partSelector(tableContract, "table")} {
    min-width: 480px;
  }
  .docs-article ${partSelector(tableContract, "heading")}, .docs-article ${partSelector(tableContract, "cell")} {
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
    font-weight: 500;
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
    .docs-reference-page > * > ${partSelector(pageContract, "header")} {
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
      font-weight: 500;
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
    .docs-home-intro ${partSelector(pageHeaderContract, "title")} {
      max-width: 16ch;
      font-size: 48px;
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
      font-size: 15px;
      letter-spacing: -0.4px;
    }
    .docs-mobile-brand {
      color: ${uiTokens.ink.primary};
      font-weight: 600;
    }
    .docs-mobile-brand > svg {
      width: 20px;
      height: 20px;
      color: ${uiTokens.ink.secondary};
    }
    .docs-mobile-brand > span {
      color: ${uiTokens.ink.tertiary};
      font: ${uiTokens.type.micro}/1.5 ${uiTokens.type.mono};
      font-weight: 400;
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
      font: 12px/1.5 ${uiTokens.type.sans};
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
    .docs-catalog ${partSelector(navListContract, "item")} {
      min-height: 40px;
    }
    .docs-header {
      height: 44px;
      padding-inline: 20px;
    }
    .docs-content {
      padding: 32px 20px 0;
    }
    .docs-article ${partSelector(pageHeaderContract, "title")} {
      font-size: 34px;
    }
    .docs-article ${partSelector(pageHeaderContract, "description")} {
      font-size: 15px;
    }
    .docs-article ${partSelector(pageContract, "header")} {
      margin-bottom: 24px;
    }
    .docs-article ${partSelector(sectionContract, "title")} {
      font-size: 23px;
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
    .docs-home-intro ${partSelector(pageHeaderContract, "title")} {
      max-width: 14ch;
      font-size: 44px;
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
    .docs-article ${partSelector(codeBlockContract, "content")} {
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
  styles: [...standardThemeStyles, docsStyles],
});
