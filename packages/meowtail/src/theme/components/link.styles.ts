import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { linkContract } from "../../components/link";

export const linkStyles = css`
  ${partSelector(linkContract, "root")} {
    color: ${uiTokens.info};
    font: inherit;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
    overflow-wrap: anywhere;
  }
  ${partSelector(linkContract, "root")}:hover {
    color: ${uiTokens.foreground};
  }
  ${partSelector(linkContract, "root")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;
