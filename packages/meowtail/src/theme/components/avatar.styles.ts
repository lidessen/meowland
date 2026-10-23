import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { avatarContract, avatarOptions } from "../../components/avatar";

const root = partSelector(avatarContract, "root");

export const avatarStyles = css`
  ${root} {
    position: relative;
    display: inline-grid;
    place-items: center;
    overflow: hidden;
    box-sizing: border-box;
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: ${uiTokens.radius.lg};
    /* The glyph-tile material WorkCard and ResourceCard use: identity, not an action.
       A fill, so it takes no edge. */
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.chip};
    font: 600 ${uiTokens.type.caption}/1 ${uiTokens.type.sans};
    user-select: none;
  }
  ${root} {
    ${avatarOptions.when({ size: "small" })} {
      width: 24px;
      height: 24px;
      border-radius: ${uiTokens.radius.md};
      font-size: ${uiTokens.type.micro};
    }
  }
  ${root} {
    ${avatarOptions.when({ size: "large" })} {
      width: 40px;
      height: 40px;
      font-size: ${uiTokens.type.body};
    }
  }
  ${partSelector(avatarContract, "initials")} {
    display: grid;
    place-items: center;
    letter-spacing: ${uiTokens.type.trackingCaps};
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
