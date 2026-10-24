import { css, parts } from "meowcss/meowjsx";

import { uiTokens } from "../tokens";
import type { Menu } from "../../components/menu";
const menuPartRefs = parts<typeof Menu>("menu");
export const menuStyles = css`
  ${menuPartRefs.branch} {
    min-width: 0;
  }
  ${menuPartRefs.root} {
    min-width: 144px;
    max-width: min(360px, 100%);
    font: ${uiTokens.type.body} / ${uiTokens.type.line.bodyCompact} ${uiTokens.type.sans};
    color: ${uiTokens.ink.primary};
  }
  ${menuPartRefs.item} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    width: 100%;
    min-height: 32px;
    padding: 6px 10px;
    border: 0;
    /* Concentric with the panel: card radius minus the panel's 6px inset. */
    border-radius: ${uiTokens.radius.md};
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${menuPartRefs.item}:is(:hover, :focus-visible):not(:disabled) {
    background: ${uiTokens.state.hover};
    outline: none;
  }
  ${menuPartRefs.item}:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  ${menuPartRefs.item}[data-danger="true"] {
    color: ${uiTokens.status.danger};
  }
  ${menuPartRefs.item}[data-danger="true"]:is(:hover, :focus-visible):not(:disabled) {
    background: color-mix(in srgb, ${uiTokens.status.danger} 10%, transparent);
  }
  ${menuPartRefs.label} {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${menuPartRefs.icon} {
    display: flex;
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
    flex: none;
    color: ${uiTokens.ink.secondary};
  }
  ${menuPartRefs.icon} svg {
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
  }
  ${menuPartRefs.shortcut} {
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.micro};
    line-height: ${uiTokens.type.line.micro};
    white-space: nowrap;
  }
  ${menuPartRefs.heading} {
    padding: 8px 10px 4px;
    font-size: ${uiTokens.type.micro};
    font-weight: ${uiTokens.type.weight.medium};
    line-height: ${uiTokens.type.line.micro};
    letter-spacing: ${uiTokens.type.trackingCaps};
    text-transform: uppercase;
    color: ${uiTokens.ink.tertiary};
  }
  /* Separators run to the panel edges, so groups read as bands. */
  ${menuPartRefs.separator} {
    height: 0.5px;
    background: ${uiTokens.line.divider};
    margin: 4px -6px;
  }
  @media (prefers-reduced-motion: reduce) {
    ${menuPartRefs.item} {
      transition: none;
    }
  }
`;
