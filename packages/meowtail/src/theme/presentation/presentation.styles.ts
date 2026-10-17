import { css, partSelector } from "meowcss/meowjsx";
import { presentationContract } from "../../presentation/presentation";
import { revealContract } from "../../presentation/reveal";
import { presentationVideoContract, presentationAudioContract } from "../../presentation/media";
import { buttonContract } from "../../components/button";
import { uiTokens } from "../tokens";
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
    gap: 12px;
    color: ${tokens.chromeInk};
    font-family: ${uiTokens.font};
    background: ${tokens.chromeBackdrop};
    padding: 16px 24px;
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
    box-shadow: ${uiTokens.shadowPanel};
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
    display: flex;
    flex: 0 0 auto;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    width: max-content;
    max-width: 100%;
    min-width: 0;
    gap: 12px;
    margin-inline: auto;
    padding: 6px 8px;
    border: 1px solid ${tokens.chromeLine};
    border-radius: 20px;
    background: ${tokens.chromeSurface};
    color: ${tokens.chromeInk};
    box-shadow: 0 8px 24px rgb(0 0 0 / 4%);
    font-size: 14px;
  }
  :where(${part("navigation")}, ${part("tools")}) {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    min-width: 0;
    gap: 2px;
    color: ${tokens.chromeInk};
  }
  ${part("navigation")} button${partSelector(buttonContract, "root")} {
    width: 44px;
    padding-inline: 0;
  }
  ${part("controls")} button${partSelector(buttonContract, "root")} {
    flex: 0 0 auto;
    min-height: 44px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: ${tokens.chromeInk};
    box-shadow: none;
    font-size: 13px;
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
    display: flex;
    flex: 0 1 280px;
    align-items: center;
    min-width: 0;
    max-width: 320px;
    min-height: 44px;
    gap: 8px;
    padding-inline: 10px;
    border-inline: 1px solid ${tokens.chromeLine};
    color: ${tokens.chromeMuted};
  }
  ${part("slide-picker")} > svg {
    flex: 0 0 auto;
  }
  ${part("slide-picker")} > span {
    font-size: 11px;
    letter-spacing: 0.02em;
  }
  ${part("slide-picker")} select {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    min-height: 44px;
    max-width: 100%;
    padding-inline: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: ${tokens.chromeInk};
    font: 400 13px/20px ${uiTokens.font};
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
  ${part("diagnostic")} {
    margin: 0;
    font-size: ${uiTokens.fontCaption};
    color: ${uiTokens.warning};
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
    gap: 8px;
    margin: 0;
  }
  ${partSelector(presentationVideoContract, "media")} {
    display: block;
    width: 100%;
    max-height: 440px;
    object-fit: contain;
    background: #101820;
    border-radius: 12px;
  }
  ${partSelector(presentationAudioContract, "media")} {
    max-width: 100%;
  }
  :where(${partSelector(presentationVideoContract, "status")}, ${partSelector(presentationAudioContract, "status")}) {
    font-size: ${tokens.fontCaption};
    color: ${tokens.muted};
  }
  :where(${partSelector(presentationVideoContract, "actions")}, ${partSelector(presentationAudioContract, "actions")}) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: ${uiTokens.fontBody};
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
    font-size: ${uiTokens.fontCaption};
    color: ${uiTokens.mutedForeground};
  }
  @media (max-height: 520px) {
    ${part("root")} {
      min-height: 320px;
      padding: 8px 12px;
      gap: 6px;
    }
    ${part("header")} {
      padding-block: 0;
    }
  }
  @media (max-width: 700px) {
    ${part("root")} {
      padding: 12px;
      gap: 10px;
    }
    ${part("controls")} {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      width: 100%;
      gap: 4px 8px;
      padding: 6px;
      border-radius: 16px;
    }
    ${part("navigation")} {
      grid-column: 1;
      grid-row: 1;
    }
    ${part("tools")} {
      grid-column: 2;
      grid-row: 1;
      justify-content: flex-end;
      flex-wrap: wrap;
    }
    ${part("tools")} button${partSelector(buttonContract, "root")} {
      padding-inline: 8px;
      font-size: 12px;
    }
    ${part("page-number")} {
      min-width: 52px;
      padding-inline: 0;
    }
    ${part("slide-picker")} {
      grid-column: 1 / -1;
      grid-row: 2;
      max-width: none;
      padding-inline: 8px;
      border-inline: 0;
      border-top: 1px solid ${tokens.chromeLine};
    }
  }
`;
