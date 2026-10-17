import { css, partSelector } from "meowcss/meowjsx";
import { presentationContract } from "../../presentation/presentation";
import { revealContract } from "../../presentation/reveal";
import { presentationVideoContract, presentationAudioContract } from "../../presentation/media";
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
    gap: ${uiTokens.spaceGroup};
    color: ${uiTokens.foreground};
    font-family: ${uiTokens.font};
    background: ${uiTokens.surfaceMuted};
    padding: ${uiTokens.spaceGroup};
  }
  ${part("header")} {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: ${uiTokens.spaceGroup};
    padding: 4px 8px;
  }
  ${part("title")} {
    margin: 0;
    font-size: ${uiTokens.fontTitle};
    font-weight: 600;
  }
  ${part("position")} {
    margin: 0;
    font-size: ${uiTokens.fontCaption};
    color: ${uiTokens.mutedForeground};
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
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    padding: 4px;
    font-size: ${uiTokens.fontBody};
  }
  ${part("controls")} label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  ${part("controls")} select {
    max-width: 220px;
    min-height: ${uiTokens.controlHeight};
    font: inherit;
    color: inherit;
    background: ${uiTokens.background};
    border: 1px solid ${uiTokens.border};
    border-radius: ${uiTokens.controlRadius};
  }
  ${part("diagnostic")} {
    margin: 0;
    font-size: ${uiTokens.fontCaption};
    color: ${uiTokens.warning};
  }
  ${part("soundtrack")} {
    padding: 4px;
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
    }
    ${part("header")} {
      padding-block: 0;
    }
  }
`;
