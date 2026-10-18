import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { fieldContract } from "../../components/field";

export const fieldStyles = css`
  :where(${partSelector(fieldContract, "root")}) {
    box-sizing: border-box;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
  }
  ${partSelector(fieldContract, "root")} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    gap: ${uiTokens.spaceGroup};
  }
  ${partSelector(fieldContract, "label")} {
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  :where(${partSelector(fieldContract, "description")}, ${partSelector(fieldContract, "error")}) {
    margin: 0;
    font-size: ${uiTokens.fontCaption};
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  ${partSelector(fieldContract, "description")} {
    color: ${uiTokens.mutedForeground};
  }
  ${partSelector(fieldContract, "error")} {
    color: ${uiTokens.danger};
  }
  ${partSelector(fieldContract, "control")} {
    min-width: 0;
  }
`;
