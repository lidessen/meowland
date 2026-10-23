import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { shortcutKeysContract } from "../../components/shortcut-keys";

export const shortcutKeysStyles = css`
  ${partSelector(shortcutKeysContract, "root")} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: ${uiTokens.ink.tertiary};
    font: ${uiTokens.type.caption}/16px ${uiTokens.type.sans};
    white-space: nowrap;
    flex: none;
  }
  ${partSelector(shortcutKeysContract, "key")} {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font: inherit;
  }
  ${partSelector(shortcutKeysContract, "root")}[data-variant="tooltip"] {
    color: inherit;
    font-size: ${uiTokens.type.micro};
    line-height: 14px;
    gap: 2px;
  }
  ${partSelector(shortcutKeysContract, "root")}[data-variant="tooltip"] ${partSelector(shortcutKeysContract, "key")}:not([data-separator]) {
    min-width: 16px;
    height: 16px;
    padding: 0 2px;
    border-radius: ${uiTokens.radius.xs};
    /* The key carries its own inverse ink so it stays legible outside a tooltip. */
    color: ${uiTokens.inverse.ink};
    background: color-mix(in srgb, ${uiTokens.inverse.surface}, ${uiTokens.inverse.ink} 18%);
  }
`;
