import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { WebBlock } from "../../components/web-block";
const webBlockPartRefs = parts<typeof WebBlock>("web-block");
export const webBlockStyles = css`
  ${webBlockPartRefs.root} {
    min-width: 0;
    padding: 12px 14px;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.bodyCompact} ${uiTokens.type.sans};
  }
  ${webBlockPartRefs.answer} {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    margin-bottom: 8px;
  }
  ${webBlockPartRefs.sources} {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding-left: 2.5em;
    max-height: 320px;
    overflow: auto;
  }
  ${webBlockPartRefs.link} {
    color: ${uiTokens.status.info};
    font-weight: ${uiTokens.type.weight.medium};
    text-decoration: none;
    overflow-wrap: anywhere;
  }
  ${webBlockPartRefs.link}:hover {
    text-decoration: underline dotted;
    text-underline-offset: 3px;
  }
  ${webBlockPartRefs.snippet} {
    margin-top: 2px;
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.label} / ${uiTokens.type.line.label} ${uiTokens.type.sans};
    overflow-wrap: anywhere;
  }
  ${webBlockPartRefs.meta} {
    margin-top: 4px;
    color: ${uiTokens.ink.tertiary};
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
  }
`;
