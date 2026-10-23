import { css, partSelector } from "meowcss/meowjsx";
import { contextMenuContract } from "../../components/context-menu";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";

export const contextMenuStyles = css`
  ${partSelector(contextMenuContract, "root")} {
    min-width: 0;
    cursor: context-menu;
  }
  ${partSelector(contextMenuContract, "root")}:focus-visible {
    ${focusRing()}
    border-radius: ${uiTokens.radius.lg};
  }
`;
