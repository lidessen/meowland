import { css, parts } from "meowcss/meowjsx";

import { uiTokens } from "../tokens";

import type { PageFrame } from "../../components/page-frame";
import { pageFrameOptions } from "../../components/page-frame.options";
const pageFramePartRefs = parts<typeof PageFrame>("page-frame");
export const pageFrameStyles = css`
  ${pageFramePartRefs.root} {
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
  :where(${pageFramePartRefs.toolbar}, ${pageFramePartRefs.header}, ${pageFramePartRefs.notice}, ${pageFramePartRefs.footer}) {
    min-width: 0;
    flex: 0 0 auto;
    max-height: none;
    overflow: visible;
  }
  ${pageFramePartRefs.body} {
    display: flex;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  ${pageFramePartRefs.root}[${pageFrameOptions.attribute("variant")}="workspace"] > ${pageFramePartRefs.notice} {
    padding: 8px 12px 0;
  }
  ${pageFramePartRefs.root}[${pageFrameOptions.attribute("variant")}="workspace"] > ${pageFramePartRefs.footer} {
    padding: 8px 12px max(8px, env(safe-area-inset-bottom));
  }
  ${pageFramePartRefs.root}[${pageFrameOptions.attribute("scrollOwner")}="content"] >
  ${pageFramePartRefs.body} > * {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }
  ${pageFramePartRefs.root}[${pageFrameOptions.attribute("scrollOwner")}="layout"] >
  ${pageFramePartRefs.body} {
    display: block;
    overflow: auto;
    overscroll-behavior: contain;
  }
  /* A workspace (Dialog, Drawer) keeps its header while the body scrolls under it. The header's
     edge appears over the first group step of scroll; a body that fits, or a browser without scroll
     timelines, shows none. Focus scrolling stops short of the edge so focus ink stays visible. */
  ${pageFramePartRefs.root}[${pageFrameOptions.attribute("variant")}="workspace"][${pageFrameOptions.attribute("scrollOwner")}="layout"]:has(> ${pageFramePartRefs.header}) {
    timeline-scope: --ui-frame-body;
  }
  ${pageFramePartRefs.root}[${pageFrameOptions.attribute("variant")}="workspace"][${pageFrameOptions.attribute("scrollOwner")}="layout"] >
  ${pageFramePartRefs.header} + ${pageFramePartRefs.body} {
    scroll-timeline: --ui-frame-body block;
    scroll-padding-block: ${uiTokens.space.group};
  }
  @supports (animation-timeline: scroll()) {
    ${pageFramePartRefs.root}[${pageFrameOptions.attribute("variant")}="workspace"][${pageFrameOptions.attribute("scrollOwner")}="layout"] >
    ${pageFramePartRefs.header}:has(+ ${pageFramePartRefs.body}) {
      animation: ui-frame-header-edge linear both;
      animation-timeline: --ui-frame-body;
      animation-range: 0 ${uiTokens.space.group};
    }
  }
  @keyframes ui-frame-header-edge {
    from {
      box-shadow: inset 0 calc(-1 * ${uiTokens.line.width}) 0 transparent;
    }
    to {
      box-shadow: inset 0 calc(-1 * ${uiTokens.line.width}) 0 ${uiTokens.line.divider};
    }
  }
  /* A page centers its content under the header. A classic scrollbar takes
     width from one side only, so the page reserves both gutters to keep that
     center line. Workspace frames (Dialog, Drawer) start content at the
     header's edge, where a leading gutter would push the body off it. */
  ${pageFramePartRefs.root}[${pageFrameOptions.attribute("variant")}="page"][${pageFrameOptions.attribute("scrollOwner")}="layout"] >
  ${pageFramePartRefs.body} {
    scrollbar-gutter: stable both-edges;
  }
  @media (max-width: 768px) {
    ${pageFramePartRefs.root} {
      padding: ${uiTokens.space.pageBlockCompact} ${uiTokens.space.pageInlineCompact};
    }
  }
  ${pageFramePartRefs.root} {
    ${pageFrameOptions.when({ variant: "workspace" })} {
      max-width: none;
      padding: 0;
      gap: 0;
      overflow: visible;
    }
  }
`;
