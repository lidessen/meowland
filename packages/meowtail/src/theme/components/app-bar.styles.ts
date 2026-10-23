import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { appBarContract } from "../../components/app-bar";

export const appBarStyles = css`
  ${partSelector(appBarContract, "root")} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    min-width: 0;
    min-height: 56px;
    padding: 10px 16px;
    border-bottom: 1px solid ${uiTokens.line.edge};
    background: ${uiTokens.surface.canvas};
  }
  ${partSelector(appBarContract, "identity")} {
    display: grid;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }
  ${partSelector(appBarContract, "title")} {
    margin: 0;
    overflow-wrap: anywhere;
    color: ${uiTokens.ink.primary};
    font-size: ${uiTokens.type.title};
    font-weight: ${uiTokens.type.weight.semibold};
    line-height: ${uiTokens.type.line.title};
    letter-spacing: ${uiTokens.type.trackingTight};
  }
  ${partSelector(appBarContract, "status")} {
    min-width: 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
  }
  ${partSelector(appBarContract, "actions")} {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: none;
  }

  @media (pointer: coarse) {
    ${partSelector(appBarContract, "actions")} > * {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
