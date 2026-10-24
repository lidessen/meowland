import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { ShortcutKeys } from "../../components/shortcut-keys";
const shortcutKeysPartRefs = parts<typeof ShortcutKeys>("shortcut-keys");
export const shortcutKeysStyles = css`
  ${shortcutKeysPartRefs.root} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: ${uiTokens.ink.tertiary};
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.micro} ${uiTokens.type.sans};
    white-space: nowrap;
    flex: none;
  }
  ${shortcutKeysPartRefs.key} {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font: inherit;
  }
  ${shortcutKeysPartRefs.root}[data-variant="tooltip"] {
    color: inherit;
    font-size: ${uiTokens.type.micro};
    line-height: ${uiTokens.type.line.micro};
    gap: 2px;
  }
  ${shortcutKeysPartRefs.root}[data-variant="tooltip"] ${shortcutKeysPartRefs.key}:not([data-separator]) {
    min-width: 16px;
    height: 16px;
    padding: 0 2px;
    border-radius: ${uiTokens.radius.xs};
    /* The key carries its own inverse ink so it stays legible outside a tooltip. */
    color: ${uiTokens.inverse.ink};
    background: color-mix(in srgb, ${uiTokens.inverse.surface}, ${uiTokens.inverse.ink} 18%);
  }
`;
