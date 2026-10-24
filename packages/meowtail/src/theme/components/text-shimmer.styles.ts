import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { TextShimmer } from "../../components/text-shimmer";
const textShimmerPartRefs = parts<typeof TextShimmer>("text-shimmer");
export const textShimmerStyles = css`
  ${textShimmerPartRefs.root} {
    position: relative;
    display: inline-block;
    max-width: 100%;
    min-width: 0;
    vertical-align: top;
  }
  ${textShimmerPartRefs.content} {
    color: inherit;
  }
  ${textShimmerPartRefs.decoration} {
    display: none;
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    user-select: none;
    color: ${uiTokens.ink.primary};
    /* A band of full ink about 112px wide crosses text that rests in muted ink. */
    mask-image: linear-gradient(
      90deg,
      transparent calc(50% - 56px),
      black 50%,
      transparent calc(50% + 56px)
    );
    mask-size: calc(200% + 224px) 100%;
    mask-repeat: no-repeat;
  }
  ${textShimmerPartRefs.decoration} * {
    color: inherit !important;
  }
  ${textShimmerPartRefs.decoration} [data-shimmer-decoration] {
    background: currentColor;
  }
  ${textShimmerPartRefs.root}[data-active="true"] > ${textShimmerPartRefs.content} {
    color: color-mix(in srgb, currentColor 55%, transparent);
  }
  ${textShimmerPartRefs.root}[data-active="true"] > ${textShimmerPartRefs.decoration} {
    display: block;
    animation: ui-text-shimmer ${uiTokens.motion.sweep} linear infinite;
  }
  @keyframes ui-text-shimmer {
    from {
      mask-position: 100% 0;
    }
    to {
      mask-position: 0 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${textShimmerPartRefs.root}[data-active="true"] > ${textShimmerPartRefs.decoration} {
      display: none;
      animation: none;
    }
    ${textShimmerPartRefs.root}[data-active="true"] > ${textShimmerPartRefs.content} {
      color: inherit;
    }
  }
`;
