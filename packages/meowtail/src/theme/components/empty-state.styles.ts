import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { emptyStateContract, emptyStateOptions } from "../../components/empty-state";

export const emptyStateStyles = css`
  :where(${partSelector(emptyStateContract, "root")}) {
    box-sizing: border-box;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
  }
  ${partSelector(emptyStateContract, "root")} {
    display: grid;
    justify-items: center;
    gap: ${uiTokens.spaceSection};
    padding: 40px ${uiTokens.spacePanel};
    text-align: center;
  }
  ${partSelector(emptyStateContract, "illustration")} {
    width: 72px;
    color: ${uiTokens.mutedForeground};
  }
  ${partSelector(emptyStateContract, "illustration")} > svg {
    display: block;
    width: 100%;
    height: auto;
    stroke-width: 2.4;
  }
  ${partSelector(emptyStateContract, "title")} {
    margin: 0;
    font-size: ${uiTokens.fontTitle};
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  ${partSelector(emptyStateContract, "description")} {
    max-width: 38ch;
    margin: 0;
    color: ${uiTokens.mutedForeground};
  }
  ${partSelector(emptyStateContract, "root")} {
    ${emptyStateOptions.when({ size: "compact" })} {
      gap: ${uiTokens.spaceGroup};
      padding: ${uiTokens.spaceSection};
    }
  }
  ${partSelector(emptyStateContract, "root")}[${emptyStateOptions.attribute("size")}="compact"]
  ${partSelector(emptyStateContract, "illustration")} {
    display: none;
  }
  ${partSelector(emptyStateContract, "root")}[${emptyStateOptions.attribute("size")}="compact"]
  ${partSelector(emptyStateContract, "title")} {
    font-size: ${uiTokens.fontBody};
  }
`;
