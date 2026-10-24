import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { Popover } from "../../components/popover";
import type { Tooltip } from "../../components/tooltip";
const popoverPartRefs = parts<typeof Popover>("popover");
const tooltipPartRefs = parts<typeof Tooltip>("tooltip");
export const tooltipStyles = css`
  ${tooltipPartRefs.root} {
    display: inline-block;
    max-width: 100%;
  }
  ${tooltipPartRefs.root} > ${popoverPartRefs.root} > ${popoverPartRefs.panel} {
    padding: 4px 8px;
    width: max-content;
    max-width: min(50vw, calc(100vw - 16px));
    border-radius: ${uiTokens.radius.md};
    background: ${uiTokens.inverse.surface};
    color: ${uiTokens.inverse.ink};
    box-shadow: none;
    backdrop-filter: none;
    font: ${uiTokens.type.label} / ${uiTokens.type.line.label} ${uiTokens.type.sans};
  }
  ${tooltipPartRefs.content} {
    display: block;
    max-width: 30ch;
    overflow-wrap: anywhere;
  }
`;
