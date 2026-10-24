import { css, parts } from "meowcss/meowjsx";

import { uiTokens } from "../tokens";
import type { RegionLayoutShell } from "../../components/region-layout";
import { ui } from "../utilities";
const regionLayoutPartRefs = parts<typeof RegionLayoutShell>("region-layout");
export const regionLayoutStyles = css`
  ${regionLayoutPartRefs.root} {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  ${regionLayoutPartRefs.grid} {
    display: grid;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  ${regionLayoutPartRefs.region} {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    contain: layout paint;
  }
  ${regionLayoutPartRefs.region}[hidden],
  ${regionLayoutPartRefs.back}[hidden] {
    display: none;
  }
  ${regionLayoutPartRefs.content} > * {
    flex-shrink: 0;
    min-width: 0;
    max-width: 100%;
  }
  ${regionLayoutPartRefs.content}[data-scroll-owner="content"] > * {
    flex: 1;
    min-height: 0;
  }
  ${regionLayoutPartRefs.back} {
    align-self: start;
    flex-shrink: 0;
    min-height: ${uiTokens.control.regular};
    margin-bottom: ${uiTokens.space.group};
    padding: 0 ${uiTokens.control.inset};
    color: ${uiTokens.ink.primary};
    background: transparent;
    border: 0;
    border-radius: ${uiTokens.radius.lg};
    font: inherit;
    cursor: pointer;
  }
  ${regionLayoutPartRefs.back}:focus-visible {
    ${ui.focus.inset}
  }
`;
