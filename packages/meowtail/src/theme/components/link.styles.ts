import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { linkContract } from "../../components/link";

const root = partSelector(linkContract, "root");

export const linkStyles = css`
  ${root} {
    color: ${uiTokens.accent.ink};
    font: inherit;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-decoration-color: color-mix(in srgb, ${uiTokens.accent.ink} 55%, transparent);
    text-underline-offset: 3px;
    overflow-wrap: anywhere;
    transition:
      color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      text-decoration-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${root}:hover {
    color: ${uiTokens.ink.primary};
    text-decoration-color: ${uiTokens.ink.primary};
  }
  ${root}:focus-visible {
    outline: 2px solid ${uiTokens.state.focus};
    outline-offset: 2px;
    border-radius: ${uiTokens.radius.xs};
  }
  @media (prefers-reduced-motion: reduce) {
    ${root} {
      transition: none;
    }
  }
`;
