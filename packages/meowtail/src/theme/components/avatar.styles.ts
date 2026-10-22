import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { layerTokens } from "../palette";
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
    border-radius: ${uiTokens.controlRadius};
    /* The glyph-tile material WorkCard and ResourceCard use: identity, not an action.
       A fill, so it takes no edge. */
    background: ${layerTokens.chip};
    color: ${layerTokens.chipInk};
    font: 600 ${uiTokens.fontCaption}/1 ${uiTokens.font};
    user-select: none;
  }
  ${root} {
    ${avatarOptions.when({ size: "small" })} {
      width: 24px;
      height: 24px;
      border-radius: ${uiTokens.radiusSmall};
      font-size: ${uiTokens.fontMicro};
    }
  }
  ${root} {
    ${avatarOptions.when({ size: "large" })} {
      width: 40px;
      height: 40px;
      font-size: ${uiTokens.fontBody};
    }
  }
  ${partSelector(avatarContract, "initials")} {
    display: grid;
    place-items: center;
    letter-spacing: 0.04em;
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
