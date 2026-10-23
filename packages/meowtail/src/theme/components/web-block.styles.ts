import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { webBlockContract as web } from "../../components/web-block";

export const webBlockStyles = css`
  ${partSelector(web, "root")} {
    min-width: 0;
    padding: 12px 14px;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.bodyCompact} ${uiTokens.type.sans};
  }
  ${partSelector(web, "answer")} {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    margin-bottom: 8px;
  }
  ${partSelector(web, "sources")} {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding-left: 2.5em;
    max-height: 320px;
    overflow: auto;
  }
  ${partSelector(web, "link")} {
    color: ${uiTokens.status.info};
    font-weight: ${uiTokens.type.weight.medium};
    text-decoration: none;
    overflow-wrap: anywhere;
  }
  ${partSelector(web, "link")}:hover {
    text-decoration: underline dotted;
    text-underline-offset: 3px;
  }
  ${partSelector(web, "snippet")} {
    margin-top: 2px;
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.label} / ${uiTokens.type.line.label} ${uiTokens.type.sans};
    overflow-wrap: anywhere;
  }
  ${partSelector(web, "meta")} {
    margin-top: 4px;
    color: ${uiTokens.ink.tertiary};
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
  }
`;
