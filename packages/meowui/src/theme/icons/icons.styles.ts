import { css } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

export const iconsStyles = css`
  /* Brand and illustration contours retain their own drawing grammar. */
  .meow-github-icon {
    width: 1em;
    height: 1em;
    fill: currentColor;
    vertical-align: middle;
  }
  .meow-doodle-cat {
    width: 120px;
    height: auto;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .meow-doodle-cat .empty-cat-body {
    fill: ${uiTokens.surface};
  }
  .meow-doodle-cat .empty-cat-face {
    stroke-width: 3;
  }
  .meow-doodle-cat .empty-cat-whisker {
    opacity: 0.55;
  }
`;
