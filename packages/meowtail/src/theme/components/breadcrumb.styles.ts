import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";
import { breadcrumbContract } from "../../components/breadcrumb";

export const breadcrumbStyles = css`
  ${partSelector(breadcrumbContract, "list")} {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 ${uiTokens.space.group};
    list-style: none;
    padding: 0;
    margin: 0;
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.caption};
  }
  ${partSelector(breadcrumbContract, "item")} {
    display: inline-flex;
    align-items: baseline;
    gap: ${uiTokens.space.group};
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${partSelector(breadcrumbContract, "link")} {
    color: ${uiTokens.ink.secondary};
    text-decoration: none;
    padding-block: ${uiTokens.space.group};
  }
  ${partSelector(breadcrumbContract, "link")}:hover {
    text-decoration: underline;
    color: ${uiTokens.ink.primary};
  }
  ${partSelector(breadcrumbContract, "link")}:focus-visible {
    ${focusRing()}
  }
  ${partSelector(breadcrumbContract, "current")} {
    color: ${uiTokens.ink.primary};
    font-weight: ${uiTokens.type.weight.medium};
  }
  ${partSelector(breadcrumbContract, "separator")} {
    color: ${uiTokens.ink.secondary};
    opacity: 0.6;
  }
`;
