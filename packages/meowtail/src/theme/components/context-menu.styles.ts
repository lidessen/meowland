import { css, parts } from "meowcss/meowjsx";

import { uiTokens } from "../tokens";
import type { ContextMenu } from "../../components/context-menu";
import { ui } from "../utilities";
const contextMenuPartRefs = parts<typeof ContextMenu>("context-menu");
export const contextMenuStyles = css`
  ${contextMenuPartRefs.root} {
    min-width: 0;
    cursor: context-menu;
  }
  ${contextMenuPartRefs.root}:focus-visible {
    ${ui.focus.ring}
    border-radius: ${uiTokens.radius.lg};
  }
`;
