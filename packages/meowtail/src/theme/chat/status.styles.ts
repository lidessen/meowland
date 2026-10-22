import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { chatStatusContract, chatStatusOptions } from "../../chat/status";

export const chatStatusStyles = css`
  ${partSelector(chatStatusContract, "root")} {
    display: inline-flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
  }

  ${partSelector(chatStatusContract, "dot")} {
    display: block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.ink.tertiary};
  }

  ${partSelector(chatStatusContract, "root")} {
    ${chatStatusOptions.when({ tone: "online" })} {
      color: ${uiTokens.status.success};
    }
  }

  ${partSelector(chatStatusContract, "root")}[${chatStatusOptions.attribute("tone")}="online"] ${partSelector(chatStatusContract, "dot")} {
    background: ${uiTokens.status.success};
  }

  ${partSelector(chatStatusContract, "root")} {
    ${chatStatusOptions.when({ tone: "busy" })} {
      color: ${uiTokens.accent.base};
    }
  }

  ${partSelector(chatStatusContract, "root")}[${chatStatusOptions.attribute("tone")}="busy"] ${partSelector(chatStatusContract, "dot")} {
    background: ${uiTokens.accent.base};
    animation: meowui-pulse 1.1s infinite ease-in-out;
  }

  ${partSelector(chatStatusContract, "root")} {
    ${chatStatusOptions.when({ tone: "waiting" })} {
      color: ${uiTokens.status.warning};
    }
  }

  ${partSelector(chatStatusContract, "root")}[${chatStatusOptions.attribute("tone")}="waiting"] ${partSelector(chatStatusContract, "dot")} {
    background: ${uiTokens.status.warning};
  }

  ${partSelector(chatStatusContract, "root")} {
    ${chatStatusOptions.when({ tone: "error" })} {
      color: ${uiTokens.status.danger};
    }
  }

  ${partSelector(chatStatusContract, "root")}[${chatStatusOptions.attribute("tone")}="error"] ${partSelector(chatStatusContract, "dot")} {
    background: ${uiTokens.status.danger};
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
