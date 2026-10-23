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
    margin-top: ${uiTokens.space.section};
  }

  ${partSelector(chatAttachmentsContract, "image")} {
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
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${chatTokens.bubbleRadius};
    /* An object in the conversation: a raised card, not a fill. */
    background: ${uiTokens.surface.raised};
    color: ${uiTokens.ink.primary};
    text-decoration: none;
  }

  ${partSelector(chatAttachmentsContract, "file")}:hover {
    color: ${uiTokens.ink.primary};
  }

  ${partSelector(chatAttachmentsContract, "icon")} {
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
    font-size: ${uiTokens.type.body};
    font-weight: 500;
    line-height: 22px;
  }

  ${partSelector(chatAttachmentsContract, "size")} {
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    line-height: 15px;
  }
  ${partSelector(chatAttachmentsContract, "entry")} {
    position: relative;
    display: flex;
    min-width: 0;
    align-items: center;
    gap: ${uiTokens.space.group};
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
    background: ${uiTokens.ink.primary};
    color: ${uiTokens.action.onPrimary};
    opacity: 0;
    transition: opacity ${uiTokens.motion.response} ${uiTokens.motion.ease};
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
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
  }
  ${partSelector(chatAttachmentsContract, "entry")}[data-kind="image"] ${partSelector(chatAttachmentsContract, "remove")} {
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
  ${partSelector(chatAttachmentsContract, "remove")}:focus-visible {
    outline: 2px solid ${uiTokens.state.focus};
    outline-offset: 2px;
  }
  @media (hover: hover) {
    ${partSelector(chatAttachmentsContract, "remove")}:hover {
      background: ${uiTokens.state.hover};
      color: ${uiTokens.ink.primary};
    }
  }
  ${partSelector(chatAttachmentsContract, "previewButton")} {
    flex: 0 0 auto;
    border: 0;
    background: transparent;
    color: ${uiTokens.action.primary};
    padding: 0 ${uiTokens.control.inset};
    border-radius: ${uiTokens.radius.lg};
    font: inherit;
    font-size: ${uiTokens.type.caption};
    cursor: pointer;
    min-height: ${uiTokens.control.regular};
    transition:
      background-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      box-shadow ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  @media (hover: hover) {
    ${partSelector(chatAttachmentsContract, "previewButton")}:hover:not(:disabled) {
      background: ${uiTokens.state.hover};
    }
  }
  ${partSelector(chatAttachmentsContract, "previewButton")}:active:not(:disabled) {
    background: ${uiTokens.state.active};
    box-shadow: ${uiTokens.shadow.pressed};
    transition-duration: ${uiTokens.motion.instant};
  }
  ${partSelector(chatAttachmentsContract, "previewButton")}:focus-visible {
    outline: 2px solid ${uiTokens.state.focus};
    outline-offset: 2px;
  }
  ${partSelector(chatAttachmentsContract, "root")} {
    font-family: ${uiTokens.type.sans};
  }
  ${partSelector(chatAttachmentsContract, "file")} {
    transition:
      border-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      background-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${partSelector(chatAttachmentsContract, "file")}:hover {
    /* The hover overlay sits on the raised card instead of replacing it. */
    background-image: linear-gradient(${uiTokens.state.hover}, ${uiTokens.state.hover});
  }
  ${partSelector(chatAttachmentsContract, "image")}:focus-visible,
  ${partSelector(chatAttachmentsContract, "file")}:focus-visible {
    outline: 2px solid ${uiTokens.state.focus};
    outline-offset: 2px;
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
    border-radius: ${uiTokens.radius.xl};
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
