import { css, partSelector } from "meowcss/meowjsx";
import { chatTokens, uiTokens } from "../tokens";
import { chatAttachmentsContract } from "../../chat/attachments";
import { chatComposerContract } from "../../chat/composer";

export const chatAttachmentsStyles = css`
  /* Inherit the host's chat palette; do not reset it at the attachment root. */

  ${partSelector(chatAttachmentsContract, "root")} {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px;
    margin-top: ${uiTokens.spaceSection};
  }

  ${partSelector(chatAttachmentsContract, "image")} {
    display: block;
    width: fit-content;
    max-width: min(220px, 100%);
    overflow: hidden;
    border: 0.5px solid ${uiTokens.borderSoft};
    border-radius: ${uiTokens.messageRadius};
    min-width: 44px;
    min-height: 44px;
    background: ${uiTokens.hover};
    padding: 0;
    cursor: zoom-in;
  }

  ${partSelector(chatAttachmentsContract, "preview")} {
    display: block;
    width: auto;
    height: auto;
    max-width: min(220px, 100%);
    max-height: 220px;
    object-fit: contain;
  }

  ${partSelector(chatAttachmentsContract, "file")} {
    display: inline-flex;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    width: 240px;
    min-height: 64px;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border: 0.5px solid ${uiTokens.borderSoft};
    border-radius: ${uiTokens.messageRadius};
    background: ${chatTokens.composerSurface};
    color: ${uiTokens.foreground};
    text-decoration: none;
  }

  ${partSelector(chatAttachmentsContract, "file")}:hover {
    color: ${uiTokens.foreground};
  }

  ${partSelector(chatAttachmentsContract, "icon")} {
    display: grid;
    width: 28px;
    height: 28px;
    flex: 0 0 auto;
    place-items: center;
    border-radius: ${uiTokens.controlRadius};
    background: transparent;
    color: ${uiTokens.info};
    font-size: ${uiTokens.fontCaption};
  }

  ${partSelector(chatAttachmentsContract, "details")} {
    display: grid;
    flex: 1;
    min-width: 0;
    gap: 0;
  }

  ${partSelector(chatAttachmentsContract, "size")} {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ${partSelector(chatAttachmentsContract, "name")} {
    max-width: 190px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: ${uiTokens.fontBody};
    font-weight: 500;
    line-height: 22px;
  }

  ${partSelector(chatAttachmentsContract, "size")} {
    color: ${uiTokens.subtleForeground};
    font-size: ${uiTokens.fontCaption};
    line-height: 15px;
  }
  ${partSelector(chatAttachmentsContract, "entry")} {
    position: relative;
    display: flex;
    min-width: 0;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    max-width: 100%;
  }
  ${partSelector(chatAttachmentsContract, "remove")} {
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
    background: ${uiTokens.foreground};
    color: ${uiTokens.background};
    opacity: 0;
    transition: opacity ${uiTokens.durationResponse} ${uiTokens.ease};
    cursor: pointer;
  }
  ${partSelector(chatAttachmentsContract, "entry")}:hover ${partSelector(chatAttachmentsContract, "remove")},
  ${partSelector(chatAttachmentsContract, "entry")}:focus-within ${partSelector(chatAttachmentsContract, "remove")} {
    opacity: 1;
  }
  ${partSelector(chatAttachmentsContract, "entry")}:has(${partSelector(chatAttachmentsContract, "remove")}):is(:hover, :focus-within) ${partSelector(chatAttachmentsContract, "name")} {
    padding-right: 18px;
  }
  ${partSelector(chatAttachmentsContract, "remove")} svg {
    width: ${uiTokens.iconSize};
    height: ${uiTokens.iconSize};
  }
  ${partSelector(chatAttachmentsContract, "entry")}[data-kind="image"] ${partSelector(chatAttachmentsContract, "remove")} {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.foreground};
    color: ${uiTokens.background};
    box-shadow: ${uiTokens.shadowControl};
  }
  ${partSelector(chatAttachmentsContract, "remove")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  @media (hover: hover) {
    ${partSelector(chatAttachmentsContract, "remove")}:hover {
      background: ${uiTokens.surfaceMuted};
      color: ${uiTokens.foreground};
    }
  }
  ${partSelector(chatAttachmentsContract, "previewButton")} {
    flex: 0 0 auto;
    border: 0;
    background: transparent;
    color: ${uiTokens.primary};
    padding: 0 ${uiTokens.controlPaddingInline};
    border-radius: ${uiTokens.controlRadius};
    font: inherit;
    font-size: ${uiTokens.fontCaption};
    cursor: pointer;
    min-height: ${uiTokens.controlHeight};
    transition:
      background-color ${uiTokens.durationResponse} ${uiTokens.ease},
      box-shadow ${uiTokens.durationSettle} ${uiTokens.ease};
  }
  @media (hover: hover) {
    ${partSelector(chatAttachmentsContract, "previewButton")}:hover:not(:disabled) {
      background: ${uiTokens.surfaceMuted};
    }
  }
  ${partSelector(chatAttachmentsContract, "previewButton")}:active:not(:disabled) {
    background: ${uiTokens.surfaceMuted};
    box-shadow: inset 0 1px 2px rgb(0 0 0 / 12%);
    transition-duration: 40ms;
  }
  ${partSelector(chatAttachmentsContract, "previewButton")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  ${partSelector(chatAttachmentsContract, "root")} {
    font-family: ${uiTokens.font};
  }
  ${partSelector(chatAttachmentsContract, "file")} {
    transition:
      border-color ${uiTokens.durationResponse} ${uiTokens.ease},
      background-color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${partSelector(chatAttachmentsContract, "file")}:hover {
    background: ${chatTokens.composerSurface};
  }
  ${partSelector(chatAttachmentsContract, "image")}:focus-visible,
  ${partSelector(chatAttachmentsContract, "file")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 3px;
  }
  ${partSelector(chatAttachmentsContract, "icon")} svg {
    width: 28px;
    height: 28px;
  }
  @media (pointer: coarse) {
    ${partSelector(chatAttachmentsContract, "remove")},
    ${partSelector(chatAttachmentsContract, "entry")}[data-kind="image"] ${partSelector(chatAttachmentsContract, "remove")} {
      min-height: 44px;
      min-width: 44px;
      opacity: 1;
    }
    ${partSelector(chatAttachmentsContract, "file")},
    ${partSelector(chatAttachmentsContract, "previewButton")} {
      min-height: 44px;
      min-width: 44px;
      box-sizing: border-box;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(chatAttachmentsContract, "remove")},
    ${partSelector(chatAttachmentsContract, "file")},
    ${partSelector(chatAttachmentsContract, "previewButton")} {
      transition: none;
    }
  }
  /* Composer thumbnails form a rail; sent-message media retains its natural preview. */
  ${partSelector(chatComposerContract, "attachments")} ${partSelector(chatAttachmentsContract, "root")} {
    margin-top: 0;
    flex-wrap: nowrap;
    gap: 10px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  ${partSelector(chatComposerContract, "attachments")} ${partSelector(chatAttachmentsContract, "root")}::-webkit-scrollbar {
    display: none;
  }
  ${partSelector(chatComposerContract, "attachments")} ${partSelector(chatAttachmentsContract, "entry")} {
    flex: none;
  }
  ${partSelector(chatComposerContract, "attachments")} ${partSelector(chatAttachmentsContract, "file")} {
    border-radius: ${uiTokens.radiusLarge};
  }
  ${partSelector(chatComposerContract, "attachments")} ${partSelector(chatAttachmentsContract, "image")},
  ${partSelector(chatComposerContract, "attachments")} ${partSelector(chatAttachmentsContract, "preview")} {
    width: 64px;
    height: 64px;
    max-width: 64px;
    max-height: 64px;
    object-fit: cover;
  }
`;
