import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { iconButtonContract } from "../../components/icon-button";
import { toolbarContract } from "../../components/toolbar";

export const toolbarStyles = css`
  ${partSelector(toolbarContract, "root")} {
    display: flex;
    flex-wrap: wrap;
    min-width: 0;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
  }

  :where(${partSelector(toolbarContract, "root")}[aria-orientation="vertical"]) {
    flex-direction: column;
    align-items: stretch;
  }

  :where(${partSelector(toolbarContract, "root")} > ${partSelector(iconButtonContract, "root")}) {
    flex: 0 0 auto;
  }
`;
