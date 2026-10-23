import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { popoverContract } from "../../components/popover";
import { tooltipContract } from "../../components/tooltip";

export const tooltipStyles = css`
  ${partSelector(tooltipContract, "root")} {
    display: inline-block;
    max-width: 100%;
  }
  ${partSelector(tooltipContract, "root")} > ${partSelector(popoverContract, "root")} > ${partSelector(popoverContract, "panel")} {
    padding: 4px 8px;
    width: max-content;
    max-width: min(50vw, calc(100vw - 16px));
    border-radius: ${uiTokens.radius.md};
    background: ${uiTokens.inverse.surface};
    color: ${uiTokens.inverse.ink};
    box-shadow: none;
    backdrop-filter: none;
    font: ${uiTokens.type.label}/20px ${uiTokens.type.sans};
  }
  ${partSelector(tooltipContract, "content")} {
    display: block;
    max-width: 30ch;
    overflow-wrap: anywhere;
  }
`;
