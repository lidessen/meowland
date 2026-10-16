import { css } from "meowcss/meowjsx";
import { logoTokens, uiTokens } from "./tokens";

export const cornerShapeStyles = css`
  @supports (corner-shape: superellipse(1.5)) {
    :where([data-meowui-part]),
    :where([data-meowui-part])::before,
    :where([data-meowui-part])::after {
      corner-shape: superellipse(1.5);
    }
  }
`;

export const baseStyles = css`
  :where([data-meowui-theme-root="meowui"]) {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-autospace: normal;
  }
  .meow-icon {
    flex-shrink: 0;
    vertical-align: middle;
    stroke-width: ${uiTokens.iconStroke};
  }
  .meowland-mark-silhouette {
    fill: var(${logoTokens.ink.name}, currentColor);
  }
`;
