import { defineTokens } from "meowcss";
import { css, defineTheme, partSelector } from "meowcss/meowjsx";
import {
  breadcrumbContract,
  cardContract,
  codeBlockContract,
  navListContract,
  pageContract,
  pageHeaderContract,
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
    background: ${uiTokens.background};
    color: ${uiTokens.foreground};
    font: 15px/1.7 ${uiTokens.font};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  * {
    box-sizing: border-box;
  }
  .docs-shell a:not(:where([data-meowui-part="link/root"])) {
    color: inherit;
    text-decoration: none;
  }
  :focus-visible {
    outline: 2px solid ${uiTokens.focus};
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
    background: ${uiTokens.sidebarSurface};
    border-right: 1px solid ${uiTokens.borderFaint};
  }
  .docs-brand {
    display: flex;
    align-items: center;
    gap: 9px;
    height: 76px;
    flex-shrink: 0;
    padding: 0 10px;
    color: ${uiTokens.foreground};
    font-size: 16px;
    letter-spacing: -0.5px;
  }
  .docs-brand > svg {
    width: 21px;
    height: 21px;
    color: ${uiTokens.mutedForeground};
  }
  .docs-brand > span {
    margin-left: auto;
    color: ${uiTokens.mutedForeground};
    font: 11px/1.5 ${uiTokens.mono};
    letter-spacing: 0;
  }
  .docs-search {
    flex: none;
    margin-bottom: 4px;
  }
  .docs-search${partSelector(searchInputContract, "root")} {
    min-height: 36px;
    border-color: ${uiTokens.borderSubtle};
    background: ${uiTokens.background};
  }
  .docs-search ${partSelector(searchInputContract, "control")} {
    font-size: 13px;
  }
  .docs-search ${partSelector(searchInputContract, "control")}:focus-visible {
    outline: none;
    box-shadow: none;
  }
  .docs-search${partSelector(searchInputContract, "root")}:focus-within {
    border-color: ${uiTokens.focus};
    box-shadow: 0 0 0 2px color-mix(in srgb, ${uiTokens.focus} 18%, transparent);
  }
  .docs-catalog-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 24px 10px 12px;
    color: ${uiTokens.mutedForeground};
    font-size: 10px;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }
  .docs-catalog-label > span {
    font-family: ${uiTokens.mono};
    font-variant-numeric: tabular-nums;
    letter-spacing: 0;
  }
  .docs-catalog {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding: 0 0 24px;
    scrollbar-width: thin;
    scrollbar-color: ${uiTokens.borderSubtle} transparent;
  }
  .docs-catalog ${partSelector(navListContract, "root")} {
    gap: 26px;
    font-size: 13px;
  }
  .docs-catalog ${partSelector(navListContract, "group")} {
    gap: 6px;
  }
  .docs-catalog ${partSelector(navListContract, "groupTitle")} {
    font-size: 11px;
    font-weight: 550;
  }
  .docs-catalog ${partSelector(navListContract, "item")} {
    min-height: 31px;
    padding-block: 4px;
    border-radius: 5px;
    color: ${uiTokens.mutedForeground};
  }
  .docs-catalog ${partSelector(navListContract, "item")}[aria-current="page"] {
    background: ${uiTokens.active};
    color: ${uiTokens.foreground};
    font-weight: 600;
  }
  .docs-catalog-empty {
    margin: 12px 10px;
    color: ${uiTokens.mutedForeground};
    font-size: 12px;
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
    background: ${uiTokens.background};
    border-bottom: 1px solid ${uiTokens.borderFaint};
    min-width: 0;
  }
  .docs-header-link {
    display: grid;
    place-items: center;
    min-width: 32px;
    min-height: 32px;
    margin-left: auto;
    border-radius: 5px;
    color: ${uiTokens.mutedForeground};
  }
  .docs-header-link:hover {
    background: ${uiTokens.surfaceMuted};
    color: ${uiTokens.foreground};
  }
  .docs-header ${partSelector(breadcrumbContract, "item")}:not(:last-child) ${partSelector(breadcrumbContract, "current")} {
    color: ${uiTokens.mutedForeground};
    font-weight: 400;
  }
  .docs-header ${partSelector(breadcrumbContract, "current")} {
    font-size: 12px;
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
    font-size: 11px;
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
    font-size: 16px;
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
    font-size: 14px;
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
    font-size: 12px;
    line-height: 1.6;
    color: ${uiTokens.mutedForeground};
  }
  .docs-toc-desktop {
    display: none;
  }
  .docs-toc-disclosure {
    border-block: 1px solid ${uiTokens.borderSubtle};
    padding-block: 12px;
  }
  .docs-toc-disclosure > summary {
    color: ${uiTokens.foreground};
    cursor: pointer;
    font-weight: 550;
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
    color: ${uiTokens.foreground};
  }
  .docs-note {
    margin: 0;
    color: ${uiTokens.mutedForeground};
    font-size: 13px;
    line-height: 1.75;
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
    font-size: 15px;
    font-weight: 600;
  }
  ${partSelector(cardContract, "root")}.docs-preview-card {
    padding: 0;
    overflow: hidden;
    border: 1px solid ${uiTokens.borderSubtle};
    border-radius: ${uiTokens.panelRadius};
    background: ${uiTokens.background};
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
    border: 1px solid ${uiTokens.borderSubtle};
    border-radius: 9px;
  }
  .docs-article ${partSelector(codeBlockContract, "header")} {
    padding: 11px 18px;
    border-bottom: 1px solid ${uiTokens.borderFaint};
    background: transparent;
  }
  .docs-article ${partSelector(codeBlockContract, "actions")} {
    display: none;
  }
  .docs-article ${partSelector(codeBlockContract, "content")} {
    max-height: ${docsTokens.codeHeight};
    padding: 20px;
    font-size: 12px;
    line-height: 1.8;
    scrollbar-width: thin;
  }
  .docs-install {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-width: 0;
    padding: 13px 16px;
    border: 1px solid ${uiTokens.borderSubtle};
    border-radius: 8px;
    background: ${uiTokens.codeSurface};
    color: ${uiTokens.foreground};
    font: 12px/1.7 ${uiTokens.mono};
  }
  .docs-install > svg {
    flex: none;
    color: ${uiTokens.mutedForeground};
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
    color: ${uiTokens.mutedForeground};
    font-size: 11px;
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
    font-size: 13px;
  }
  .docs-home-actions .docs-home-primary {
    display: inline-flex;
    align-items: center;
    min-height: 38px;
    padding: 7px 14px;
    border-radius: 6px;
    background: ${uiTokens.primary};
    color: ${uiTokens.onPrimary};
    font-weight: 550;
    text-decoration: none;
  }
  .docs-home-actions .docs-home-primary:hover {
    background: ${uiTokens.primaryHover};
    color: ${uiTokens.onPrimary};
  }
  .docs-home-route {
    min-width: 0;
    padding-top: 6px;
  }
  .docs-home-route-label {
    margin: 0 0 12px;
    color: ${uiTokens.mutedForeground};
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .docs-home-route h2 {
    margin: 0 0 18px;
    font: 500 25px/1.25 ${uiTokens.fontDisplay};
    letter-spacing: -0.025em;
  }
  .docs-home-route ol {
    list-style: none;
    margin: 20px 0 0;
    padding: 0;
  }
  .docs-home-route li + li {
    border-top: 1px solid ${uiTokens.borderFaint};
  }
  .docs-home-route li > a {
    display: flex;
    gap: 14px;
    padding-block: 14px;
  }
  .docs-route-step {
    flex: none;
    padding-top: 2px;
    color: ${uiTokens.mutedForeground};
    font: 11px/1.7 ${uiTokens.mono};
  }
  .docs-home-route li > a > span:last-child {
    display: grid;
    gap: 2px;
  }
  .docs-home-route strong {
    font-size: 13px;
    font-weight: 550;
  }
  .docs-home-route strong + span {
    color: ${uiTokens.mutedForeground};
    font-size: 12px;
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
    border-top: 1px solid ${uiTokens.borderSubtle};
    min-width: 0;
  }
  .docs-package-number {
    padding-top: 4px;
    color: ${uiTokens.mutedForeground};
    font: 11px/1.7 ${uiTokens.mono};
  }
  .docs-package-link strong {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .docs-package-link p {
    margin: 8px 0 12px;
    color: ${uiTokens.mutedForeground};
    font-size: 13px;
    line-height: 1.75;
  }
  .docs-package-version {
    color: ${uiTokens.mutedForeground};
    font: 10px/1.7 ${uiTokens.mono};
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
  .docs-list {
    display: grid;
    gap: 8px;
  }

  /* Prose, examples and technical tables keep distinct scales and clear pauses. */
  .docs-prose {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
    min-width: 0;
    font-size: 15px;
    line-height: 1.85;
    overflow-wrap: break-word;
  }
  .docs-prose p {
    margin: 0;
  }
  .docs-prose h2,
  .docs-prose h3 {
    margin: 24px 0 0;
    color: ${uiTokens.foreground};
    line-height: 1.35;
    scroll-margin-top: 88px;
  }
  .docs-prose h2 {
    font: 500 25px/1.35 ${uiTokens.fontDisplay};
    letter-spacing: -0.02em;
  }
  .docs-prose h3 {
    font-size: 16px;
    font-weight: 600;
  }
  .docs-prose > :first-child {
    margin-top: 0;
  }
  .docs-prose ul,
  .docs-prose ol {
    display: grid;
    gap: 8px;
    margin: 0;
    padding-left: 24px;
  }
  .docs-prose code {
    padding: 2px 5px;
    border: 1px solid ${uiTokens.borderFaint};
    border-radius: 4px;
    background: ${uiTokens.codeSurface};
    font-family: ${uiTokens.mono};
    font-size: 0.82em;
  }
  .docs-prose pre {
    min-width: 0;
    max-width: 100%;
    overflow: auto;
    margin: 4px 0;
    padding: 20px;
    border: 1px solid ${uiTokens.borderSubtle};
    border-radius: 9px;
    background: ${uiTokens.codeSurface};
    font: 12px/1.8 ${uiTokens.mono};
    scrollbar-width: thin;
  }
  .docs-prose pre code {
    padding: 0;
    border: 0;
    background: none;
    font-size: inherit;
  }
  .docs-article ${partSelector(tableContract, "root")} {
    max-width: 100%;
    font-size: 13px;
  }
  .docs-article ${partSelector(tableContract, "scroller")} {
    border-color: ${uiTokens.borderSubtle};
    background: ${uiTokens.background};
  }
  .docs-article ${partSelector(tableContract, "table")} {
    min-width: 480px;
  }
  .docs-article ${partSelector(tableContract, "heading")}, .docs-article ${partSelector(tableContract, "cell")} {
    padding: 12px 16px;
  }
  .docs-prose table {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
    font-size: 13px;
  }
  .docs-prose th,
  .docs-prose td {
    padding: 12px 16px;
    border-bottom: 1px solid ${uiTokens.borderSubtle};
    text-align: left;
    vertical-align: top;
    min-width: 120px;
  }
  .docs-prose th {
    color: ${uiTokens.mutedForeground};
    font-size: 12px;
    font-weight: 550;
  }
  .docs-footer {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: space-between;
    max-width: ${docsTokens.readingWidth};
    margin: 64px auto 0;
    padding: 20px 0 28px;
    border-top: 1px solid ${uiTokens.borderSubtle};
    color: ${uiTokens.mutedForeground};
    font-size: 11px;
  }
  .docs-content-home .docs-footer {
    max-width: ${docsTokens.homeWidth};
  }
  .docs-footer a:hover {
    color: ${uiTokens.foreground};
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
      border-left: 1px solid ${uiTokens.borderSubtle};
    }
    .docs-toc-title {
      margin: 0;
      color: ${uiTokens.foreground};
      font-size: 11px;
      font-weight: 550;
    }
    .docs-content:not(.docs-content-home) .docs-footer {
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
      border-top: 1px solid ${uiTokens.borderSubtle};
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
      border-bottom: 1px solid ${uiTokens.borderFaint};
      background: ${uiTokens.background};
    }
    .docs-mobile-brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      letter-spacing: -0.4px;
    }
    .docs-mobile-brand > svg {
      width: 20px;
      height: 20px;
    }
    .docs-navigation-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 44px;
      min-height: 36px;
      padding: 6px 10px;
      border: 1px solid ${uiTokens.borderSubtle};
      border-radius: 6px;
      background: ${uiTokens.background};
      color: ${uiTokens.foreground};
      font: 12px/1.5 ${uiTokens.font};
      cursor: pointer;
    }
    .docs-navigation-toggle[aria-expanded="true"] {
      background: ${uiTokens.surfaceMuted};
    }
    .docs-sidebar {
      position: static;
      height: auto;
      max-height: 60vh;
      padding: 16px 20px 0;
      border-right: 0;
      border-bottom: 1px solid ${uiTokens.borderSubtle};
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
      border-top: 1px solid ${uiTokens.borderFaint};
    }
    .docs-package-grid {
      grid-template-columns: minmax(0, 1fr);
    }
    .docs-package-link {
      padding-block: 20px;
    }
    .docs-prose pre,
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
