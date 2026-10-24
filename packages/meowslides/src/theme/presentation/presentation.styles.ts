import { css, parts } from "meowcss/meowjsx";
import type { Presentation } from "../../presentation/presentation";
import type { Reveal } from "../../presentation/reveal";
import type { PresentationVideo, PresentationAudio } from "../../presentation/media";
import type { Button, Popover } from "meowtail";
import { ui, uiTokens } from "meowtail/theme";
import { presentationTokens as tokens } from "./presentation.tokens";

const part = parts<typeof Presentation>("presentation");
const reveal = parts<typeof Reveal>("presentation-reveal");
const video = parts<typeof PresentationVideo>("presentation-video");
const audio = parts<typeof PresentationAudio>("presentation-audio");
const button = parts<typeof Button>("button");
const popover = parts<typeof Popover>("popover");

export const presentationStyles = css`
  ${part.root} {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: min(480px, 100dvh);
    ${ui.gap.group}
    color: ${tokens.chromeInk};
    ${ui.font.sans}
    background: ${tokens.chromeBackdrop};
    ${ui.py.group}
    ${ui.px.panel}
  }
  ${part.header} {
    display: flex;
    flex: 0 0 auto;
    min-width: 0;
    align-items: center;
    padding: 0 2px;
    color: ${tokens.chromeMuted};
  }
  ${part.title} {
    margin: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${tokens.chromeMuted};
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: 0.01em;
  }
  ${part.position} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ${part.viewport} {
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    align-items: center;
    justify-content: center;
    overscroll-behavior: contain;
  }
  ${part.viewport}[data-actual-size] {
    align-items: flex-start;
    justify-content: flex-start;
  }
  ${part.stage} {
    position: relative;
    flex: 0 0 auto;
    ${ui.shadow.float}
  }
  ${part.slide} {
    position: absolute;
    inset: 0 auto auto 0;
    box-sizing: border-box;
    width: 1280px;
    height: 720px;
    padding: ${tokens.insetBlock} ${tokens.insetInline};
    transform-origin: top left;
    background: ${tokens.paper};
    color: ${tokens.ink};
    font-size: ${tokens.fontBody};
    line-height: ${tokens.lineHeight};
    overflow: visible;
    isolation: isolate;
  }
  ${part.slide}[data-background-foreground="light"] {
    ${tokens.ink.name}: ${tokens.onDarkInk};
    ${tokens.muted.name}: ${tokens.onDarkMuted};
  }
  ${part.slide}[data-background-foreground="dark"] {
    ${tokens.ink.name}: ${tokens.onLightInk};
    ${tokens.muted.name}: ${tokens.onLightMuted};
  }
  ${part.background} {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: clip;
    pointer-events: none;
    background: ${tokens.paper};
  }
  ${part["background-image"]}, ${part["background-overlay"]} {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  ${part["background-image"]}[hidden] {
    display: none;
  }
  ${part.slide} :where(h1, h2, h3, p, figure) {
    margin: 0;
  }
  ${part.slide} :where(h1) {
    font-size: ${tokens.fontTitle};
    line-height: 1.1;
    letter-spacing: -0.035em;
  }
  ${part.slide} :where(h2) {
    font-size: ${tokens.fontSubtitle};
    line-height: 1.15;
    letter-spacing: -0.025em;
  }
  ${part.slide} :where(h3) {
    font-size: 32px;
    line-height: 1.2;
  }
  ${part.slide} :where(small, figcaption) {
    font-size: ${tokens.fontCaption};
    color: ${tokens.muted};
  }
  ${part.slide} :where(img, video) {
    max-width: 100%;
    object-fit: contain;
  }
  ${part.controls} {
    box-sizing: border-box;
    flex: 0 0 auto;
    container-type: inline-size;
    width: 100%;
    max-width: ${uiTokens.layout.containerContent};
    min-width: 0;
    margin-inline: auto;
    ${ui.p.group}
    border: 1px solid ${tokens.chromeLine};
    border-radius: 20px;
    background: ${tokens.chromeSurface};
    color: ${tokens.chromeInk};
    box-shadow: 0 8px 24px rgb(0 0 0 / 4%);
    font-size: ${uiTokens.type.body};
  }
  :where(${part.navigation}, ${part.tools}) {
    flex: 0 0 auto;
    min-width: 0;
    color: ${tokens.chromeInk};
  }
  ${part.navigation} button${button.root},
  ${part.tools} > ${popover.root} > button${button.root} {
    width: ${uiTokens.control.large};
    padding-inline: 0;
  }
  ${part.controls} button${button.root} {
    flex: 0 0 auto;
    min-height: ${uiTokens.control.large};
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: ${tokens.chromeInk};
    box-shadow: none;
    font-size: ${uiTokens.type.body};
  }
  ${part.controls} button${button.root}:hover:not(:disabled) {
    background: color-mix(in srgb, ${tokens.chromeInk} 7%, transparent);
    color: ${tokens.chromeInk};
  }
  ${part.controls} button${button.root}[aria-pressed="true"] {
    background: color-mix(in srgb, ${tokens.chromeInk} 12%, transparent);
    color: ${tokens.chromeInk};
  }
  ${part.controls} button${button.root}:focus-visible {
    outline: 2px solid ${tokens.chromeInk};
    outline-offset: 2px;
  }
  ${part.controls} button${button.root}:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  ${part["page-number"]} {
    min-width: 60px;
    padding-inline: 4px;
    color: ${tokens.chromeMuted};
    font-size: 16px;
    line-height: 20px;
    font-variant-numeric: tabular-nums;
    text-align: center;
    white-space: nowrap;
  }
  ${part["page-number"]} > span:first-child {
    color: ${tokens.chromeInk};
    font-weight: 650;
  }
  ${part.step} {
    display: block;
    margin-top: 1px;
    color: ${tokens.chromeMuted};
    font-size: 10px;
    line-height: 14px;
  }
  ${part.step}[hidden] {
    display: none;
  }
  ${part["slide-picker"]} {
    flex: 1 1 12rem;
    min-width: 0;
    min-height: ${uiTokens.control.large};
    ${ui.px.group}
    border-inline: 1px solid ${tokens.chromeLine};
    color: ${tokens.chromeMuted};
    font-size: ${uiTokens.type.caption};
  }
  ${part["slide-picker"]} select {
    width: 100%;
    min-width: 0;
    min-height: ${uiTokens.control.large};
    max-width: 100%;
    padding-inline: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: ${tokens.chromeInk};
    font: ${uiTokens.type.weight.regular} ${uiTokens.type.body}/20px ${uiTokens.type.sans};
    text-overflow: ellipsis;
    cursor: pointer;
  }
  ${part["slide-picker"]} select:focus-visible {
    outline: 2px solid ${tokens.chromeInk};
    outline-offset: 2px;
  }
  ${part["slide-picker"]} option {
    background: ${tokens.chromeSurface};
    color: ${tokens.chromeInk};
  }
  ${part.tools} div${popover.panel} {
    width: max-content;
    min-width: 200px;
    background: ${tokens.chromeSurface};
    color: ${tokens.chromeInk};
    border: 1px solid ${tokens.chromeLine};
    ${ui.p.group}
  }
  ${part.tools} ${popover.panel} button {
    justify-content: flex-start;
    ${ui.px.group}
  }
  @container (max-width: 480px) {
    ${part.navigation} {
      flex-grow: 1;
    }
    ${part["slide-picker"]} {
      order: 1;
      flex-basis: 100%;
      padding-inline: 0;
      padding-top: ${uiTokens.space.group};
      border-inline: 0;
      border-top: 1px solid ${tokens.chromeLine};
    }
  }
  ${part.diagnostic} {
    margin: 0;
    font-size: ${uiTokens.type.caption};
    ${ui.color.warning}
  }
  ${part.soundtrack} {
    padding: 4px;
    color: ${tokens.chromeInk};
  }
  ${reveal.root} {
    min-width: 0;
  }
  :where(${video.root}, ${audio.root}) {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    gap: 8px;
    margin: 0;
  }
  ${video.media} {
    display: block;
    width: 100%;
    min-height: 0;
    max-height: 440px;
    object-fit: contain;
    background: #101820;
    border-radius: 12px;
  }
  ${audio.media} {
    max-width: 100%;
  }
  :where(${video.status}, ${audio.status}) {
    display: flex;
    flex-direction: column;
    flex: none;
    gap: 4px;
    font-size: ${tokens.fontCaption};
    color: ${tokens.muted};
  }
  :where(${video.actions}, ${audio.actions}) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: ${uiTokens.type.body};
    flex: none;
  }
  :where(${video.status}, ${audio.status}) > [hidden] {
    display: none;
  }
  :where(${video.actions}, ${audio.actions}) > [hidden] {
    display: none;
  }
  ${part.soundtrack} ${audio.root} {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
  ${part.soundtrack} ${audio.status} {
    font-size: ${uiTokens.type.caption};
    ${ui.color.secondary}
  }
  ${part.soundtrack} ${audio.actions} {
    min-width: 0;
    max-width: 100%;
  }
  @media (max-height: 520px) {
    ${part.root} {
      min-height: min(320px, 100dvh);
    }
  }
  @media (max-height: 520px), (max-width: 700px) {
    ${part.root} {
      ${ui.p.group}
    }
  }
`;
