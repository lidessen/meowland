import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { fieldGroupContract } from "../../components/field-group";

export const fieldGroupStyles = css`
  ${partSelector(fieldGroupContract, "root")} {
    min-inline-size: 0;
    margin: 0;
    padding: 0;
    border: 0;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
  }
  ${partSelector(fieldGroupContract, "legend")} {
    padding: 0;
    margin-bottom: ${uiTokens.spaceGroup};
    font-weight: 600;
    overflow-wrap: anywhere;
  }
  ${partSelector(fieldGroupContract, "description")} {
    margin: 0 0 ${uiTokens.spaceSection};
    color: ${uiTokens.mutedForeground};
  }
  ${partSelector(fieldGroupContract, "content")} {
    display: grid;
    gap: ${uiTokens.spaceSection};
    min-width: 0;
  }
  ${partSelector(fieldGroupContract, "root")}:disabled > ${partSelector(fieldGroupContract, "legend")} {
    color: ${uiTokens.subtleForeground};
  }
`;
