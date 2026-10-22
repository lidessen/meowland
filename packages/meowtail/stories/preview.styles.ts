import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens, logoTokens, lineTokens } from "meowtail/theme";
import { fieldContract } from "meowtail";

export const previewStyles = css`
  /* Fixture layout only; the components use the production MeowUI theme. */
  html,
  body {
    margin: 0;
    min-width: 0;
    background: ${uiTokens.background};
    color: ${uiTokens.foreground};
    font-family: ${uiTokens.font};
  }
  * {
    box-sizing: border-box;
  }
  .meowui-story {
    padding: ${uiTokens.spacePanel};
    font-size: ${uiTokens.fontBody};
    line-height: ${uiTokens.leading};
  }
  /* A slim strip above the specimen, ruled by the same divider as the gallery. */
  .workshop-theme-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${uiTokens.spaceSection};
    padding: 10px ${uiTokens.spacePanel};
    border-bottom: ${lineTokens.width} solid ${lineTokens.divider};
    color: ${uiTokens.subtleForeground};
    font-size: ${uiTokens.fontCaption};
  }
  .workshop-theme-controls label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .workshop-theme-controls select {
    max-width: 180px;
    width: auto;
    min-height: ${uiTokens.controlSmall};
    border-radius: ${uiTokens.radiusSmall};
    font-size: ${uiTokens.fontLabel};
  }
  .workshop-composition {
    max-width: 720px;
    margin-inline: auto;
    display: grid;
    gap: ${uiTokens.spacePanel};
  }
  .workshop-composition h1 {
    margin: 0;
    font-size: ${uiTokens.fontHeading};
    font-weight: 600;
    letter-spacing: -0.025em;
  }
  .workshop-composition p {
    margin: 0;
  }
  .workshop-composition-header {
    display: grid;
    gap: 8px;
  }
  .workshop-composition-header p {
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontBody};
    line-height: ${uiTokens.leading};
  }
  .workshop-composition-columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: ${uiTokens.spacePanel};
  }
  .workshop-section {
    display: grid;
    gap: ${uiTokens.spacePanel};
    min-width: 0;
  }
  .workshop-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .workshop-navigation {
    display: grid;
    gap: 4px;
    align-content: start;
  }
  @media (max-width: 560px) {
    .workshop-composition-columns {
      grid-template-columns: minmax(0, 1fr);
    }
    .workshop-theme-controls {
      padding-inline: 16px;
    }
  }
  .workshop-stack {
    display: grid;
    gap: ${uiTokens.spaceSection};
    min-width: 0;
    justify-items: start;
  }
  .workshop-stack > section,
  .workshop-stack > ${partSelector(fieldContract, "root")} {
    width: 100%;
  }
  .workshop-stack p,
  .workshop-document p {
    margin: 0;
  }
  .workshop-composition-header h2 {
    margin: 0;
    font-size: ${uiTokens.fontTitle};
    letter-spacing: -0.01em;
    font-weight: 600;
  }
  /* Specimen labels share the small-caps label role the docs and gallery use. */
  .workshop-section-title {
    margin: 0;
    color: ${uiTokens.subtleForeground};
    font-size: ${uiTokens.fontMicro};
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .workshop-feedback {
    min-height: 20px;
    margin: 0;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
    line-height: 1.6;
  }
  .workshop-disclosure-detail {
    display: grid;
    gap: 8px;
    min-width: 0;
  }
  .workshop-disclosure-path {
    display: block;
    font-family: ${uiTokens.mono};
    font-size: ${uiTokens.fontCaption};
    color: ${uiTokens.mutedForeground};
    overflow-wrap: anywhere;
  }
  .workshop-document {
    display: grid;
    gap: 12px;
    line-height: 1.7;
  }
  .workshop-document h3 {
    margin: 0;
    font-size: ${uiTokens.fontBody};
  }
  ${partSelector(fieldContract, "root")} + .workshop-document {
    margin-top: 12px;
  }
  .workshop-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }
  .workshop-constrained {
    width: min(100%, 560px);
  }
  .workshop-note {
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
  }
  .workshop-brand-mark {
    width: 28px;
    height: 28px;

    ${logoTokens.ink.name}: ${uiTokens.foreground};
  }
  .workshop-icon-grid {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 8px;
  }
  .workshop-icon-item {
    display: grid;
    justify-items: center;
    gap: 8px;
    padding: 12px 6px;
    border: 1px solid transparent;
    border-radius: ${uiTokens.controlRadius};
    font-size: ${uiTokens.fontMicro};
    color: ${uiTokens.mutedForeground};
  }
  .workshop-icon-item[hidden] {
    display: none;
  }
  .workshop-icon-item[aria-pressed="true"] {
    background: ${uiTokens.primarySoft};
    border-color: ${uiTokens.focus};
    color: ${uiTokens.foreground};
  }
  .workshop-icon-scale > .workshop-note {
    min-width: 36px;
  }
  .workshop-brand-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 24px;
  }
  .workshop-brand-grid figure {
    margin: 0;
    display: grid;
    gap: 12px;
    justify-items: center;
    align-content: center;
    grid-template-rows: 88px auto;
    align-items: center;
    font-size: ${uiTokens.fontCaption};
    color: ${uiTokens.mutedForeground};
  }
  .workshop-brand-grid svg {
    width: 64px;
    height: 64px;
  }
  .workshop-brand-grid .meow-doodle-cat {
    width: 104px;
    height: 88px;
  }
  .workshop-brand-grid .meow-github-icon {
    width: 52px;
    height: 52px;
  }
  @media (max-width: 480px) {
    .meowui-story {
      padding: 16px;
    }
  }

  /* Fixture composition: preserve relationships without changing component themes. */
  .workshop-foundation-action-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .workshop-foundation-range {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    width: 100%;
  }
  .workshop-foundation-range > label {
    display: grid;
    min-width: 0;
    gap: 6px;
  }
  .workshop-foundation-field-action {
    display: flex;
    justify-content: flex-end;
  }
  .workshop-foundation-destructive {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    width: 100%;
    gap: 12px 24px;
    margin-top: 12px;
  }
  .workshop-search-results {
    display: grid;
    width: 100%;
    border-block: ${lineTokens.width} solid ${lineTokens.divider};
  }
  .workshop-icon-state-sample {
    display: grid;
    justify-items: center;
    min-width: 56px;
    gap: 4px;
  }
  .workshop-search-results article {
    padding-block: 12px;
  }
  .workshop-search-results article:not([hidden]) ~ article:not([hidden]) {
    border-top: ${lineTokens.width} solid ${lineTokens.divider};
  }
  .workshop-search-results h3 {
    margin: 0 0 3px;
    font-size: ${uiTokens.fontBody};
    font-weight: 550;
  }
  .workshop-search-results p {
    margin: 0;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
  }
  .workshop-search-results [data-search-empty] {
    padding-block: 20px;
  }
  .workshop-foundation-empty-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px;
    width: 100%;
  }
  .workshop-foundation-empty-sample {
    min-width: 0;
  }
  .workshop-foundation-empty-sample > .workshop-section-title {
    margin: 0;
  }
  .workshop-foundation-empty-sample > .workshop-feedback {
    text-align: center;
  }
  @media (max-width: 600px) {
    .workshop-foundation-empty-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;
