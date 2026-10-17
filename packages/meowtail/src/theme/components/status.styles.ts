import { css, partSelector } from "meowcss/meowjsx";
import { statusContract } from "../../components/status";
import { statusDotContract } from "../../components/status-dot";
import { uiTokens } from "../tokens";

const root = partSelector(statusContract, "root");
const label = partSelector(statusContract, "label");
const dot = partSelector(statusDotContract, "root");

export const statusStyles = css`
  ${root} {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    gap: ${uiTokens.spaceGroup};
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
  }
  ${root} > ${dot} {
    width: 7px;
    height: 7px;
  }
  ${label} {
    min-width: 0;
    overflow-wrap: anywhere;
  }
`;
