import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { Separator } from "../../components/separator";
const separatorPartRefs = parts<typeof Separator>("separator");
export const separatorStyles = css`
  ${separatorPartRefs.root} {
    height: 1px;
    border: 0;
    background: ${uiTokens.line.edge};
  }
  :where(${separatorPartRefs.root}[aria-orientation="vertical"]) {
    width: 1px;
    height: auto;
    align-self: stretch;
  }
`;
