import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { pageHeaderContract } from "../../components/page-header";

const header = (part: (typeof pageHeaderContract.parts)[number]) =>
  partSelector(pageHeaderContract, part);

export const pageHeaderStyles = css`
  ${header("root")} {
    display: flex;
    /* Page actions sit level with the identity block, not under its last line. */
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: ${uiTokens.spaceSection} ${uiTokens.spacePanel};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
    color: ${uiTokens.foreground};
  }
  ${header("copy")} {
    display: grid;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
  }
  ${header("heading")} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
  }
  ${header("leading")} {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: ${uiTokens.fontPageTitle};
    height: ${uiTokens.fontPageTitle};
    color: ${uiTokens.foreground};
  }
  ${header("leading")} > svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  ${header("title")} {
    margin: 0;
    min-width: 0;
    font-family: ${uiTokens.fontDisplay};
    font-size: ${uiTokens.fontPageTitle};
    font-weight: 600;
    letter-spacing: -0.015em;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  ${header("description")} {
    margin: 0;
    color: ${uiTokens.mutedForeground};
    overflow-wrap: anywhere;
  }
  ${header("actions")} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: ${uiTokens.spaceGroup};
  }

  @media (pointer: coarse) {
    ${header("actions")}[data-meowui-part] > * {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
