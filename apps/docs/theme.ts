import { defineTokens } from "meowcss";
import { css, defineTheme, partSelector } from "meowcss/meowjsx";
import { breadcrumbContract, cardContract, codeBlockContract, pageHeaderContract } from "meowtail";
import {
  standardOptions,
  standardThemeStyles,
  standardThemeTokens,
  uiTokens,
} from "meowtail/theme";

/** Layout parameters the documentation site adds to the shared theme. */
export const docsTokens = defineTokens("docs", {
  sidebarWidth: "240px",
  headerHeight: "56px",
  previewHeight: "440px",
  previewHeightTall: "680px",
  codeHeight: "420px",
});

/**
 * The site layout. It uses the shared theme's own tokens and adds no palette:
 * the pages are painted with the same surfaces, hairlines and type scale the
 * components they document use.
 */
export const docsStyles = css`
  html,
  body {
    margin: 0;
    padding: 0;
  }
  body {
    background: ${uiTokens.surface};
    color: ${uiTokens.foreground};
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontBody};
    line-height: ${uiTokens.leading};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  * {
    box-sizing: border-box;
  }
  /* Navigation inherits the ink of its container; a reference link says so itself. */
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

  /* The catalog rail. */
  .docs-sidebar {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-height: 0;
    background: ${uiTokens.surface};
    border-right: 1px solid ${uiTokens.border};
    padding: 0 12px;
  }
  .docs-brand {
    display: flex;
    align-items: center;
    gap: 9px;
    height: 66px;
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
    padding: 1px 5px;
    border: 1px solid ${uiTokens.border};
    border-radius: 4px;
    color: ${uiTokens.mutedForeground};
    font-size: 11px;
    letter-spacing: 0.6px;
  }
  .docs-search {
    flex: none;
  }
  .docs-catalog-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 20px 10px 8px;
    color: ${uiTokens.mutedForeground};
    font-size: 11px;
    letter-spacing: 0.8px;
  }
  .docs-catalog-label > span {
    font-variant-numeric: tabular-nums;
    opacity: 0.75;
  }
  .docs-catalog {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding: 0 0 18px;
    scrollbar-width: thin;
  }
  .docs-catalog-empty {
    margin: 12px 10px;
    color: ${uiTokens.mutedForeground};
    font-size: 12px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  /* The page header: where the reader is. */
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
    padding: 0 24px;
    background: ${uiTokens.surface};
    border-bottom: 1px solid ${uiTokens.border};
    min-width: 0;
  }
  .docs-header-link {
    display: grid;
    place-items: center;
    min-width: 30px;
    min-height: 30px;
    margin-left: auto;
    border-radius: 5px;
    color: ${uiTokens.mutedForeground};
  }
  .docs-header-link:hover {
    background: ${uiTokens.surfaceMuted};
    color: ${uiTokens.foreground};
  }
  /* The trail is quiet until the page itself: the levels stay secondary. */
  ${partSelector(breadcrumbContract, "item")}:not(:last-child)
  ${partSelector(breadcrumbContract, "current")} {
    color: ${uiTokens.mutedForeground};
    font-weight: 400;
  }
  ${partSelector(breadcrumbContract, "item")}:last-child
  ${partSelector(breadcrumbContract, "current")} {
    font-size: 13px;
    font-weight: 550;
  }

  /* The reading column. */
  .docs-content {
    min-width: 0;
    padding: 22px 24px 0;
  }
  .docs-article {
    max-width: ${uiTokens.containerPage};
    min-width: 0;
  }
  ${partSelector(pageHeaderContract, "title")} {
    letter-spacing: -0.4px;
  }
  ${partSelector(pageHeaderContract, "description")} {
    max-width: 76ch;
    font-size: 13px;
    line-height: 1.7;
  }
  .docs-note {
    margin: 0;
    color: ${uiTokens.mutedForeground};
    font-size: 12px;
    line-height: 1.7;
  }
  .docs-example {
    min-width: 0;
  }
  .docs-example-head {
    display: grid;
    gap: 2px;
    min-width: 0;
  }
  .docs-example-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
  }

  /* The live example. */
  ${partSelector(cardContract, "root")}.docs-preview-card {
    padding: 0;
    overflow: hidden;
    border: 0.5px solid ${uiTokens.border};
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

  /*
   * The docs pages are static HTML, so the code block's built-in Soft wrap and
   * Copy code controls have no runtime and would sit as inert keyboard stops.
   * The host suppresses those actions and caps the code surface at the
   * pre-adoption panel height; the code scrolls inside the block.
   */
  ${partSelector(codeBlockContract, "actions")} {
    display: none;
  }
  ${partSelector(codeBlockContract, "content")} {
    max-height: ${docsTokens.codeHeight};
  }

  .docs-install {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    align-self: start;
    padding: 8px 12px;
    border: 0.5px solid ${uiTokens.border};
    border-radius: ${uiTokens.controlRadius};
    background: ${uiTokens.codeSurface};
    color: ${uiTokens.foreground};
    font-family: ${uiTokens.mono};
    font-size: 12px;
  }

  /* The package and component cards. */
  .docs-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
  .docs-card-link {
    color: inherit;
  }
  .docs-card-link:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .docs-list {
    display: grid;
    gap: 8px;
  }

  /* Prose from the content pages. */
  .docs-prose {
    display: grid;
    gap: 12px;
    max-width: 76ch;
    min-width: 0;
    font-size: 13px;
    line-height: 1.7;
  }
  .docs-prose p {
    margin: 0;
  }
  .docs-prose h2 {
    margin: 16px 0 0;
    font-size: 15px;
    font-weight: 600;
  }
  .docs-prose h3 {
    margin: 12px 0 0;
    font-size: 13px;
    font-weight: 600;
  }
  .docs-prose ul,
  .docs-prose ol {
    display: grid;
    gap: 4px;
    margin: 0;
    padding-left: 20px;
  }
  .docs-prose code {
    padding: 1px 5px;
    border-radius: ${uiTokens.radiusSmall};
    background: ${uiTokens.codeSurface};
    font-family: ${uiTokens.mono};
    font-size: 0.92em;
  }
  .docs-prose pre {
    overflow-x: auto;
    margin: 0;
    padding: 12px 16px;
    border: 0.5px solid ${uiTokens.border};
    border-radius: ${uiTokens.controlRadius};
    background: ${uiTokens.codeSurface};
    font-family: ${uiTokens.mono};
    font-size: 12px;
  }
  .docs-prose pre code {
    padding: 0;
    background: none;
  }

  /* The page footer. */
  .docs-footer {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: space-between;
    max-width: ${uiTokens.containerPage};
    margin-top: 36px;
    padding: 14px 0 20px;
    border-top: 1px solid ${uiTokens.border};
    color: ${uiTokens.mutedForeground};
    font-size: 11px;
  }
  .docs-footer a {
    color: inherit;
  }
  .docs-footer a:hover {
    color: ${uiTokens.foreground};
    text-decoration: underline;
  }

  @media (max-width: 900px) {
    .docs-shell {
      grid-template-columns: minmax(0, 1fr);
    }
    .docs-sidebar {
      position: static;
      height: auto;
      /* The reference is long: the panel stays a panel, so the page is reachable. */
      max-height: 45vh;
      border-right: 0;
      border-bottom: 1px solid ${uiTokens.border};
    }
    .docs-header {
      padding: 0 16px;
    }
    .docs-content {
      padding: 16px 16px 0;
    }
    .docs-footer {
      margin-top: 24px;
    }
  }
`;

/**
 * The documentation theme. It extends the standard theme with the site layout
 * instead of defining a second palette, so the site and the components it
 * documents share one token set, one radius scale and one light/dark scheme.
 */
export const docsTheme = defineTheme({
  options: standardOptions,
  defaults: { scheme: "auto" },
  tokens: [...standardThemeTokens, docsTokens],
  styles: [...standardThemeStyles, docsStyles],
});
