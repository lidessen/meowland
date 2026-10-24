import { uiTokens } from "../tokens";
import { css, parts } from "meowcss/meowjsx";

import type { StatusDot } from "../../components/status-dot";
import { statusDotOptions } from "../../components/status-dot.options";
const statusDotPartRefs = parts<typeof StatusDot>("status-dot");
const root = statusDotPartRefs.root;

export const statusDotStyles = css`
  ${root} {
    position: relative;
    display: inline-block;
    flex: 0 0 auto;
    box-sizing: border-box;
    width: var(--status-dot-size, 8px);
    height: var(--status-dot-size, 8px);
    border-radius: 50%;
    corner-shape: round;
    background: transparent;
    border: 1.5px solid ${uiTokens.status.unknown};
  }
  ${root} {
    ${statusDotOptions.when({ state: "processing" })} {
      border: 0;
      background: ${uiTokens.accent.base};
      animation: meow-status-pulse ${uiTokens.motion.loop} infinite ${uiTokens.motion.ease};
    }
    ${statusDotOptions.when({ state: "success" })} {
      border: 0;
      background: ${uiTokens.status.success};
    }
    ${statusDotOptions.when({ state: "returned" })} {
      border-color: ${uiTokens.status.success};
    }
    ${statusDotOptions.when({ state: "warning" })} {
      border: 0;
      background: ${uiTokens.status.warning};
    }
    ${statusDotOptions.when({ state: "danger" })} {
      border: 0;
      background: ${uiTokens.status.danger};
    }
    ${statusDotOptions.when({ state: "idle" })} {
      border: 0;
      background: ${uiTokens.status.unknown};
      opacity: 0.6;
    }
  }
  /* The ring leads a surface: connection or the header's current activity. */
  ${root}[data-halo="true"][${statusDotOptions.attribute("state")}="processing"]::after {
    content: "";
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.accent.halo};
    animation: meow-status-pulse ${uiTokens.motion.loop} infinite ${uiTokens.motion.ease};
  }
  ${root}[data-halo="true"][${statusDotOptions.attribute("state")}="processing"] {
    animation: none;
  }
  ${root}[data-halo="true"][${statusDotOptions.attribute("state")}="success"] {
    box-shadow: 0 0 0 3px color-mix(in srgb, ${uiTokens.status.success} 18%, transparent);
  }
  @keyframes meow-status-pulse {
    50% {
      opacity: 0.35;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${root},
    ${root}::after {
      animation: none !important;
    }
  }
`;
