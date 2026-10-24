import { css, parts } from "meowcss/meowjsx";

import { uiTokens } from "../tokens";
import type { Pill } from "../../components/pill";
import { ui } from "../utilities";
const pillPartRefs = parts<typeof Pill>("pill");
export const pillStyles = css`
  ${pillPartRefs.root} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 24px;
    box-sizing: border-box;
    padding: 0 8px;
    border: 0;
    border-radius: ${uiTokens.radius.full};
    corner-shape: round;
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
    color: ${uiTokens.ink.secondary};
    background: ${uiTokens.surface.fill};
    white-space: nowrap;
  }
  button${pillPartRefs.root} {
    cursor: pointer;
  }
  button${pillPartRefs.root}:hover:not(:disabled) {
    background: ${uiTokens.state.hover};
  }
  /* An active filter is the current selection, so it takes the accent. */
  ${pillPartRefs.root}[data-active="true"] {
    color: ${uiTokens.accent.ink};
    background: ${uiTokens.accent.selected};
    box-shadow: inset 0 0 0 1px ${uiTokens.accent.line};
  }
  button${pillPartRefs.root}[data-active="true"]:hover:not(:disabled) {
    background: color-mix(in srgb, ${uiTokens.accent.base} 14%, ${uiTokens.accent.soft});
  }
  button${pillPartRefs.root}:focus-visible {
    ${ui.focus.ring}
  }
  button${pillPartRefs.root}:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;
