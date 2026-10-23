import { css, partSelector } from "meowcss/meowjsx";
import { windowTitleBarContract } from "../../components/window-title-bar";
import { uiTokens } from "../tokens";

const bar = (part: (typeof windowTitleBarContract.parts)[number]) =>
  partSelector(windowTitleBarContract, part);

// Controls inside the bar must not start a window drag.
const controls = `${bar("root")} :is(button, a[href], input, select, textarea, label, summary, [role="button"], [role="tab"], [role="menuitem"], [contenteditable])`;

/**
 * The bar's room comes from the desktop shell: `--mygo-titlebar-height` and the left/right insets
 * clear the native window controls. Without a shell the fallbacks give a plain 32px bar. In
 * full screen the shell reports 0px and the bar collapses.
 */
export const windowTitleBarStyles = css`
  ${bar("root")} {
    --app-region: drag;
    display: flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    height: var(--mygo-titlebar-height, 32px);
    padding-inline: calc(var(--mygo-titlebar-inset-left, 0px) + 8px)
      calc(var(--mygo-titlebar-inset-right, 0px) + 8px);
    overflow: hidden;
    /* An inset hairline instead of a border, so a 0px bar (full screen) leaves nothing behind. */
    box-shadow: inset 0 calc(-1 * ${uiTokens.line.width}) 0 ${uiTokens.line.divider};
    background: ${uiTokens.surface.canvas};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
    user-select: none;
    -webkit-user-select: none;
    cursor: default;
  }
  ${controls} {
    --app-region: no-drag;
  }
  /* Equal side slots keep the title centred; a slot never shrinks below its controls. */
  ${bar("leading")}, ${bar("trailing")} {
    display: flex;
    flex: 1 1 0;
    align-items: center;
    gap: 4px;
    min-width: max-content;
  }
  ${bar("trailing")} {
    justify-content: flex-end;
  }
  ${bar("title")} {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    color: ${uiTokens.ink.secondary};
    font-weight: ${uiTokens.type.weight.medium};
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
