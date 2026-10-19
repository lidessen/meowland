import { css, partSelector } from "meowcss/meowjsx";
import { contextMenuContract } from "../../components/context-menu";
import { uiTokens } from "../tokens";

export const contextMenuStyles = css`
  ${partSelector(contextMenuContract, "root")} {
    min-width: 0;
  }
  ${partSelector(contextMenuContract, "root")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
`;
