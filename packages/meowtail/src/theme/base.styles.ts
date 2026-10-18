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
  /* Establish UI typography at an entry root without resetting an author's
     typography when a nested region changes its theme or appearance. */
  :where([data-meowui-theme-root="meowui"]:not([data-meowui-theme-root] *)) {
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontBody};
    line-height: ${uiTokens.leading};
  }
  /* Unlike typography, ink must resolve again at a local appearance boundary. */
  :where(
    [data-meowui-theme-root="meowui"],
    [data-meowui-theme-root="meowui"]
      [data-meowui-scope]:not([data-meowui-theme-root]:not([data-meowui-theme-root="meowui"]))
  ) {
    color: ${uiTokens.foreground};
  }
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
