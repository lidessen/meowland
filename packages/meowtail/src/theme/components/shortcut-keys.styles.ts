import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { radiusTokens } from "../palette";
import { shortcutKeysContract } from "../../components/shortcut-keys";

export const shortcutKeysStyles = css`
  ${partSelector(shortcutKeysContract, "root")} {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    color: ${uiTokens.subtleForeground};
    font: ${uiTokens.fontCaption}/16px ${uiTokens.font};
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
    font-size: ${uiTokens.fontMicro};
    line-height: 14px;
    gap: 2px;
  }
  ${partSelector(shortcutKeysContract, "root")}[data-variant="tooltip"] ${partSelector(shortcutKeysContract, "key")}:not([data-separator]) {
    min-width: 16px;
    height: 16px;
    padding: 0 2px;
    border-radius: ${radiusTokens.mark};
    background: color-mix(in srgb, ${uiTokens.tooltipSurface}, white 18%);
  }
`;
