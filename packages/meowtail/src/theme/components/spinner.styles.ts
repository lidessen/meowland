import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { Spinner } from "../../components/spinner";
const spinnerPartRefs = parts<typeof Spinner>("spinner");
export const spinnerStyles = css`
  ${spinnerPartRefs.root} {
    display: inline-flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    color: ${uiTokens.ink.secondary};
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.caption};
  }
  ${spinnerPartRefs.icon} {
    display: inline-flex;
    animation: ui-spinner-turn ${uiTokens.motion.loop} linear infinite;
  }
  @keyframes ui-spinner-turn {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${spinnerPartRefs.icon} {
      animation: none;
    }
  }
`;
