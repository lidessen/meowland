import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { ActionRail } from "../../components/action-rail";
import type { Button } from "../../components/button";
const actionRailPartRefs = parts<typeof ActionRail>("action-rail");
const buttonPartRefs = parts<typeof Button>("button");
export const actionRailStyles = css`
  ${actionRailPartRefs.root} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    min-width: 0;
  }
  ${actionRailPartRefs.leading} {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 0 1 auto;
    flex-wrap: wrap;
    min-width: min-content;
  }
  ${actionRailPartRefs.trailing} {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1 1 auto;
    flex-wrap: wrap;
    gap: 6px;
    min-width: min-content;
  }
  :is(${actionRailPartRefs.leading}, ${actionRailPartRefs.trailing}) > ${buttonPartRefs.root} {
    min-width: 0;
    max-width: 100%;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  ${actionRailPartRefs.submit} {
    display: flex;
    align-items: center;
    flex: none;
  }

  @media (pointer: coarse) {
    ${actionRailPartRefs.root} button {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
