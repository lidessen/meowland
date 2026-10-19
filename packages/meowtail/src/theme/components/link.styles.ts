import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { accentTokens } from "../palette";
import { linkContract } from "../../components/link";

const root = partSelector(linkContract, "root");

export const linkStyles = css`
  ${root} {
    color: ${accentTokens.ink};
    font: inherit;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-decoration-color: color-mix(in srgb, ${accentTokens.ink} 55%, transparent);
    text-underline-offset: 3px;
    overflow-wrap: anywhere;
    transition:
      color ${uiTokens.durationResponse} ${uiTokens.ease},
      text-decoration-color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${root}:hover {
    color: ${uiTokens.foreground};
    text-decoration-color: ${uiTokens.foreground};
  }
  ${root}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
    border-radius: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    ${root} {
      transition: none;
    }
  }
`;
