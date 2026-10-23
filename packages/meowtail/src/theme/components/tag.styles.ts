import { css, partSelector } from "meowcss/meowjsx";
import { tagContract, tagOptions } from "../../components/tag";
import { uiTokens } from "../tokens";

const root = partSelector(tagContract, "root");

export const tagStyles = css`
  ${root} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 2px 8px;
    border-radius: ${uiTokens.radius.sm};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.chip};
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  ${root} {
    ${tagOptions.when({ tone: "accent" })} {
      background: ${uiTokens.accent.selected};
      color: ${uiTokens.accent.ink};
      font-weight: ${uiTokens.type.weight.semibold};
    }
    ${tagOptions.when({ tone: "warning" })} {
      background: ${uiTokens.status.warning};
      color: ${uiTokens.action.onPrimary};
      font-weight: ${uiTokens.type.weight.semibold};
    }
    ${tagOptions.when({ kind: "count" })} {
      min-width: 18px;
      height: 18px;
      padding: 0 6px;
      border-radius: ${uiTokens.radius.full};
      corner-shape: round;
      font-size: ${uiTokens.type.micro};
      line-height: 1;
      font-weight: ${uiTokens.type.weight.semibold};
    }
    ${tagOptions.when({ kind: "path" })} {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: baseline;
      padding: 1px 6px;
      border-radius: ${uiTokens.radius.xs};
      background: ${uiTokens.surface.tint};
      color: ${uiTokens.ink.primary};
      font-family: ${uiTokens.type.mono};
      font-weight: ${uiTokens.type.weight.regular};
    }
  }
`;
