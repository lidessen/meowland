import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { breadcrumbContract } from "../../components/breadcrumb";

export const breadcrumbStyles = css`
  ${partSelector(breadcrumbContract, "list")} {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 ${uiTokens.spaceGroup};
    list-style: none;
    padding: 0;
    margin: 0;
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontCaption};
  }
  ${partSelector(breadcrumbContract, "item")} {
    display: inline-flex;
    align-items: baseline;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${partSelector(breadcrumbContract, "link")} {
    color: ${uiTokens.mutedForeground};
    text-decoration: none;
    padding-block: ${uiTokens.spaceGroup};
  }
  ${partSelector(breadcrumbContract, "link")}:hover {
    text-decoration: underline;
    color: ${uiTokens.foreground};
  }
  ${partSelector(breadcrumbContract, "link")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 3px;
  }
  ${partSelector(breadcrumbContract, "current")} {
    color: ${uiTokens.foreground};
    font-weight: 500;
  }
  ${partSelector(breadcrumbContract, "separator")} {
    color: ${uiTokens.mutedForeground};
    opacity: 0.6;
  }
`;
