import { css, partSelector } from "meowcss/meowjsx";
import { imagePreviewContract as preview } from "../../components/image-preview";
import { chatAttachmentsContract as attachments } from "../../chat/attachments";
import { imageLightboxContract as lightbox } from "../../components/image-lightbox";
import { uiTokens } from "../tokens";
import { layerTokens, lineTokens } from "../palette";

export const imagePreviewStyles = css`
  ${partSelector(preview, "root")} {
    position: relative;
    display: grid;
    place-items: center;
    width: 100%;
    height: 180px;
    min-width: 0;
    overflow: hidden;
    border-radius: ${uiTokens.controlRadius};
    /* A recessed frame, so loading, failure and letterboxing read as one
       bounded media slot instead of loose text on the page. */
    background: ${layerTokens.sunken};
  }
  ${partSelector(preview, "root")}[data-image-state="failed"] {
    box-shadow: inset 0 0 0 ${lineTokens.width} ${lineTokens.edge};
  }
  ${partSelector(preview, "image")} {
    width: 100%;
    height: 100%;
    min-height: 0;
    object-fit: contain;
    opacity: 0;
  }
  ${partSelector(preview, "root")}[data-image-state="ready"] > ${partSelector(preview, "image")} {
    opacity: 1;
  }
  ${partSelector(preview, "image")}[hidden], ${partSelector(preview, "status")}[hidden] {
    display: none;
  }
  ${partSelector(preview, "status")} {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    color: ${uiTokens.subtleForeground};
    font: ${uiTokens.fontCaption}/18px ${uiTokens.font};
  }
  ${partSelector(attachments, "preview")} > ${partSelector(preview, "root")} {
    width: 220px;
    max-width: 100%;
    height: 180px;
    border-radius: 0;
    background: transparent;
  }
  ${partSelector(preview, "status")} > svg {
    flex: none;
    animation: image-preview-spin 1s linear infinite;
  }
  @keyframes image-preview-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(preview, "status")} > svg {
      animation: none;
    }
  }
  ${partSelector(lightbox, "image")} > ${partSelector(preview, "root")} {
    width: min(1600px, calc(100vw - 80px));
    height: calc(100dvh - 140px);
    background: transparent;
  }
`;
