import { css, partSelector } from "meowcss/meowjsx";
import { tagContract, tagOptions } from "../../components/tag";
import { uiTokens } from "../tokens";
import { accentTokens, layerTokens, radiusTokens, statusTokens } from "../palette";

const root = partSelector(tagContract, "root");

export const tagStyles = css`
  ${root} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 2px 8px;
    border-radius: ${radiusTokens.tag};
    background: ${layerTokens.chip};
    color: ${layerTokens.chipInk};
    font: 12px/18px ${uiTokens.font};
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  ${root} {
    ${tagOptions.when({ tone: "accent" })} {
      background: ${accentTokens.selected};
      color: ${accentTokens.ink};
      font-weight: 600;
    }
    ${tagOptions.when({ tone: "warning" })} {
      background: ${statusTokens.warning};
      color: #fff;
      font-weight: 600;
    }
    ${tagOptions.when({ kind: "count" })} {
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      corner-shape: round;
      font-size: 11px;
      line-height: 1;
      font-weight: 600;
    }
    ${tagOptions.when({ kind: "path" })} {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: baseline;
      padding: 1px 5px;
      border-radius: 4px;
      background: ${layerTokens.code};
      color: ${uiTokens.foreground};
      font-family: ${uiTokens.mono};
      font-weight: 400;
    }
  }
`;
