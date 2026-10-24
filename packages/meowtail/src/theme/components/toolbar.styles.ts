import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { IconButton } from "../../components/icon-button";
import type { Toolbar } from "../../components/toolbar";
const iconButtonPartRefs = parts<typeof IconButton>("icon-button");
const toolbarPartRefs = parts<typeof Toolbar>("toolbar");
export const toolbarStyles = css`
  ${toolbarPartRefs.root} {
    display: flex;
    flex-wrap: wrap;
    min-width: 0;
    align-items: center;
    gap: ${uiTokens.space.group};
  }

  :where(${toolbarPartRefs.root}[aria-orientation="vertical"]) {
    flex-direction: column;
    align-items: stretch;
  }

  :where(${toolbarPartRefs.root} > ${iconButtonPartRefs.root}) {
    flex: 0 0 auto;
  }

  @media (pointer: coarse) {
    ${toolbarPartRefs.root}[data-meowui-part] button {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
