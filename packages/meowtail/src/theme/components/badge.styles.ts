import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { badgeContract, badgeOptions } from "../../components/badge";

export const badgeStyles = css`
  ${partSelector(badgeContract, "root")} {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    min-height: 24px;
    padding: 0 8px;
    border-radius: ${uiTokens.radius.full};
    corner-shape: round;
    color: ${uiTokens.ink.secondary};
    background: ${uiTokens.surface.fill};
    font: 400 ${uiTokens.type.caption}/18px ${uiTokens.type.sans};
  }
  ${partSelector(badgeContract, "root")} {
    ${badgeOptions.when({ tone: "accent" })} {
      color: ${uiTokens.action.primary};
      background: ${uiTokens.action.soft};
    }
  }
  ${partSelector(badgeContract, "root")} {
    ${badgeOptions.when({ tone: "danger" })} {
      color: ${uiTokens.status.danger};
      background: color-mix(in srgb, ${uiTokens.status.danger} 10%, transparent);
    }
  }
  ${partSelector(badgeContract, "root")} {
    ${badgeOptions.when({ tone: "success" })} {
      color: ${uiTokens.status.success};
      background: color-mix(in srgb, ${uiTokens.status.success} 10%, transparent);
    }
  }
  ${partSelector(badgeContract, "root")} {
    ${badgeOptions.when({ tone: "warning" })} {
      color: ${uiTokens.status.warning};
      background: color-mix(in srgb, ${uiTokens.status.warning} 12%, transparent);
    }
  }
  ${partSelector(badgeContract, "root")} {
    ${badgeOptions.when({ size: "small" })} {
      padding: 1px 8px;
      min-height: 20px;
      font-size: ${uiTokens.type.micro};
      line-height: 17px;
      font-weight: 500;
    }
  }
  ${partSelector(badgeContract, "root")} {
    ${badgeOptions.when({ tone: "outline" })} {
      border: 1px solid ${uiTokens.line.control};
      background: transparent;
      color: ${uiTokens.ink.tertiary};
    }
    ${badgeOptions.when({ tone: "solid" })} {
      background: ${uiTokens.ink.primary};
      color: ${uiTokens.action.onPrimary};
    }
    ${badgeOptions.when({ tone: "quiet" })} {
      background: transparent;
      color: ${uiTokens.ink.tertiary};
    }
  }
`;
