import { css, partSelector } from "meowcss/meowjsx";
import { tokenRef } from "meowcss";
import { uiTokens } from "meowtail/theme";
import { buttonContract, buttonOptions, disclosureContract } from "meowtail";
export const inspectionHeight = tokenRef("workshop", "inspection", "height");

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
button,
a,
summary {
  -webkit-tap-highlight-color: transparent;
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
  grid-template-columns: 224px minmax(0, 1fr);
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
  height: 66px;
  flex-shrink: 0;
  padding: 0 10px;
  font-size: ${uiTokens.type.title};
  font-weight: 600;
  letter-spacing: -0.02em;
}
.workshop-brand > svg {
  color: ${uiTokens.ink.secondary};
}
.workshop-brand > span {
  margin-left: auto;
  font: ${uiTokens.type.micro}/1.5 ${uiTokens.type.mono};
  color: ${uiTokens.ink.tertiary};
  border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
  padding: 1px 5px;
  border-radius: ${uiTokens.radius.xs};
}
/* One small-caps label role, shared with the docs sidebar and story specimens. */
.catalog-label {
  display: flex;
  justify-content: space-between;
  padding: 20px 10px 8px;
  color: ${uiTokens.ink.tertiary};
  font-size: ${uiTokens.type.micro};
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
#catalog {
  flex: 1;
  overflow: auto;
  min-height: 0;
  padding: 0 0 18px;
  scrollbar-width: thin;
}
.catalog-empty {
  margin: 12px 10px;
  font-size: ${uiTokens.type.caption};
  line-height: 1.7;
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
.workshop-local {
  border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  display: grid;
  gap: 12px;
  padding: 15px 10px;
  color: ${uiTokens.ink.secondary};
  font-size: ${uiTokens.type.micro};
}
.workshop-local-note {
  display: flex;
  align-items: center;
  gap: 7px;
}
/* Label above a full-width select, so the choice is never truncated. */
.workshop-appearance {
  display: grid;
  gap: 6px;
}
.workshop-appearance select {
  width: 100%;
  min-height: ${uiTokens.control.small};
  border-radius: ${uiTokens.radius.md};
  font-size: ${uiTokens.type.label};
}
.status-dot {
  width: 5px;
  height: 5px;
  background: ${uiTokens.status.success};
  border-radius: 50%;
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
#group {
  font-size: ${uiTokens.type.caption};
  color: ${uiTokens.ink.secondary};
  white-space: nowrap;
}
.breadcrumb-separator {
  color: ${uiTokens.line.control};
}
#breadcrumb-component {
  font-size: ${uiTokens.type.label};
  font-weight: 500;
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#standalone {
  margin-left: auto;
  display: grid;
  place-items: center;
  min-width: 30px;
  min-height: 30px;
  color: ${uiTokens.ink.secondary};
  border-radius: ${uiTokens.radius.md};
}
#standalone:hover {
  background: ${uiTokens.surface.fill};
  color: ${uiTokens.ink.primary};
}
#toggle-sidebar {
  display: none;
}
.workshop-intro {
  padding: 22px 24px 0;
  min-width: 0;
}
#title {
  margin: 0;
  font-size: ${uiTokens.type.pageTitle};
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: -0.02em;
}
#scenario-description {
  margin: 6px 0 16px;
  max-width: 76ch;
  font-size: ${uiTokens.type.caption};
  line-height: 1.7;
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
  min-height: 34px;
  border-bottom: 2px solid transparent;
  color: ${uiTokens.ink.secondary};
  font-size: ${uiTokens.type.caption};
}
#variants a:hover,
#variants a[aria-current="page"] {
  color: ${uiTokens.ink.primary};
}
#variants a[aria-current="page"] {
  border-bottom-color: ${uiTokens.ink.primary};
}
.workshop-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
}
.preview-label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: ${uiTokens.ink.secondary};
  font-size: ${uiTokens.type.micro};
  margin-right: auto;
}
/* The viewport switch is the library's track: same inset, concentric radii and thumb. */
.workshop-viewport {
  display: flex;
  gap: 2px;
  padding: ${uiTokens.control.trackInset};
  border-radius: calc(${uiTokens.radius.md} + ${uiTokens.control.trackInset});
  background: ${uiTokens.surface.fill};
}
.workshop-viewport ${partSelector(buttonContract, "root")}:where([${buttonOptions.attribute("variant")}="quiet"]) {
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
  color: ${uiTokens.ink.secondary};
  min-width: 48px;
  text-align: center;
}
#reset {
  border-left: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  border-radius: 0;
  padding-left: 14px;
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
  font-weight: 500;
  color: ${uiTokens.ink.primary};
}
.workshop-observations > summary > ${partSelector(disclosureContract, "icon")} {
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
  line-height: 1.7;
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
  font-weight: 500;
  margin-right: auto;
}
#events {
  max-height: 80px;
  overflow: auto;
  font: ${uiTokens.type.code}/1.8 ${uiTokens.type.mono};
  color: ${uiTokens.ink.secondary};
  padding-left: 18px;
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
  .preview-label {
    display: none;
  }
  .workshop-viewport {
    margin-right: auto;
  }
  .workshop-stage {
    padding: 20px;
  }
  #reset span {
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
  .workshop-toolbar {
    gap: 5px;
    padding: 0 12px;
  }
  .workshop-viewport ${partSelector(buttonContract, "root")}:where([${buttonOptions.attribute("variant")}="quiet"]) {
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
  #standalone,
  #toggle-sidebar {
    min-height: 44px;
  }
  #standalone,
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
  .workshop-viewport ${partSelector(buttonContract, "root")}:where([${buttonOptions.attribute("variant")}="quiet"]) {
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
