import { css, partSelector } from "meowcss/meowjsx";
import { pageFrameContract, pageFrameOptions } from "../../components/page-frame";
import { uiTokens } from "../tokens";

export const pageFrameStyles = css`
  ${partSelector(pageFrameContract, "root")} {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: ${uiTokens.space.section};
    width: 100%;
    max-width: calc(${uiTokens.layout.containerPage} + ${uiTokens.space.pageInline} * 2);
    height: 100%;
    min-width: 0;
    min-height: 0;
    margin-inline: auto;
    padding: ${uiTokens.space.pageBlock} ${uiTokens.space.pageInline};
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
  /* A page centers its content under the header. A classic scrollbar takes
     width from one side only, so the page reserves both gutters to keep that
     center line. Workspace frames (Dialog, Drawer) start content at the
     header's edge, where a leading gutter would push the body off it. */
  ${partSelector(pageFrameContract, "root")}[${pageFrameOptions.attribute("variant")}="page"][${pageFrameOptions.attribute("scrollOwner")}="layout"] >
  ${partSelector(pageFrameContract, "body")} {
    scrollbar-gutter: stable both-edges;
  }
  @media (max-width: 768px) {
    ${partSelector(pageFrameContract, "root")} {
      padding: ${uiTokens.space.pageBlockCompact} ${uiTokens.space.pageInlineCompact};
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
