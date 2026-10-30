import { css, parts } from "meowcss/meowjsx";
import { chatTokens, uiTokens } from "../tokens";
import type { ChatAttachments } from "../../chat/attachments";
import type { ChatComposer } from "../../chat/composer";
import type { ImagePreview } from "../../components/image-preview";
import { ui } from "../utilities";
const chatAttachmentsPartRefs = parts<typeof ChatAttachments>("chat-attachments");
const chatComposerPartRefs = parts<typeof ChatComposer>("chat-composer");
const imagePreviewPartRefs = parts<typeof ImagePreview>("image-preview");
export const chatAttachmentsStyles = css`
  /* Inherit the host's chat palette; do not reset it at the attachment root. */

  ${chatAttachmentsPartRefs.root} {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px;
    margin-top: ${uiTokens.space.section};
  }

  ${chatAttachmentsPartRefs.image} {
    display: block;
    width: fit-content;
    max-width: min(220px, 100%);
    overflow: hidden;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${chatTokens.bubbleRadius};
    min-width: 44px;
    min-height: 44px;
    background: ${uiTokens.state.hover};
    padding: 0;
    cursor: zoom-in;
  }

  ${chatAttachmentsPartRefs.preview} {
    display: block;
    width: auto;
    height: auto;
    max-width: min(220px, 100%);
    max-height: 220px;
    object-fit: contain;
  }

  ${chatAttachmentsPartRefs.file} {
    display: inline-flex;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    width: 240px;
    min-height: 64px;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${chatTokens.bubbleRadius};
    /* An object in the conversation: a raised card, not a fill. */
    background: ${uiTokens.surface.raised};
    color: ${uiTokens.ink.primary};
    text-decoration: none;
  }

  ${chatAttachmentsPartRefs.file}:hover {
    color: ${uiTokens.ink.primary};
  }

  ${chatAttachmentsPartRefs.icon} {
    display: grid;
    width: 28px;
    height: 28px;
    flex: 0 0 auto;
    place-items: center;
    border-radius: ${uiTokens.radius.lg};
    background: transparent;
    color: ${uiTokens.status.info};
    font-size: ${uiTokens.type.caption};
  }

  ${chatAttachmentsPartRefs.details} {
    display: grid;
    flex: 1;
    min-width: 0;
    gap: 0;
  }

  ${chatAttachmentsPartRefs.size} {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ${chatAttachmentsPartRefs.name} {
    max-width: 190px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: ${uiTokens.type.body};
    font-weight: ${uiTokens.type.weight.medium};
    line-height: ${uiTokens.type.line.body};
  }

  ${chatAttachmentsPartRefs.size} {
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
  }
  ${chatAttachmentsPartRefs.entry} {
    position: relative;
    display: flex;
    min-width: 0;
    align-items: center;
    gap: ${uiTokens.space.group};
    max-width: 100%;
  }
  ${chatAttachmentsPartRefs.remove} {
    position: absolute;
    top: 6px;
    right: 6px;
    display: grid;
    place-items: center;
    flex: none;
    width: 18px;
    height: 18px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.ink.primary};
    color: ${uiTokens.action.onPrimary};
    opacity: 0;
    transition: opacity ${uiTokens.motion.response} ${uiTokens.motion.ease};
    cursor: pointer;
  }
  ${chatAttachmentsPartRefs.entry}:hover ${chatAttachmentsPartRefs.remove},
  ${chatAttachmentsPartRefs.entry}:focus-within ${chatAttachmentsPartRefs.remove} {
    opacity: 1;
  }
  ${chatAttachmentsPartRefs.entry}:has(${chatAttachmentsPartRefs.remove}):is(:hover, :focus-within) ${chatAttachmentsPartRefs.name} {
    padding-right: 18px;
  }
  ${chatAttachmentsPartRefs.remove} svg {
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
  }
  ${chatAttachmentsPartRefs.entry}[data-kind="image"] ${chatAttachmentsPartRefs.remove} {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.ink.primary};
    color: ${uiTokens.action.onPrimary};
    box-shadow: none;
  }
  ${chatAttachmentsPartRefs.remove}:focus-visible {
    ${ui.focus.ring}
  }
  @media (hover: hover) {
    ${chatAttachmentsPartRefs.remove}:hover {
      background: ${uiTokens.state.hover};
      color: ${uiTokens.ink.primary};
    }
  }
  /* A file with a preview reads as one split control: the card opens or downloads, its joined
  end segment previews. */
  ${chatAttachmentsPartRefs.entry}:has(> ${chatAttachmentsPartRefs.previewButton}) {
    align-items: stretch;
    gap: 0;
  }
  ${chatAttachmentsPartRefs.file}:has(+ ${chatAttachmentsPartRefs.previewButton}) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
  ${chatAttachmentsPartRefs.previewButton} {
    flex: 0 0 auto;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-inline-start: 0;
    background: ${uiTokens.surface.raised};
    color: ${uiTokens.ink.secondary};
    padding: 0 ${uiTokens.control.inset};
    border-radius: 0 ${chatTokens.bubbleRadius} ${chatTokens.bubbleRadius} 0;
    font: inherit;
    font-size: ${uiTokens.type.caption};
    cursor: pointer;
    min-height: ${uiTokens.control.regular};
    transition:
      background-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      box-shadow ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  @media (hover: hover) {
    ${chatAttachmentsPartRefs.previewButton}:hover:not(:disabled) {
      background-image: linear-gradient(${uiTokens.state.hover}, ${uiTokens.state.hover});
      color: ${uiTokens.ink.primary};
    }
  }
  ${chatAttachmentsPartRefs.previewButton}:active:not(:disabled) {
    background-image: linear-gradient(${uiTokens.state.active}, ${uiTokens.state.active});
    box-shadow: ${uiTokens.shadow.pressed};
    transition-duration: ${uiTokens.motion.instant};
  }
  ${chatAttachmentsPartRefs.previewButton}:focus-visible {
    ${ui.focus.ring}
  }
  ${chatAttachmentsPartRefs.root} {
    font-family: ${uiTokens.type.sans};
  }
  ${chatAttachmentsPartRefs.file} {
    transition:
      border-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      background-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${chatAttachmentsPartRefs.file}:hover {
    /* The hover overlay sits on the raised card instead of replacing it. */
    background-image: linear-gradient(${uiTokens.state.hover}, ${uiTokens.state.hover});
  }
  ${chatAttachmentsPartRefs.image}:focus-visible,
  ${chatAttachmentsPartRefs.file}:focus-visible {
    ${ui.focus.ring}
  }
  ${chatAttachmentsPartRefs.icon} svg {
    width: 28px;
    height: 28px;
  }
  @media (pointer: coarse) {
    ${chatAttachmentsPartRefs.remove},
    ${chatAttachmentsPartRefs.entry}[data-kind="image"] ${chatAttachmentsPartRefs.remove} {
      min-height: 44px;
      min-width: 44px;
      opacity: 1;
    }
    ${chatAttachmentsPartRefs.file},
    ${chatAttachmentsPartRefs.previewButton} {
      min-height: 44px;
      min-width: 44px;
      box-sizing: border-box;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${chatAttachmentsPartRefs.remove},
    ${chatAttachmentsPartRefs.file},
    ${chatAttachmentsPartRefs.previewButton} {
      transition: none;
    }
  }
  /* Composer thumbnails form a rail; sent-message media retains its natural preview. */
  ${chatComposerPartRefs.attachments} ${chatAttachmentsPartRefs.root} {
    margin-top: 0;
    flex-wrap: nowrap;
    gap: 10px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  ${chatComposerPartRefs.attachments} ${chatAttachmentsPartRefs.root}::-webkit-scrollbar {
    display: none;
  }
  ${chatComposerPartRefs.attachments} ${chatAttachmentsPartRefs.entry} {
    flex: none;
  }
  ${chatComposerPartRefs.attachments} ${chatAttachmentsPartRefs.file} {
    border-radius: ${uiTokens.radius.xl};
  }
  ${chatComposerPartRefs.attachments} ${chatAttachmentsPartRefs.image},
  ${chatComposerPartRefs.attachments} ${chatAttachmentsPartRefs.preview} {
    width: 64px;
    height: 64px;
    max-width: 64px;
    max-height: 64px;
    object-fit: cover;
  }
  /* The 64px tile is a thumbnail: the preview fills it and crops; the lightbox shows the whole image. */
  ${chatComposerPartRefs.attachments} ${chatAttachmentsPartRefs.preview} > ${imagePreviewPartRefs.root} {
    width: 100%;
    height: 100%;
  }
  ${chatComposerPartRefs.attachments} ${chatAttachmentsPartRefs.preview} > ${imagePreviewPartRefs.root} > ${imagePreviewPartRefs.image} {
    object-fit: cover;
  }
  ${chatComposerPartRefs.attachments} ${chatAttachmentsPartRefs.file}:has(+ ${chatAttachmentsPartRefs.previewButton}) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
  ${chatComposerPartRefs.attachments} ${chatAttachmentsPartRefs.previewButton} {
    border-start-end-radius: ${uiTokens.radius.xl};
    border-end-end-radius: ${uiTokens.radius.xl};
  }
`;
