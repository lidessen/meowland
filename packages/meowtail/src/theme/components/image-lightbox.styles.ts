import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";
import { imageLightboxContract as image } from "../../components/image-lightbox";

export const imageLightboxStyles = css`
  ${partSelector(image, "trigger")} {
    border: 1px solid ${uiTokens.line.control};
    border-radius: ${uiTokens.radius.lg};
    padding: 6px 12px;
    background: ${uiTokens.surface.overlay};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.body} ${uiTokens.type.sans};
    cursor: pointer;
  }
  ${partSelector(image, "dialog")} {
    border: 0;
    padding: 40px;
    max-width: 100vw;
    max-height: 100dvh;
    width: 100vw;
    height: 100dvh;
    box-sizing: border-box;
    background: transparent;
    color: ${uiTokens.inverse.ink};
    margin: 0;
  }
  ${partSelector(image, "dialog")}[open] {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  ${partSelector(image, "dialog")}::backdrop {
    background: ${uiTokens.surface.scrim};
  }
  ${partSelector(image, "image")} {
    max-width: min(100%, 1600px);
    max-height: calc(100dvh - 140px);
    object-fit: contain;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.raised};
    box-shadow: ${uiTokens.shadow.float};
  }
  ${partSelector(image, "caption")} {
    font: ${uiTokens.type.body} / ${uiTokens.type.line.body} ${uiTokens.type.sans};
    text-align: center;
  }
  ${partSelector(image, "close")} {
    position: absolute;
    right: 20px;
    top: 20px;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid ${uiTokens.line.divider};
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.surface.raised};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.pageTitle} / 1 ${uiTokens.type.sans};
    cursor: pointer;
  }
  ${partSelector(image, "close")}:focus-visible, ${partSelector(image, "trigger")}:focus-visible {
    ${focusRing()}
  }
`;
