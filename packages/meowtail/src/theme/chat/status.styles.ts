import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { chatStatusContract, chatStatusOptions } from "../../chat/status";

/* ChatStatus is the state badge (shared/state-badge.styles.ts); its own dot takes the badge's ink. */
export const chatStatusStyles = css`
  ${partSelector(chatStatusContract, "dot")} {
    display: block;
    flex: 0 0 auto;
    align-self: flex-start;
    width: 6px;
    height: 6px;
    margin-top: 5px;
    border-radius: 50%;
    corner-shape: round;
    background: currentColor;
  }
  ${partSelector(chatStatusContract, "root")}[${chatStatusOptions.attribute("tone")}="busy"] ${partSelector(chatStatusContract, "dot")} {
    animation: meowui-pulse ${uiTokens.motion.loop} infinite ${uiTokens.motion.ease};
  }
  @keyframes meowui-pulse {
    50% {
      opacity: 0.45;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(chatStatusContract, "dot")} {
      animation: none;
    }
  }
`;
