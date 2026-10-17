import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { accentTokens } from "../palette";
import { chatStatusContract, chatStatusOptions } from "../../chat/status";

export const chatStatusStyles = css`
  ${partSelector(chatStatusContract, "root")} {
    display: inline-flex;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
  }

  ${partSelector(chatStatusContract, "dot")} {
    display: block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.subtleForeground};
  }

  ${partSelector(chatStatusContract, "root")} {
    ${chatStatusOptions.when({ tone: "online" })} {
      color: ${uiTokens.success};
    }
  }

  ${partSelector(chatStatusContract, "root")}[${chatStatusOptions.attribute("tone")}="online"] ${partSelector(chatStatusContract, "dot")} {
    background: ${uiTokens.success};
  }

  ${partSelector(chatStatusContract, "root")} {
    ${chatStatusOptions.when({ tone: "busy" })} {
      color: ${accentTokens.base};
    }
  }

  ${partSelector(chatStatusContract, "root")}[${chatStatusOptions.attribute("tone")}="busy"] ${partSelector(chatStatusContract, "dot")} {
    background: ${accentTokens.base};
    animation: meowui-pulse 1.1s infinite ease-in-out;
  }

  ${partSelector(chatStatusContract, "root")} {
    ${chatStatusOptions.when({ tone: "waiting" })} {
      color: ${uiTokens.warning};
    }
  }

  ${partSelector(chatStatusContract, "root")}[${chatStatusOptions.attribute("tone")}="waiting"] ${partSelector(chatStatusContract, "dot")} {
    background: ${uiTokens.warning};
  }

  ${partSelector(chatStatusContract, "root")} {
    ${chatStatusOptions.when({ tone: "error" })} {
      color: ${uiTokens.danger};
    }
  }

  ${partSelector(chatStatusContract, "root")}[${chatStatusOptions.attribute("tone")}="error"] ${partSelector(chatStatusContract, "dot")} {
    background: ${uiTokens.danger};
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
