import { layerTokens } from "../palette";
import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { imageLightboxContract as image } from "../../components/image-lightbox";

export const imageLightboxStyles = css`
  ${partSelector(image, "trigger")} {
    border: 1px solid ${uiTokens.border};
    border-radius: ${uiTokens.controlRadius};
    padding: 6px 12px;
    background: ${uiTokens.surface};
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/22px ${uiTokens.font};
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
    color: white;
    margin: 0;
  }
  ${partSelector(image, "dialog")}[open] {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  ${partSelector(image, "dialog")}::backdrop {
    background: ${uiTokens.backdrop};
  }
  ${partSelector(image, "image")} {
    max-width: min(100%, 1600px);
    max-height: calc(100dvh - 140px);
    object-fit: contain;
    border-radius: ${uiTokens.radiusLarge};
    background: ${layerTokens.raised};
    box-shadow: ${uiTokens.shadowPanel};
  }
  ${partSelector(image, "caption")} {
    font: ${uiTokens.fontBody}/22px ${uiTokens.font};
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
    border: 1px solid ${uiTokens.borderSoft};
    border-radius: 50%;
    corner-shape: round;
    background: ${layerTokens.raised};
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontPageTitle}/1 ${uiTokens.font};
    cursor: pointer;
  }
  ${partSelector(image, "close")}:focus-visible, ${partSelector(image, "trigger")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
`;
