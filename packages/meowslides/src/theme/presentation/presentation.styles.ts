import { css, partSelector } from "meowcss/meowjsx";
import { presentationContract } from "../../presentation/presentation";
import { revealContract } from "../../presentation/reveal";
import { presentationVideoContract, presentationAudioContract } from "../../presentation/media";
import { buttonContract } from "meowtail";
import { popoverContract } from "meowtail";
import { uiTokens } from "meowtail/theme";
import { presentationTokens as tokens } from "./presentation.tokens";

const part = (name: (typeof presentationContract.parts)[number]) =>
  partSelector(presentationContract, name);

export const presentationStyles = css`
  ${part("root")} {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: min(480px, 100dvh);
    gap: ${uiTokens.space.group};
    color: ${tokens.chromeInk};
    font-family: ${uiTokens.type.sans};
    background: ${tokens.chromeBackdrop};
    padding: ${uiTokens.space.group} ${uiTokens.space.panel};
  }
  ${part("header")} {
    display: flex;
    flex: 0 0 auto;
    min-width: 0;
    align-items: center;
    padding: 0 2px;
    color: ${tokens.chromeMuted};
  }
  ${part("title")} {
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
  ${part("position")} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ${part("viewport")} {
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    align-items: center;
    justify-content: center;
    overscroll-behavior: contain;
  }
  ${part("viewport")}[data-actual-size] {
    align-items: flex-start;
    justify-content: flex-start;
  }
  ${part("stage")} {
    position: relative;
    flex: 0 0 auto;
    box-shadow: ${uiTokens.shadow.float};
  }
  ${part("slide")} {
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
  ${part("slide")}[data-background-foreground="light"] {
    ${tokens.ink.name}: ${tokens.onDarkInk};
    ${tokens.muted.name}: ${tokens.onDarkMuted};
  }
  ${part("slide")}[data-background-foreground="dark"] {
    ${tokens.ink.name}: ${tokens.onLightInk};
    ${tokens.muted.name}: ${tokens.onLightMuted};
  }
  ${part("background")} {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: clip;
    pointer-events: none;
    background: ${tokens.paper};
  }
  ${part("background-image")}, ${part("background-overlay")} {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  ${part("background-image")}[hidden] {
    display: none;
  }
  ${part("slide")} :where(h1, h2, h3, p, figure) {
    margin: 0;
  }
  ${part("slide")} :where(h1) {
    font-size: ${tokens.fontTitle};
    line-height: 1.1;
    letter-spacing: -0.035em;
  }
  ${part("slide")} :where(h2) {
    font-size: ${tokens.fontSubtitle};
    line-height: 1.15;
    letter-spacing: -0.025em;
  }
  ${part("slide")} :where(h3) {
    font-size: 32px;
    line-height: 1.2;
  }
  ${part("slide")} :where(small, figcaption) {
    font-size: ${tokens.fontCaption};
    color: ${tokens.muted};
  }
  ${part("slide")} :where(img, video) {
    max-width: 100%;
    object-fit: contain;
  }
  ${part("controls")} {
    box-sizing: border-box;
    flex: 0 0 auto;
    container-type: inline-size;
    width: 100%;
    max-width: ${uiTokens.layout.containerContent};
    min-width: 0;
    margin-inline: auto;
    padding: ${uiTokens.space.group};
    border: 1px solid ${tokens.chromeLine};
    border-radius: 20px;
    background: ${tokens.chromeSurface};
    color: ${tokens.chromeInk};
    box-shadow: 0 8px 24px rgb(0 0 0 / 4%);
    font-size: ${uiTokens.type.body};
  }
  :where(${part("navigation")}, ${part("tools")}) {
    flex: 0 0 auto;
    min-width: 0;
    color: ${tokens.chromeInk};
  }
  ${part("navigation")} button${partSelector(buttonContract, "root")},
  ${part("tools")} > ${partSelector(popoverContract, "root")} > button${partSelector(buttonContract, "root")} {
    width: ${uiTokens.control.large};
    padding-inline: 0;
  }
  ${part("controls")} button${partSelector(buttonContract, "root")} {
    flex: 0 0 auto;
    min-height: ${uiTokens.control.large};
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: ${tokens.chromeInk};
    box-shadow: none;
    font-size: ${uiTokens.type.body};
  }
  ${part("controls")} button${partSelector(buttonContract, "root")}:hover:not(:disabled) {
    background: color-mix(in srgb, ${tokens.chromeInk} 7%, transparent);
    color: ${tokens.chromeInk};
  }
  ${part("controls")} button${partSelector(buttonContract, "root")}[aria-pressed="true"] {
    background: color-mix(in srgb, ${tokens.chromeInk} 12%, transparent);
    color: ${tokens.chromeInk};
  }
  ${part("controls")} button${partSelector(buttonContract, "root")}:focus-visible {
    outline: 2px solid ${tokens.chromeInk};
    outline-offset: 2px;
  }
  ${part("controls")} button${partSelector(buttonContract, "root")}:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  ${part("page-number")} {
    min-width: 60px;
    padding-inline: 4px;
    color: ${tokens.chromeMuted};
    font-size: 16px;
    line-height: 20px;
    font-variant-numeric: tabular-nums;
    text-align: center;
    white-space: nowrap;
  }
  ${part("page-number")} > span:first-child {
    color: ${tokens.chromeInk};
    font-weight: 650;
  }
  ${part("step")} {
    display: block;
    margin-top: 1px;
    color: ${tokens.chromeMuted};
    font-size: 10px;
    line-height: 14px;
  }
  ${part("step")}[hidden] {
    display: none;
  }
  ${part("slide-picker")} {
    flex: 1 1 12rem;
    min-width: 0;
    min-height: ${uiTokens.control.large};
    padding-inline: ${uiTokens.space.group};
    border-inline: 1px solid ${tokens.chromeLine};
    color: ${tokens.chromeMuted};
    font-size: ${uiTokens.type.caption};
  }
  ${part("slide-picker")} select {
    width: 100%;
    min-width: 0;
    min-height: ${uiTokens.control.large};
    max-width: 100%;
    padding-inline: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: ${tokens.chromeInk};
    font: 400 ${uiTokens.type.body}/20px ${uiTokens.type.sans};
    text-overflow: ellipsis;
    cursor: pointer;
  }
  ${part("slide-picker")} select:focus-visible {
    outline: 2px solid ${tokens.chromeInk};
    outline-offset: 2px;
  }
  ${part("slide-picker")} option {
    background: ${tokens.chromeSurface};
    color: ${tokens.chromeInk};
  }
  ${part("tools")} div${partSelector(popoverContract, "panel")} {
    width: max-content;
    min-width: 200px;
    background: ${tokens.chromeSurface};
    color: ${tokens.chromeInk};
    border: 1px solid ${tokens.chromeLine};
    padding: ${uiTokens.space.group};
  }
  ${part("tools")} ${partSelector(popoverContract, "panel")} button {
    justify-content: flex-start;
    padding-inline: ${uiTokens.space.group};
  }
  @container (max-width: 480px) {
    ${part("navigation")} {
      flex-grow: 1;
    }
    ${part("slide-picker")} {
      order: 1;
      flex-basis: 100%;
      padding-inline: 0;
      padding-top: ${uiTokens.space.group};
      border-inline: 0;
      border-top: 1px solid ${tokens.chromeLine};
    }
  }
  ${part("diagnostic")} {
    margin: 0;
    font-size: ${uiTokens.type.caption};
    color: ${uiTokens.status.warning};
  }
  ${part("soundtrack")} {
    padding: 4px;
    color: ${tokens.chromeInk};
  }
  ${partSelector(revealContract, "root")} {
    min-width: 0;
  }
  :where(${partSelector(presentationVideoContract, "root")}, ${partSelector(presentationAudioContract, "root")}) {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    gap: 8px;
    margin: 0;
  }
  ${partSelector(presentationVideoContract, "media")} {
    display: block;
    width: 100%;
    min-height: 0;
    max-height: 440px;
    object-fit: contain;
    background: #101820;
    border-radius: 12px;
  }
  ${partSelector(presentationAudioContract, "media")} {
    max-width: 100%;
  }
  :where(${partSelector(presentationVideoContract, "status")}, ${partSelector(presentationAudioContract, "status")}) {
    display: flex;
    flex-direction: column;
    flex: none;
    gap: 4px;
    font-size: ${tokens.fontCaption};
    color: ${tokens.muted};
  }
  :where(${partSelector(presentationVideoContract, "actions")}, ${partSelector(presentationAudioContract, "actions")}) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: ${uiTokens.type.body};
    flex: none;
  }
  :where(${partSelector(presentationVideoContract, "status")}, ${partSelector(presentationAudioContract, "status")}) > [hidden] {
    display: none;
  }
  :where(${partSelector(presentationVideoContract, "actions")}, ${partSelector(presentationAudioContract, "actions")}) > [hidden] {
    display: none;
  }
  ${part("soundtrack")} ${partSelector(presentationAudioContract, "root")} {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
  ${part("soundtrack")} ${partSelector(presentationAudioContract, "status")} {
    font-size: ${uiTokens.type.caption};
    color: ${uiTokens.ink.secondary};
  }
  ${part("soundtrack")} ${partSelector(presentationAudioContract, "actions")} {
    min-width: 0;
    max-width: 100%;
  }
  @media (max-height: 520px) {
    ${part("root")} {
      min-height: min(320px, 100dvh);
    }
  }
  @media (max-height: 520px), (max-width: 700px) {
    ${part("root")} {
      padding: ${uiTokens.space.group};
    }
  }
`;
