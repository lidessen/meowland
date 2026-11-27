import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { ui } from "../utilities";

import type { Stat } from "../../components/stat";
const stat = parts<typeof Stat>("stat");
export const statStyles = css`
  ${stat.root} {
    display: grid;
    align-content: start;
    gap: 2px;
    min-width: 0;
    color: ${uiTokens.ink.primary};
    font-family: ${uiTokens.type.sans};
  }
  ${stat.label} {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    font-weight: ${uiTokens.type.weight.medium};
    overflow-wrap: anywhere;
  }
  ${stat.value} {
    font-family: ${uiTokens.type.display};
    font-size: ${uiTokens.type.pageTitle};
    line-height: ${uiTokens.type.line.pageTitle};
    font-weight: ${uiTokens.type.weight.display};
    letter-spacing: ${uiTokens.type.trackingTight};
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
  ${stat.detail} {
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    overflow-wrap: anywhere;
  }
  a${stat.root} {
    margin: -6px -8px;
    padding: 6px 8px;
    border-radius: ${uiTokens.radius.md};
    text-decoration: none;
    transition: background-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  a${stat.root}:hover {
    background: ${uiTokens.state.hover};
  }
  a${stat.root}:focus-visible {
    ${ui.focus.ring}
  }
  @media (prefers-reduced-motion: reduce) {
    a${stat.root} {
      transition: none;
    }
  }
`;
