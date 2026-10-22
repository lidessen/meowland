import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { separatorContract } from "../../components/separator";

export const separatorStyles = css`
  ${partSelector(separatorContract, "root")} {
    height: 1px;
    border: 0;
    background: ${uiTokens.line.edge};
  }
  :where(${partSelector(separatorContract, "root")}[aria-orientation="vertical"]) {
    width: 1px;
    height: auto;
    align-self: stretch;
  }
`;
