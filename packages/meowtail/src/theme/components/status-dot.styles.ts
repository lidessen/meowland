import { css, partSelector } from "meowcss/meowjsx";
import { statusDotContract, statusDotOptions } from "../../components/status-dot";
import { accentTokens, statusTokens } from "../palette";

const root = partSelector(statusDotContract, "root");

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
    border: 1.5px solid ${statusTokens.unknown};
  }
  ${root} {
    ${statusDotOptions.when({ state: "processing" })} {
      border: 0;
      background: ${statusTokens.processing};
      animation: meow-status-pulse 1.2s infinite ease-in-out;
    }
    ${statusDotOptions.when({ state: "success" })} {
      border: 0;
      background: ${statusTokens.success};
    }
    ${statusDotOptions.when({ state: "returned" })} {
      border-color: ${statusTokens.success};
    }
    ${statusDotOptions.when({ state: "warning" })} {
      border: 0;
      background: ${statusTokens.warning};
    }
    ${statusDotOptions.when({ state: "danger" })} {
      border: 0;
      background: ${statusTokens.danger};
    }
    ${statusDotOptions.when({ state: "idle" })} {
      border: 0;
      background: ${statusTokens.unknown};
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
    background: ${accentTokens.halo};
    animation: meow-status-pulse 1.2s infinite ease-in-out;
  }
  ${root}[data-halo="true"][${statusDotOptions.attribute("state")}="processing"] {
    animation: none;
  }
  ${root}[data-halo="true"][${statusDotOptions.attribute("state")}="success"] {
    box-shadow: 0 0 0 3px ${statusTokens.successHalo};
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
