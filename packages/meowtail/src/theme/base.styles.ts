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

/* Native controls default to the browser's own font (13.33px). A library
   control inherits its surroundings unless its family sets a size. Zero
   specificity and first in the theme, so every family rule overrides it. */
export const controlFontStyles = css`
  :where(button, input, select, textarea, optgroup):where([data-meowui-part]) {
    font: inherit;
    letter-spacing: inherit;
  }
`;

export const baseStyles = css`
  /* Establish UI typography at an entry root without resetting an author's
     typography when a nested region changes its theme or appearance. */
  :where([data-meowui-theme-root="meowui"]:not([data-meowui-theme-root] *)) {
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.leading};
  }
  /* Unlike typography, ink must resolve again at a local appearance boundary. */
  :where(
    [data-meowui-theme-root="meowui"],
    [data-meowui-theme-root="meowui"]
      [data-meowui-scope]:not([data-meowui-theme-root]:not([data-meowui-theme-root="meowui"]))
  ) {
    color: ${uiTokens.ink.primary};
  }
  :where([data-meowui-theme-root="meowui"]) {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-autospace: normal;
  }
  .meow-icon {
    flex-shrink: 0;
    vertical-align: middle;
    stroke-width: ${uiTokens.icon.stroke};
  }
  .meowland-mark-silhouette {
    fill: var(${logoTokens.ink.name}, currentColor);
  }
`;
