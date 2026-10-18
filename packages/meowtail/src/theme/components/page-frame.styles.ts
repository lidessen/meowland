import { css, partSelector } from "meowcss/meowjsx";
import { pageFrameContract, pageFrameOptions } from "../../components/page-frame";
import { uiTokens } from "../tokens";

export const pageFrameStyles = css`
  ${partSelector(pageFrameContract, "root")} {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: ${uiTokens.spaceSection};
    width: 100%;
    max-width: calc(${uiTokens.containerPage} + ${uiTokens.pageInsetInline} * 2);
    height: 100%;
    min-width: 0;
    min-height: 0;
    margin-inline: auto;
    padding: ${uiTokens.pageInsetBlock} ${uiTokens.pageInsetInline};
    overflow: hidden;
  }
  :where(${partSelector(pageFrameContract, "toolbar")}, ${partSelector(pageFrameContract, "header")}, ${partSelector(pageFrameContract, "notice")}, ${partSelector(pageFrameContract, "footer")}) {
    min-width: 0;
    flex: 0 0 auto;
    max-height: none;
    overflow: visible;
  }
  ${partSelector(pageFrameContract, "body")} {
    display: flex;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  ${partSelector(pageFrameContract, "root")}[${pageFrameOptions.attribute("variant")}="workspace"] > ${partSelector(pageFrameContract, "notice")} {
    padding: 8px 12px 0;
  }
  ${partSelector(pageFrameContract, "root")}[${pageFrameOptions.attribute("variant")}="workspace"] > ${partSelector(pageFrameContract, "footer")} {
    padding: 8px 12px max(8px, env(safe-area-inset-bottom));
  }
  ${partSelector(pageFrameContract, "root")}[${pageFrameOptions.attribute("scrollOwner")}="content"] >
  ${partSelector(pageFrameContract, "body")} > * {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }
  ${partSelector(pageFrameContract, "root")}[${pageFrameOptions.attribute("scrollOwner")}="layout"] >
  ${partSelector(pageFrameContract, "body")} {
    display: block;
    overflow: auto;
    overscroll-behavior: contain;
  }
  @media (max-width: 768px) {
    ${partSelector(pageFrameContract, "root")} {
      padding: ${uiTokens.pageInsetCompactBlock} ${uiTokens.pageInsetCompactInline};
    }
  }
  ${partSelector(pageFrameContract, "root")} {
    ${pageFrameOptions.when({ variant: "workspace" })} {
      max-width: none;
      padding: 0;
      gap: 0;
      overflow: visible;
    }
  }
`;
