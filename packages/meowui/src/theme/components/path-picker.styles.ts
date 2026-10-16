import { pathPickerContract } from "../../components/path-picker";
import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

export const pathPickerStyles = css`
  ${partSelector(pathPickerContract, "root")} {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: ${uiTokens.spaceGroup};
  }
  ${partSelector(pathPickerContract, "row")} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
  }
  ${partSelector(pathPickerContract, "control")} {
    flex: 1;
    min-width: 0;
  }
  ${partSelector(pathPickerContract, "trigger")} {
    flex: none;
    white-space: nowrap;
  }
  ${partSelector(pathPickerContract, "feedback")} {
    color: ${uiTokens.danger};
    font-size: ${uiTokens.fontCaption};
    line-height: ${uiTokens.leading};
  }
  ${partSelector(pathPickerContract, "feedback")}:empty {
    display: none;
  }
`;
