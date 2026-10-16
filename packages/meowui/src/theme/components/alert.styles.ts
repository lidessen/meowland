import { css, partSelector } from "meowcss/meowjsx";
import { alertTokens, uiTokens } from "../tokens";
import { alertContract } from "../../components/alert";

export const alertStyles = css`
  ${partSelector(alertContract, "root")} {
    display: grid;
    gap: ${uiTokens.spaceGroup};
    padding: ${uiTokens.spaceSection};
    border: 1px solid color-mix(in srgb, ${alertTokens.accent} 25%, ${uiTokens.border});
    border-radius: ${uiTokens.controlRadius};
    background: color-mix(in srgb, ${alertTokens.accent} 5%, ${uiTokens.background});
    color: ${uiTokens.foreground};
    overflow-wrap: anywhere;
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontBody};
  }
  ${partSelector(alertContract, "title")} {
    font-weight: 600;
  }
  ${partSelector(alertContract, "body")} {
    line-height: 1.6;
  }
  ${partSelector(alertContract, "actions")} {
    display: flex;
    flex-wrap: wrap;
    gap: ${uiTokens.spaceGroup};
  }
`;
