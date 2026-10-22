import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { metaRowContract, metaRowOptions } from "../../components/meta-row";

export const metaRowStyles = css`
  ${partSelector(metaRowContract, "root")} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
    color: ${uiTokens.mutedForeground};
    font: ${uiTokens.fontCaption}/18px ${uiTokens.font};
  }
  ${partSelector(metaRowContract, "root")}[${metaRowOptions.attribute("align")}="center"] {
    justify-content: center;
  }
  ${partSelector(metaRowContract, "item")} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }
  ${partSelector(metaRowContract, "icon")} {
    display: inline-flex;
    align-items: center;
    flex: none;
  }
  ${partSelector(metaRowContract, "icon")} svg {
    width: 14px;
    height: 14px;
    flex: none;
  }
  ${partSelector(metaRowContract, "label")} {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${partSelector(metaRowContract, "separator")} {
    color: ${uiTokens.border};
  }
  ${partSelector(metaRowContract, "progress")} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex: none;
    font-variant-numeric: tabular-nums;
  }
  ${partSelector(metaRowContract, "progress")}::before {
    content: "";
    width: 14px;
    height: 14px;
    flex: none;
    border-radius: 50%;
    background: conic-gradient(
      ${uiTokens.subtleForeground} var(--meta-progress, 0%),
      ${uiTokens.border} var(--meta-progress, 0%)
    );
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), black 0);
    mask: radial-gradient(farthest-side, transparent calc(100% - 3px), black 0);
  }
  ${partSelector(metaRowContract, "root")}[${metaRowOptions.attribute("progressTone")}="accent"] ${partSelector(metaRowContract, "progress")}::before {
    background: conic-gradient(
      ${uiTokens.info} var(--meta-progress, 0%),
      ${uiTokens.border} var(--meta-progress, 0%)
    );
  }
`;
