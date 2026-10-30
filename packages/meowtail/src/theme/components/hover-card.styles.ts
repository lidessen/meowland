import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { HoverCard } from "../../components/hover-card";
import type { Popover } from "../../components/popover";
import { ui } from "../utilities";
const hoverCardPartRefs = parts<typeof HoverCard>("hover-card");
const popoverPartRefs = parts<typeof Popover>("popover");
export const hoverCardStyles = css`
  ${hoverCardPartRefs.root} {
    display: block;
    min-width: 0;
  }
  ${popoverPartRefs.panel}:has(> ${hoverCardPartRefs.content}) {
    padding: 0;
    width: 244px;
    background: ${uiTokens.inverse.surface};
    color: ${uiTokens.inverse.ink};
    backdrop-filter: none;
  }
  ${popoverPartRefs.panel}:has(> ${hoverCardPartRefs.content}[data-variant="preview"]) {
    background: ${uiTokens.surface.overlay};
    color: ${uiTokens.ink.primary};
  }
  ${hoverCardPartRefs.content} {
    position: relative;
    padding: 12px 16px;
    max-height: 420px;
    overflow: auto;
    overflow-wrap: anywhere;
  }
  ${hoverCardPartRefs.content}[data-variant="preview"] {
    max-height: min(420px, calc(100dvh - 32px));
  }
  ${hoverCardPartRefs.content}[role="button"] {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 12px;
    align-items: start;
    cursor: pointer;
  }
  ${hoverCardPartRefs.body} {
    min-width: 0;
  }
  /* The copy cue sits on the first line; it fades the card's own ink so it reads on either surface. */
  ${hoverCardPartRefs.hint} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: ${uiTokens.type.line.body};
    white-space: nowrap;
    color: color-mix(in srgb, currentColor 60%, transparent);
    font: ${uiTokens.type.weight.medium} ${uiTokens.type.caption} / ${uiTokens.type.line.caption}
      ${uiTokens.type.sans};
  }
  ${hoverCardPartRefs.hint} svg {
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
  }
  ${hoverCardPartRefs.content}[role="button"]:hover ${hoverCardPartRefs.hint} {
    color: inherit;
  }
  ${hoverCardPartRefs.content} a {
    color: inherit;
    text-underline-offset: 3px;
  }
  ${hoverCardPartRefs.content}:focus-visible {
    ${ui.focus.inset}
    border-radius: ${uiTokens.radius.md};
  }
  ${hoverCardPartRefs.feedback} {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 8px;
    border-radius: inherit;
    background: ${uiTokens.inverse.surface};
    pointer-events: none;
    color: ${uiTokens.inverse.ink};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.bodyCompact} ${uiTokens.type.sans};
  }
  ${hoverCardPartRefs.feedback}:empty {
    display: none;
  }
`;
