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
    gap: ${uiTokens.spaceGroup};
  }
  ${partSelector(fieldContract, "label")} {
    font-weight: 500;
  }
  :where(${partSelector(fieldContract, "description")}, ${partSelector(fieldContract, "error")}) {
    margin: 0;
    font-size: ${uiTokens.fontCaption};
    line-height: 1.5;
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
