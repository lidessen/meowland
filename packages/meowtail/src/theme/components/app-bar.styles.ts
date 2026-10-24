import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { AppBar } from "../../components/app-bar";
const appBarPartRefs = parts<typeof AppBar>("app-bar");
export const appBarStyles = css`
  ${appBarPartRefs.root} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    min-width: 0;
    min-height: 56px;
    padding: 10px 16px;
    border-bottom: 1px solid ${uiTokens.line.edge};
    background: ${uiTokens.surface.canvas};
  }
  ${appBarPartRefs.identity} {
    display: grid;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }
  ${appBarPartRefs.title} {
    margin: 0;
    overflow-wrap: anywhere;
    color: ${uiTokens.ink.primary};
    font-size: ${uiTokens.type.title};
    font-weight: ${uiTokens.type.weight.semibold};
    line-height: ${uiTokens.type.line.title};
    letter-spacing: ${uiTokens.type.trackingTight};
  }
  ${appBarPartRefs.status} {
    min-width: 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
  }
  ${appBarPartRefs.actions} {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: none;
  }

  @media (pointer: coarse) {
    ${appBarPartRefs.actions} > * {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
