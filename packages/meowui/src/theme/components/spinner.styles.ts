import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { spinnerContract } from "../../components/spinner";

export const spinnerStyles = css`
  ${partSelector(spinnerContract, "root")} {
    display: inline-flex;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    color: ${uiTokens.mutedForeground};
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontCaption};
  }
  ${partSelector(spinnerContract, "icon")} {
    display: inline-flex;
    animation: ui-spinner-turn 1s linear infinite;
  }
  @keyframes ui-spinner-turn {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(spinnerContract, "icon")} {
      animation: none;
    }
  }
`;
