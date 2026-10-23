import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { fieldGroupContract } from "../../components/field-group";

export const fieldGroupStyles = css`
  ${partSelector(fieldGroupContract, "root")} {
    min-inline-size: 0;
    margin: 0;
    padding: 0;
    border: 0;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  ${partSelector(fieldGroupContract, "legend")} {
    padding: 0;
    margin-bottom: ${uiTokens.space.group};
    font-weight: ${uiTokens.type.weight.semibold};
    overflow-wrap: anywhere;
  }
  ${partSelector(fieldGroupContract, "description")} {
    margin: 0 0 ${uiTokens.space.section};
    color: ${uiTokens.ink.secondary};
  }
  ${partSelector(fieldGroupContract, "content")} {
    display: grid;
    gap: ${uiTokens.space.section};
    min-width: 0;
  }
  ${partSelector(fieldGroupContract, "root")}:disabled > ${partSelector(fieldGroupContract, "legend")} {
    color: ${uiTokens.ink.tertiary};
  }
`;
