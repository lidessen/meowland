import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { avatarContract, avatarOptions } from "../../components/avatar";

export const avatarStyles = css`
  ${partSelector(avatarContract, "root")} {
    position: relative;
    display: inline-grid;
    place-items: center;
    overflow: hidden;
    box-sizing: border-box;
    width: 32px;
    height: 32px;
    border-radius: ${uiTokens.controlRadius};
    background: ${uiTokens.primary};
    color: ${uiTokens.onPrimary};
    font: 600 ${uiTokens.fontCaption}/1 ${uiTokens.font};
    user-select: none;
  }
  ${partSelector(avatarContract, "root")} {
    ${avatarOptions.when({ size: "small" })} {
      width: 24px;
      height: 24px;
      border-radius: ${uiTokens.radiusSmall};
      font-size: 10px;
    }
  }
  ${partSelector(avatarContract, "root")} {
    ${avatarOptions.when({ size: "large" })} {
      width: 40px;
      height: 40px;
      font-size: ${uiTokens.fontBody};
    }
  }
  ${partSelector(avatarContract, "initials")} {
    display: grid;
    place-items: center;
    letter-spacing: 0.02em;
  }
  ${partSelector(avatarContract, "image")} {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  ${partSelector(avatarContract, "image")}[hidden] {
    display: none;
  }
`;
