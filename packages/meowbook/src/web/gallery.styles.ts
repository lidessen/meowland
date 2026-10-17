import { css, partSelector } from "meowcss/meowjsx";
import { tokenRef } from "meowcss";
import { uiTokens } from "meowtail/theme";
import { buttonContract, buttonOptions, disclosureContract } from "meowtail";
export const inspectionHeight = tokenRef("workshop", "inspection", "height");

export const galleryStyles = css`
:root {
  font-family: ${uiTokens.font};
  font-size: 13px;
  color: ${uiTokens.foreground};
  background: ${uiTokens.surface};
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
  outline: 2px solid ${uiTokens.focus};
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
  background: ${uiTokens.surface};
  border-right: 1px solid ${uiTokens.border};
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
  font-size: 16px;
  letter-spacing: -0.5px;
}
.workshop-brand > svg {
  color: ${uiTokens.mutedForeground};
}
.workshop-brand > span {
  margin-left: auto;
  font-size: 11px;
  letter-spacing: 0.6px;
  color: ${uiTokens.mutedForeground};
  border: 1px solid ${uiTokens.border};
  padding: 1px 5px;
  border-radius: 4px;
}
.catalog-label {
  display: flex;
  justify-content: space-between;
  padding: 20px 10px 8px;
  color: ${uiTokens.mutedForeground};
  font-size: 11px;
  letter-spacing: 0.8px;
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
  font-size: 12px;
  line-height: 1.7;
  color: ${uiTokens.mutedForeground};
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
  color: ${uiTokens.foreground};
}
.workshop-observations > summary > strong {
  flex-shrink: 0;
}
#catalog h2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 10px 8px;
  font-size: 11px;
  font-weight: 500;
  color: ${uiTokens.mutedForeground};
}
.catalog-group-count {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  opacity: 0.75;
}
#catalog h2:first-child {
  margin-top: 7px;
}
#catalog a {
  display: block;
  min-height: 32px;
  padding: 6px 10px;
  margin: 1px 0;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: ${uiTokens.foreground};
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
#catalog a::before {
  content: none;
  position: absolute;
  width: 2px;
  height: 12px;
  left: 8px;
  top: calc(50% - 6px);
  background: transparent;
  border-radius: 2px;
}
#catalog a:hover {
  background: ${uiTokens.surfaceMuted};
  color: ${uiTokens.foreground};
}
#catalog a[aria-current="page"] {
  background: ${uiTokens.primarySoft};
  color: ${uiTokens.foreground};
  font-weight: 550;
}
#catalog a[aria-current="page"]::before {
  background: ${uiTokens.primary};
}
.workshop-local {
  border-top: 1px solid ${uiTokens.border};
  display: grid;
  gap: 12px;
  padding: 15px 10px;
  color: ${uiTokens.mutedForeground};
  font-size: 11px;
}
.workshop-local-note {
  display: flex;
  align-items: center;
  gap: 7px;
}
.workshop-appearance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.workshop-appearance select {
  max-width: 120px;
}
.status-dot {
  width: 5px;
  height: 5px;
  background: ${uiTokens.success};
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
  border-bottom: 1px solid ${uiTokens.border};
  min-width: 0;
}
#group {
  font-size: 12px;
  color: ${uiTokens.mutedForeground};
  white-space: nowrap;
}
.breadcrumb-separator {
  color: ${uiTokens.border};
}
#breadcrumb-component {
  font-size: 13px;
  font-weight: 550;
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
  color: ${uiTokens.mutedForeground};
  border-radius: 5px;
}
#standalone:hover {
  background: ${uiTokens.surfaceMuted};
  color: ${uiTokens.foreground};
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
  font-size: 24px;
  line-height: 1.4;
  font-weight: 600;
  letter-spacing: -0.4px;
}
#scenario-description {
  margin: 6px 0 16px;
  max-width: 76ch;
  font-size: 12px;
  line-height: 1.7;
  color: ${uiTokens.mutedForeground};
}
#variants {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  border-bottom: 1px solid ${uiTokens.border};
  scrollbar-width: thin;
}
#variants a {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  min-height: 34px;
  border-bottom: 2px solid transparent;
  color: ${uiTokens.mutedForeground};
  font-size: 12px;
}
#variants a:hover,
#variants a[aria-current="page"] {
  color: ${uiTokens.foreground};
}
#variants a[aria-current="page"] {
  border-bottom-color: ${uiTokens.foreground};
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
  color: ${uiTokens.mutedForeground};
  font-size: 11px;
  margin-right: auto;
}
.workshop-viewport {
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: 6px;
  background: ${uiTokens.surfaceMuted};
}
.workshop-shell ${partSelector(buttonContract, "root")}:where([${buttonOptions.attribute("variant")}="quiet"]),
.workshop-shell ${partSelector(buttonContract, "root")}:where([${buttonOptions.attribute("variant")}="outline"]) {
  box-shadow: none;
}
.workshop-viewport ${partSelector(buttonContract, "root")}:where([${buttonOptions.attribute("variant")}="quiet"]) {
  color: ${uiTokens.mutedForeground};
}
.workshop-viewport button[aria-pressed="true"] {
  background: ${uiTokens.surface};
  color: ${uiTokens.foreground};
  box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
}
.viewport-size {
  font-size: 11px;
  font-family: ${uiTokens.mono};
  color: ${uiTokens.mutedForeground};
  min-width: 48px;
  text-align: center;
}
#reset {
  border-left: 1px solid ${uiTokens.border};
  border-radius: 0;
  padding-left: 14px;
}
.workshop-stage {
  min-height: 0;
  overflow: auto;
  padding: 24px;
  background-color: ${uiTokens.background};
  border-top: 1px solid ${uiTokens.border};
  border-bottom: 1px solid ${uiTokens.border};
}
#canvas {
  display: block;
  height: 100%;
  min-height: 180px;
  margin: 0 auto;
  border: 0;
  border-radius: 7px;
  background: ${uiTokens.surface};
  box-shadow:
    0 0 0 1px ${uiTokens.border},
    0 4px 18px rgb(0 0 0 / 2%);
}
.workshop-observations {
  background: ${uiTokens.surface};
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
  color: ${uiTokens.mutedForeground};
  font-size: 11px;
}
.workshop-observations > summary::-webkit-details-marker {
  display: none;
}
.workshop-observations > summary > strong {
  font-weight: 450;
  color: ${uiTokens.foreground};
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
  color: ${uiTokens.mutedForeground};
  font-size: 11px;
  margin-left: 12px;
}
#inspection[data-warning="true"] {
  color: ${uiTokens.danger};
}
.inspection-body {
  padding: 8px 24px 12px;
  max-height: 260px;
  overflow: auto;
  border-top: 1px solid ${uiTokens.border};
}
.workshop-description {
  margin-bottom: 18px;
}
#description {
  margin: 0 0 8px;
  color: ${uiTokens.mutedForeground};
  font-size: 12px;
  line-height: 1.7;
}
#covers {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
#covers span {
  font-size: 11px;
  color: ${uiTokens.mutedForeground};
  padding: 2px 0;
}
#covers span + span::before {
  content: "·";
  margin-right: 6px;
  color: ${uiTokens.mutedForeground};
}
.workshop-observation-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.workshop-observation-head > strong {
  font-size: 11px;
  font-weight: 500;
  margin-right: auto;
}
#events {
  max-height: 80px;
  overflow: auto;
  font: 11px/1.8 ${uiTokens.mono};
  color: ${uiTokens.mutedForeground};
  padding-left: 18px;
}
#events:empty {
  display: none;
}
.workshop-batch {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid ${uiTokens.border};
}
#batch-status,
.workshop-limits {
  color: ${uiTokens.mutedForeground};
  font-size: 11px;
}
.workshop-limits {
  margin: 12px 0 0;
}
#batch-results {
  padding-left: 18px;
  font-size: 12px;
}
#batch-results:empty {
  display: none;
}
#batch-results span {
  display: block;
  color: ${uiTokens.danger};
  font-size: 11px;
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
    background: ${uiTokens.backdrop};
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
    box-shadow: 15px 0 35px rgb(0 0 0 / 10%);
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
    font-size: 11px;
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
    font-size: 11px;
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
  #catalog a,
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
    border-top: 1px solid ${uiTokens.border};
    box-shadow: 0 -8px 28px rgb(0 0 0 / 8%);
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
    font-size: 20px;
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
  background: ${uiTokens.surfaceMuted};
  box-shadow: inset 0 0 0 1px ${uiTokens.border};
}
#measurement-detail {
  grid-row: 5;
  padding: 8px 16px;
  max-height: 150px;
  overflow: auto;
  border-top: 1px solid ${uiTokens.border};
  font-size: 11px;
}
#measurement-help {
  margin: 0;
  color: ${uiTokens.mutedForeground};
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
