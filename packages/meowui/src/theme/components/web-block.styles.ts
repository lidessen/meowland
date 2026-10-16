import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { webBlockContract as web } from "../../components/web-block";

export const webBlockStyles = css`
  ${partSelector(web, "root")} {
    min-width: 0;
    padding: 12px 14px;
    border-radius: ${uiTokens.radiusLarge};
    background: ${uiTokens.codeSurface};
    color: ${uiTokens.foreground};
    font: 14px/20px ${uiTokens.font};
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
    color: ${uiTokens.info};
    font-weight: 500;
    text-decoration: none;
    overflow-wrap: anywhere;
  }
  ${partSelector(web, "link")}:hover {
    text-decoration: underline dotted;
    text-underline-offset: 3px;
  }
  ${partSelector(web, "snippet")} {
    margin-top: 2px;
    color: ${uiTokens.mutedForeground};
    font: 13px/19px ${uiTokens.font};
    overflow-wrap: anywhere;
  }
  ${partSelector(web, "meta")} {
    margin-top: 4px;
    color: ${uiTokens.subtleForeground};
    font: 12px/18px ${uiTokens.font};
  }
`;
