import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { ChatStatus } from "../../chat/status";
import { chatStatusOptions } from "../../chat/status.options";
const chatStatusPartRefs = parts<typeof ChatStatus>("chat-status");
/* ChatStatus is the state badge (shared/state-badge.styles.ts); its own dot takes the badge's ink. */
export const chatStatusStyles = css`
  ${chatStatusPartRefs.dot} {
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
  ${chatStatusPartRefs.root}[${chatStatusOptions.attribute("tone")}="busy"] ${chatStatusPartRefs.dot} {
    animation: meowui-pulse ${uiTokens.motion.loop} infinite ${uiTokens.motion.ease};
  }
  @keyframes meowui-pulse {
    50% {
      opacity: 0.45;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${chatStatusPartRefs.dot} {
      animation: none;
    }
  }
`;
