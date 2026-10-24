import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { MetaRow } from "../../components/meta-row";
import { metaRowOptions } from "../../components/meta-row.options";
const metaRowPartRefs = parts<typeof MetaRow>("meta-row");
export const metaRowStyles = css`
  ${metaRowPartRefs.root} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${uiTokens.space.group};
    min-width: 0;
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
  }
  ${metaRowPartRefs.root}[${metaRowOptions.attribute("align")}="center"] {
    justify-content: center;
  }
  ${metaRowPartRefs.item} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }
  ${metaRowPartRefs.icon} {
    display: inline-flex;
    align-items: center;
    flex: none;
  }
  ${metaRowPartRefs.icon} svg {
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
    flex: none;
  }
  ${metaRowPartRefs.label} {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${metaRowPartRefs.separator} {
    color: ${uiTokens.line.control};
  }
  ${metaRowPartRefs.progress} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex: none;
    font-variant-numeric: tabular-nums;
  }
  ${metaRowPartRefs.progress}::before {
    content: "";
    width: 14px;
    height: 14px;
    flex: none;
    border-radius: 50%;
    background: conic-gradient(
      ${uiTokens.ink.tertiary} var(--meta-progress, 0%),
      ${uiTokens.line.control} var(--meta-progress, 0%)
    );
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), black 0);
    mask: radial-gradient(farthest-side, transparent calc(100% - 3px), black 0);
  }
  ${metaRowPartRefs.root}[${metaRowOptions.attribute("progressTone")}="accent"] ${metaRowPartRefs.progress}::before {
    background: conic-gradient(
      ${uiTokens.status.info} var(--meta-progress, 0%),
      ${uiTokens.line.control} var(--meta-progress, 0%)
    );
  }
`;
