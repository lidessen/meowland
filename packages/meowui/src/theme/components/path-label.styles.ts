import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { pathLabelContract } from "../../components/path-label";

export const pathLabelStyles = css`
  ${partSelector(pathLabelContract, "root")} {
    display: flex;
    flex: 1 1 auto;
    justify-content: flex-end;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    font-size: ${uiTokens.fontCaption};
  }
  ${partSelector(pathLabelContract, "root")}[data-path-clipped] {
    mask-image: linear-gradient(to right, transparent, black 28px);
  }
  ${partSelector(pathLabelContract, "text")} {
    flex: none;
    margin-right: auto;
  }
  ${partSelector(pathLabelContract, "directory")} {
    color: ${uiTokens.subtleForeground};
  }
  ${partSelector(pathLabelContract, "name")} {
    color: ${uiTokens.foreground};
  }
`;
