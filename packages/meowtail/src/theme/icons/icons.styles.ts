import { uiTokens } from "../tokens";
import { css } from "meowcss/meowjsx";

export const iconsStyles = css`
  /* Brand and illustration contours retain their own drawing grammar. */
  .meow-github-icon {
    width: 1em;
    height: 1em;
    fill: currentColor;
    vertical-align: middle;
  }
  /* The assistant's mark: an ink disc that fills its avatar slot, the silhouette knocked out. */
  .meow-assistant-mark {
    display: block;
    width: 100%;
    height: 100%;
  }
  .meow-assistant-mark .assistant-mark-disc {
    fill: ${uiTokens.ink.primary};
  }
  .meow-assistant-mark .assistant-mark-glyph {
    fill: ${uiTokens.surface.raised};
  }
  /* EmptyState's default art: receding cards from the surface ladder, one accent spark. */
  .meow-empty-stack {
    display: block;
    width: 112px;
    height: auto;
    overflow: visible;
  }
  .meow-empty-stack rect {
    stroke-width: ${uiTokens.line.width};
    vector-effect: non-scaling-stroke;
  }
  .meow-empty-stack .empty-stack-back {
    fill: ${uiTokens.surface.fill};
    stroke: ${uiTokens.line.divider};
  }
  .meow-empty-stack .empty-stack-middle {
    fill: ${uiTokens.surface.raised};
    stroke: ${uiTokens.line.edge};
  }
  .meow-empty-stack .empty-stack-front {
    fill: ${uiTokens.surface.raised};
    stroke: ${uiTokens.line.edge};
    filter: drop-shadow(0 8px 14px color-mix(in srgb, ${uiTokens.surface.scrim} 35%, transparent));
  }
  .meow-empty-stack .empty-stack-tile {
    fill: ${uiTokens.accent.soft};
    stroke: none;
  }
  .meow-empty-stack .empty-stack-spark {
    fill: ${uiTokens.accent.ink};
  }
  .meow-empty-stack .empty-stack-line {
    fill: ${uiTokens.surface.fill};
    stroke: none;
  }
  .meow-empty-stack .empty-stack-line.is-short {
    opacity: 0.7;
  }
`;
