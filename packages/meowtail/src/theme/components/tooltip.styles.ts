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
    padding: 3px 7px;
    width: max-content;
    max-width: min(50vw, calc(100vw - 16px));
    border-radius: ${uiTokens.radiusSmall};
    background: ${uiTokens.tooltipSurface};
    color: ${uiTokens.toastForeground};
    box-shadow: none;
    backdrop-filter: none;
    font: ${uiTokens.fontLabel}/20px ${uiTokens.font};
  }
  ${partSelector(tooltipContract, "content")} {
    display: block;
    max-width: 30ch;
    overflow-wrap: anywhere;
  }
`;
