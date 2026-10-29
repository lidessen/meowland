import { css, parts } from "meowcss/meowjsx";
import { compileTokens, tokenRef, type TokenSet } from "meowcss";
import { journalUiTokens, meowUiTokens, uiTokens } from "meowtail/theme";
import type { Button, Disclosure, NavList, SearchInput } from "meowtail";
import { buttonOptions } from "meowtail";
export const inspectionHeight = tokenRef("workshop", "inspection", "height");

const button = parts<typeof Button>("button");
const disclosure = parts<typeof Disclosure>("disclosure");
const navList = parts<typeof NavList>("nav-list");
const searchInput = parts<typeof SearchInput>("search-input");

/** The Meowtail themes that can paint the gallery's own chrome; standard when none is named. */
export const chromeThemes = ["standard", "journal", "meow"] as const;
export type ChromeTheme = (typeof chromeThemes)[number];
/** The root attribute that selects a chrome theme other than standard. */
export const chromeThemeAttribute = "data-meowbook-chrome";

/**
 * One theme's values of the same `--ui-*` roles, in force under the chrome attribute. One
 * stylesheet and one theme root serve every theme, so switching is one attribute and no reload.
 * The rules follow the standard ones at the same zero specificity, so they win in every scheme.
 */
function scopedTokens(name: Exclude<ChromeTheme, "standard">, tokens: TokenSet) {
  const scope = `[${chromeThemeAttribute}="${name}"]`;
  return compileTokens(tokens, {
    constants: `:where(${scope}[data-meowui-theme-root], ${scope} [data-meowui-theme-root])`,
    sources: [
      {
        options: "scheme",
        selector: `:where(${scope}[data-meowui-scope], ${scope} [data-meowui-scope])`,
      },
    ],
  });
}
export const chromeThemeStyles = [
  scopedTokens("journal", journalUiTokens),
  scopedTokens("meow", meowUiTokens),
].join("\n");

