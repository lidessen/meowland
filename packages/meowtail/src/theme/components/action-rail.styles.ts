import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { actionRailContract } from "../../components/action-rail";
import { buttonContract } from "../../components/button";

export const actionRailStyles = css`
  ${partSelector(actionRailContract, "root")} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
  }
  ${partSelector(actionRailContract, "leading")} {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 0 1 auto;
    flex-wrap: wrap;
    min-width: min-content;
  }
  ${partSelector(actionRailContract, "trailing")} {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1 1 auto;
    flex-wrap: wrap;
    gap: 6px;
    min-width: min-content;
  }
  :is(${partSelector(actionRailContract, "leading")}, ${partSelector(actionRailContract, "trailing")}) > ${partSelector(buttonContract, "root")} {
    min-width: 0;
    max-width: 100%;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  ${partSelector(actionRailContract, "submit")} {
    display: flex;
    align-items: center;
    flex: none;
  }

  @media (pointer: coarse) {
    ${partSelector(actionRailContract, "root")} button {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
