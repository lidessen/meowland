import { css, parts } from "meowcss/meowjsx";

import { uiTokens } from "../tokens";

import type { ChatAttachments } from "../../chat/attachments";
import type { ImageLightbox } from "../../components/image-lightbox";
import type { ImagePreview } from "../../components/image-preview";
const chatAttachmentsPartRefs = parts<typeof ChatAttachments>("chat-attachments");
const imageLightboxPartRefs = parts<typeof ImageLightbox>("image-lightbox");
const imagePreviewPartRefs = parts<typeof ImagePreview>("image-preview");
export const imagePreviewStyles = css`
  ${imagePreviewPartRefs.root} {
    position: relative;
    display: grid;
    place-items: center;
    width: 100%;
    height: 180px;
    min-width: 0;
    overflow: hidden;
    border-radius: ${uiTokens.radius.lg};
    /* A recessed frame, so loading, failure and letterboxing read as one
       bounded media slot instead of loose text on the page. */
    background: ${uiTokens.surface.fill};
  }
  ${imagePreviewPartRefs.root}[data-image-state="failed"] {
    box-shadow: inset 0 0 0 ${uiTokens.line.width} ${uiTokens.line.edge};
  }
  ${imagePreviewPartRefs.image} {
    width: 100%;
    height: 100%;
    min-height: 0;
    object-fit: contain;
    opacity: 0;
  }
  ${imagePreviewPartRefs.root}[data-image-state="ready"] > ${imagePreviewPartRefs.image} {
    opacity: 1;
  }
  ${imagePreviewPartRefs.image}[hidden], ${imagePreviewPartRefs.status}[hidden] {
    display: none;
  }
  ${imagePreviewPartRefs.status} {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    color: ${uiTokens.ink.tertiary};
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
  }
  ${chatAttachmentsPartRefs.preview} > ${imagePreviewPartRefs.root} {
    width: 220px;
    max-width: 100%;
    height: 180px;
    border-radius: 0;
    background: transparent;
  }
  ${imagePreviewPartRefs.status} > svg {
    flex: none;
    animation: image-preview-spin ${uiTokens.motion.loop} linear infinite;
  }
  @keyframes image-preview-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${imagePreviewPartRefs.status} > svg {
      animation: none;
    }
  }
  ${imageLightboxPartRefs.image} > ${imagePreviewPartRefs.root} {
    width: min(1600px, calc(100vw - 80px));
    height: calc(100dvh - 140px);
    background: transparent;
  }
`;