export const galleryStyles = css`
:root {
  font-family: ${uiTokens.type.sans};
  font-size: ${uiTokens.type.label};
  color: ${uiTokens.ink.primary};
  background: ${uiTokens.surface.canvas};
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
a {
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
.workshop-shell {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  height: 100dvh;
  overflow: hidden;
}
.workshop-sidebar {
  background: ${uiTokens.surface.canvas};
  border-right: ${uiTokens.line.width} solid ${uiTokens.line.edge};
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0 12px;
}
.workshop-brand {
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
/* The mark is a 28px tile: the host's image, or the notebook glyph on a filled tile. */
.workshop-brand > img,
.workshop-brand-mark {
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: ${uiTokens.radius.md};
  object-fit: contain;
}
.workshop-logo-dark {
  display: none;
}
:root[data-meowui-color-scheme="dark"] .workshop-logo-light {
  display: none;
}
:root[data-meowui-color-scheme="dark"] .workshop-logo-dark {
  display: block;
}
@media (prefers-color-scheme: dark) {
  :root[data-meowui-color-scheme="auto"] .workshop-logo-light {
    display: none;
  }
  :root[data-meowui-color-scheme="auto"] .workshop-logo-dark {
    display: block;
  }
}
.workshop-brand-mark {
  display: grid;
  place-items: center;
  background: ${uiTokens.surface.fill};
  color: ${uiTokens.ink.secondary};
}
/* A theme with a larger title keeps the tag inside the rail by shortening it. */
#brand-name {
  flex: none;
}
#brand-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: auto;
  font: ${uiTokens.type.micro} / ${uiTokens.type.line.micro} ${uiTokens.type.mono};
  color: ${uiTokens.ink.tertiary};
  letter-spacing: 0;
}
.workshop-search {
  flex: none;
  margin-bottom: 4px;
}
.workshop-search ${searchInput.control} {
  font-size: ${uiTokens.type.label};
}
/* One small-caps label role, shared with the docs sidebar and story specimens. */
.catalog-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 10px 12px;
  color: ${uiTokens.ink.tertiary};
  font-size: ${uiTokens.type.micro};
  font-weight: ${uiTokens.type.weight.medium};
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
#story-count {
  font-family: ${uiTokens.type.mono};
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
}
#catalog {
  flex: 1;
  overflow: auto;
  min-height: 0;
  padding: 0 0 24px;
  scrollbar-width: thin;
  scrollbar-color: ${uiTokens.line.edge} transparent;
}
/* NavList keeps its rows, titles and selection; the catalog only sets the density. */
#catalog ${navList.root} {
  gap: 20px;
  font-size: ${uiTokens.type.label};
}
#catalog ${navList.group} {
  gap: 2px;
}
#catalog ${navList.groupTitle} {
  padding-block: 0 6px;
}
#catalog ${navList.item} {
  min-height: 32px;
  color: ${uiTokens.ink.secondary};
}
#catalog ${navList.item}[aria-current="page"] {
  color: ${uiTokens.ink.primary};
}
.catalog-empty {
  margin: 12px 10px;
  font-size: ${uiTokens.type.caption};
  line-height: ${uiTokens.type.line.caption};
  color: ${uiTokens.ink.secondary};
  overflow-wrap: anywhere;
}
#catalog-backdrop {
  display: none;
}
#latest-event {
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${uiTokens.ink.primary};
}
.workshop-observations > summary > strong {
  flex-shrink: 0;
}
.workshop-main {
  position: relative;
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: 56px auto 48px minmax(180px, 1fr) auto;
  height: 100dvh;
}
.workshop-header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 0 24px;
  border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.edge};
  min-width: 0;
}
.workshop-trail {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: ${uiTokens.type.caption};
}
#group {
  color: ${uiTokens.ink.secondary};
  white-space: nowrap;
}
.breadcrumb-separator {
  color: ${uiTokens.ink.tertiary};
}
#breadcrumb-component {
  font-weight: ${uiTokens.type.weight.medium};
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.workshop-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  flex: none;
}
.workshop-host-links {
  display: flex;
  gap: 4px;
}
/* Quiet labeled links and icon buttons share the header's 32px line. */
.workshop-header-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 10px;
  border-radius: ${uiTokens.radius.md};
  color: ${uiTokens.ink.secondary};
  font-size: ${uiTokens.type.label};
  font-weight: ${uiTokens.type.weight.medium};
  white-space: nowrap;
}
.workshop-icon-button {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: ${uiTokens.radius.md};
  background: transparent;
  color: ${uiTokens.ink.secondary};
  font: inherit;
  cursor: pointer;
}
:is(.workshop-header-link, .workshop-icon-button):hover,
.workshop-icon-button[aria-expanded="true"] {
  background: ${uiTokens.state.hover};
  color: ${uiTokens.ink.primary};
}
#appearance-trigger > svg {
  display: none;
}
#appearance-trigger[data-appearance="auto"] > .appearance-auto,
#appearance-trigger[data-appearance="light"] > .appearance-light,
#appearance-trigger[data-appearance="dark"] > .appearance-dark {
  display: block;
}
/* The appearance panel: the theme and the scheme as two short radio lists. */
#appearance:popover-open {
  display: grid;
  gap: 4px;
  width: 208px;
  padding: 6px;
}
#appearance fieldset {
  display: grid;
  margin: 0;
  padding: 0;
  border: 0;
}
#appearance fieldset + fieldset {
  padding-top: 4px;
  background: linear-gradient(${uiTokens.line.divider}, ${uiTokens.line.divider}) top / 100%
    ${uiTokens.line.width} no-repeat;
}
#appearance legend {
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
#appearance label {
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
#appearance label:hover {
  background: ${uiTokens.state.hover};
  color: ${uiTokens.ink.primary};
}
#appearance label:has(input:focus-visible) {
  outline: 2px solid ${uiTokens.state.focus};
  outline-offset: -2px;
}
/* The radio stays in the Tab and arrow-key order; the row shows its state. */
#appearance input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
#appearance label > span {
  flex: 1;
}
#appearance label::after {
  content: "";
  width: ${uiTokens.icon.small};
  height: ${uiTokens.icon.small};
  background: currentColor;
  mask: ${uiTokens.glyph.check} center / contain no-repeat;
  visibility: hidden;
}
#appearance label:has(input:checked) {
  color: ${uiTokens.ink.primary};
  font-weight: ${uiTokens.type.weight.medium};
}
#appearance label:has(input:checked)::after {
  color: ${uiTokens.accent.ink};
  visibility: visible;
}
#toggle-sidebar {
  display: none;
}
.workshop-intro {
  padding: 28px 24px 0;
  min-width: 0;
}
#title {
  margin: 0;
  font-size: ${uiTokens.type.pageTitle};
  line-height: ${uiTokens.type.line.pageTitle};
  font-weight: ${uiTokens.type.weight.semibold};
  letter-spacing: -0.025em;
}
#scenario-description {
  margin: 8px 0 16px;
  max-width: 72ch;
  font-size: ${uiTokens.type.body};
  line-height: ${uiTokens.type.line.body};
  color: ${uiTokens.ink.secondary};
}
#variants {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  scrollbar-width: thin;
}
#variants a {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  min-height: 36px;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  color: ${uiTokens.ink.secondary};
  font-size: ${uiTokens.type.label};
}
#variants a:hover,
#variants a[aria-current="page"] {
  color: ${uiTokens.ink.primary};
}
#variants a[aria-current="page"] {
  border-bottom-color: ${uiTokens.ink.primary};
  font-weight: ${uiTokens.type.weight.medium};
}
.workshop-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
}
/* The view on the left, the instruments on the right. */
.workshop-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
/* The viewport switch is the library's track: same inset, concentric radii and thumb. */
.workshop-viewport {
  display: flex;
  gap: 2px;
  padding: ${uiTokens.control.trackInset};
  border-radius: calc(${uiTokens.radius.md} + ${uiTokens.control.trackInset});
  background: ${uiTokens.surface.fill};
}
.workshop-viewport ${button.root}:where([${buttonOptions.attribute("variant")}="quiet"]) {
  color: ${uiTokens.ink.secondary};
}
.workshop-viewport button[aria-pressed="true"] {
  background: ${uiTokens.control.thumb};
  color: ${uiTokens.ink.primary};
  box-shadow: ${uiTokens.shadow.thumb};
}
/* Toolbar controls share the compact 28px line the small buttons use. */
.workshop-toolbar select {
  min-height: ${uiTokens.control.small};
  border-radius: ${uiTokens.radius.md};
  font-size: ${uiTokens.type.label};
}
.viewport-size {
  font-size: ${uiTokens.type.micro};
  font-family: ${uiTokens.type.mono};
  font-variant-numeric: tabular-nums;
  color: ${uiTokens.ink.tertiary};
  min-width: 48px;
}
#reset {
  width: ${uiTokens.control.small};
  padding: 0;
}
/* The specimen sits on a recessed table, raised on the library's in-flow material. */
.workshop-stage {
  min-height: 0;
  overflow: auto;
  padding: 24px;
  background-color: ${uiTokens.surface.fill};
  border-top: ${uiTokens.line.width} solid ${uiTokens.line.edge};
  border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.edge};
}
#canvas {
  display: block;
  height: 100%;
  min-height: 180px;
  margin: 0 auto;
  border: 0;
  border-radius: ${uiTokens.radius.xl};
  /* The specimen frame is a host page (canvas) set into the recessed stage. */
  background: ${uiTokens.surface.canvas};
  box-shadow:
    0 0 0 ${uiTokens.line.width} ${uiTokens.line.edge},
    ${uiTokens.shadow.raised};
}
.workshop-observations {
  background: ${uiTokens.surface.canvas};
  min-height: 0;
}
.workshop-observations > summary {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 39px;
  padding: 0 24px;
  cursor: pointer;
  list-style: none;
  color: ${uiTokens.ink.secondary};
  font-size: ${uiTokens.type.micro};
}
.workshop-observations > summary::-webkit-details-marker {
  display: none;
}
.workshop-observations > summary > strong {
  font-weight: ${uiTokens.type.weight.medium};
  color: ${uiTokens.ink.primary};
}
.workshop-observations > summary > ${disclosure.icon} {
  margin-left: auto;
  order: 1;
}
#inspection {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${uiTokens.ink.secondary};
  font-size: ${uiTokens.type.micro};
  margin-left: 12px;
}
#inspection[data-warning="true"] {
  color: ${uiTokens.status.danger};
}
.inspection-body {
  padding: 8px 24px 12px;
  max-height: 260px;
  overflow: auto;
  border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
}
.workshop-description {
  margin-bottom: 18px;
}
#description {
  margin: 0 0 8px;
  color: ${uiTokens.ink.secondary};
  font-size: ${uiTokens.type.caption};
  line-height: ${uiTokens.type.line.caption};
}
#covers {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
#covers span {
  font-size: ${uiTokens.type.micro};
  color: ${uiTokens.ink.secondary};
  padding: 2px 0;
}
#covers span + span::before {
  content: "·";
  margin-right: 6px;
  color: ${uiTokens.ink.secondary};
}
.workshop-observation-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.workshop-observation-head > strong {
  font-size: ${uiTokens.type.micro};
  font-weight: ${uiTokens.type.weight.medium};
  margin-right: auto;
}
/* The newest line first, each on its own hairline row. */
#events {
  max-height: 120px;
  overflow: auto;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  font: ${uiTokens.type.code} / ${uiTokens.type.line.code} ${uiTokens.type.mono};
  color: ${uiTokens.ink.secondary};
}
#events li {
  padding: 4px 0;
  border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  overflow-wrap: anywhere;
}
#events li:first-child {
  color: ${uiTokens.ink.primary};
}
#events:empty {
  display: none;
}
.workshop-batch {
  margin-top: 14px;
  padding-top: 12px;
  border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
}
#batch-status,
.workshop-limits {
  color: ${uiTokens.ink.secondary};
  font-size: ${uiTokens.type.micro};
}
.workshop-limits {
  margin: 12px 0 0;
}
#batch-results {
  padding-left: 18px;
  font-size: ${uiTokens.type.caption};
}
#batch-results:empty {
  display: none;
}
#batch-results span {
  display: block;
  color: ${uiTokens.status.danger};
  font-size: ${uiTokens.type.micro};
  overflow-wrap: anywhere;
}
.workshop-batch-canvas {
  position: fixed;
  left: -20000px;
  top: 0;
  height: 560px;
  border: 0;
  pointer-events: none;
}
@media (max-width: 1000px) {
  .workshop-shell {
    grid-template-columns: 200px minmax(0, 1fr);
  }
  .workshop-header,
  .workshop-toolbar {
    padding: 0 16px;
    gap: 8px;
  }
  .workshop-intro {
    padding: 16px 16px 0;
  }
  #group {
    display: none;
  }
  .breadcrumb-separator {
    display: none;
  }
  .workshop-stage {
    padding: 20px;
  }
  #text-placeholder span {
    display: none;
  }
}
@media (max-width: 640px) {
  #catalog-backdrop:not([hidden]) {
    display: block;
    position: fixed;
    inset: 56px 0 0;
    z-index: 4;
    border: 0;
    border-radius: 0;
    background: ${uiTokens.surface.scrim};
  }
  .workshop-shell {
    grid-template-columns: minmax(0, 1fr);
  }
  .workshop-sidebar {
    display: none;
    position: fixed;
    top: 56px;
    bottom: 0;
    left: 0;
    width: 240px;
    z-index: 5;
    box-shadow: ${uiTokens.shadow.float};
  }
  .catalog-open .workshop-sidebar {
    display: flex;
  }
  .workshop-sidebar .workshop-brand {
    height: 54px;
  }
  #toggle-sidebar {
    display: inline-flex;
    padding: 0;
    min-width: 28px;
  }
  /* A phone keeps the docs link as its icon; related pages stay a tap away in the host site. */
  .workshop-host-links,
  #story-docs span {
    display: none;
  }
  .workshop-tools {
    margin-left: 0;
  }
  .workshop-toolbar {
    gap: 5px;
    padding: 0 12px;
  }
  .workshop-viewport ${button.root}:where([${buttonOptions.attribute("variant")}="quiet"]) {
    padding: 0 8px;
  }
  .viewport-size {
    min-width: 42px;
    font-size: ${uiTokens.type.micro};
  }
  .workshop-stage {
    padding: 12px 0;
  }
  #canvas {
    border-radius: 0;
    box-shadow: none;
  }
  .workshop-observations > summary {
    padding: 0 16px;
  }
  #inspection {
    margin-left: 0;
    font-size: ${uiTokens.type.micro};
  }
  .inspection-body {
    padding: 12px 16px;
  }
  #latest-event {
    flex: 1;
    min-width: 0;
    max-width: none;
  }
  #latest-event:not([hidden]) + #inspection {
    display: none;
  }
}
@media (pointer: coarse) {
  #variants a,
  .workshop-icon-button,
  .workshop-header-link,
  #toggle-sidebar {
    min-height: 44px;
  }
  .workshop-icon-button,
  #toggle-sidebar {
    min-width: 44px;
  }
  .workshop-main {
    grid-template-rows: 56px auto 56px minmax(80px, 1fr) auto;
  }
  .workshop-toolbar {
    gap: 4px;
  }
  .workshop-viewport {
    padding: 2px;
  }
  .viewport-size {
    display: none;
  }
  .workshop-viewport ${button.root}:where([${buttonOptions.attribute("variant")}="quiet"]) {
    padding-inline: 8px;
  }
}
/* On a phone or short window, inspection is a reachable sheet. The preview keeps
   its scroll position instead of being squeezed below its minimum height. */
@media (max-width: 640px), (max-height: 600px) {
  .workshop-main {
    grid-template-rows: 56px auto 48px minmax(0, 1fr) calc(44px + env(safe-area-inset-bottom, 0px));
  }
  .workshop-observations {
    ${inspectionHeight.name}: min(70dvh, calc(100dvh - 112px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .workshop-observations > summary {
    min-height: 44px;
    border-radius: 0;
  }
  .workshop-observations[open] {
    position: absolute;
    inset: auto 0 0;
    z-index: 3;
    max-height: var(${inspectionHeight.name});
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
    box-shadow: ${uiTokens.shadow.float};
  }
  .workshop-observations[open] > .inspection-body {
    min-height: 0;
    max-height: calc(var(${inspectionHeight.name}) - 45px - env(safe-area-inset-bottom, 0px));
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  @media (pointer: coarse) {
    .workshop-main {
      grid-template-rows: 56px auto 56px minmax(0, 1fr) calc(
          44px + env(safe-area-inset-bottom, 0px)
        );
    }
  }
}
@media (max-height: 600px) {
  .workshop-intro {
    padding-top: 8px;
  }
  #title {
    font-size: ${uiTokens.type.heading};
  }
  #scenario-description {
    margin: 3px 0 6px;
    max-height: 40px;
    overflow-y: auto;
  }
}
@media (prefers-reduced-motion: reduce) {
  .workshop-observations > summary > svg:last-child {
    transition: none;
  }
}

.workshop-main {
  grid-template-rows: 56px auto auto minmax(0, 1fr) auto auto;
}
.workshop-toolbar {
  padding-block: 6px;
  min-height: 48px;
}
#measure-mode {
  width: auto;
}
#text-placeholder[aria-pressed="true"] {
  background: ${uiTokens.surface.fill};
  box-shadow: inset 0 0 0 1px ${uiTokens.line.control};
}
#measurement-detail {
  grid-row: 5;
  padding: 8px 16px;
  max-height: 150px;
  overflow: auto;
  border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  font-size: ${uiTokens.type.micro};
}
#measurement-help {
  margin: 0;
  color: ${uiTokens.ink.secondary};
}
#measurement-values {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 3px 12px;
  margin: 6px 0 0;
}
#measurement-values:empty {
  display: none;
}
#measurement-values dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-family: monospace;
}
.workshop-observations {
  grid-row: 6;
}
`;
