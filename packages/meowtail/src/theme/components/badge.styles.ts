import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { statusTokens } from "../palette";
import { badgeContract, badgeOptions } from "../../components/badge";

export const badgeStyles = css`
  ${partSelector(badgeContract, "root")} {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    min-height: 24px;
    padding: 0 8px;
    border-radius: 999px;
    corner-shape: round;
    color: ${uiTokens.mutedForeground};
    background: ${uiTokens.surfaceMuted};
    font: 400 ${uiTokens.fontCaption}/18px ${uiTokens.font};
  }
  ${partSelector(badgeContract, "root")} {
    ${badgeOptions.when({ tone: "accent" })} {
      color: ${uiTokens.primary};
      background: ${uiTokens.primarySoft};
    }
  }
  ${partSelector(badgeContract, "root")} {
    ${badgeOptions.when({ tone: "danger" })} {
      color: ${uiTokens.danger};
      background: color-mix(in srgb, ${uiTokens.danger} 10%, transparent);
    }
  }
  ${partSelector(badgeContract, "root")} {
    ${badgeOptions.when({ tone: "success" })} {
      color: ${statusTokens.successInk};
      background: color-mix(in srgb, ${uiTokens.success} 10%, transparent);
    }
  }
  ${partSelector(badgeContract, "root")} {
    ${badgeOptions.when({ tone: "warning" })} {
      color: ${uiTokens.warning};
      background: color-mix(in srgb, ${uiTokens.warning} 12%, transparent);
    }
  }
  ${partSelector(badgeContract, "root")} {
    ${badgeOptions.when({ size: "small" })} {
      padding: 1px 8px;
      min-height: 20px;
      font-size: 11px;
      line-height: 17px;
      font-weight: 500;
    }
  }
  ${partSelector(badgeContract, "root")} {
    ${badgeOptions.when({ tone: "outline" })} {
      border: 0.5px solid ${uiTokens.border};
      background: transparent;
      color: ${uiTokens.subtleForeground};
    }
    ${badgeOptions.when({ tone: "solid" })} {
      background: ${uiTokens.foreground};
      color: ${uiTokens.surface};
    }
    ${badgeOptions.when({ tone: "quiet" })} {
      background: transparent;
      color: ${uiTokens.subtleForeground};
    }
  }
`;
