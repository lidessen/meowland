import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { Breadcrumb } from "../../components/breadcrumb";
import { ui } from "../utilities";
const breadcrumbPartRefs = parts<typeof Breadcrumb>("breadcrumb");
export const breadcrumbStyles = css`
  ${breadcrumbPartRefs.list} {
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
  ${breadcrumbPartRefs.item} {
    display: inline-flex;
    align-items: baseline;
    gap: ${uiTokens.space.group};
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${breadcrumbPartRefs.link} {
    color: ${uiTokens.ink.secondary};
    text-decoration: none;
    padding-block: ${uiTokens.space.group};
  }
  ${breadcrumbPartRefs.link}:hover {
    text-decoration: underline;
    color: ${uiTokens.ink.primary};
  }
  ${breadcrumbPartRefs.link}:focus-visible {
    ${ui.focus.ring}
  }
  ${breadcrumbPartRefs.current} {
    color: ${uiTokens.ink.primary};
    font-weight: ${uiTokens.type.weight.medium};
  }
  ${breadcrumbPartRefs.separator} {
    color: ${uiTokens.ink.secondary};
    opacity: 0.6;
  }
`;
