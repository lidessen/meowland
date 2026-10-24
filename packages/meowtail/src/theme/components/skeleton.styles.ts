import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { Skeleton } from "../../components/skeleton";
import type { SkeletonBoundary } from "../../components/skeleton-boundary";
import { skeletonOptions } from "../../components/skeleton.options";
const skeletonBoundaryPartRefs = parts<typeof SkeletonBoundary>("skeleton-boundary");
const skeletonPartRefs = parts<typeof Skeleton>("skeleton");
export const skeletonStyles = css`
  ${skeletonBoundaryPartRefs.root},
  ${skeletonBoundaryPartRefs.content} {
    min-width: 0;
  }
  ${skeletonBoundaryPartRefs.status} {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  ${skeletonPartRefs.root} {
    display: block;
    width: 100%;
    height: 1em;
    border-radius: ${uiTokens.radius.xs};
    background: color-mix(in srgb, ${uiTokens.ink.secondary} 16%, ${uiTokens.surface.knockout});
  }
  ${skeletonPartRefs.root} {
    ${skeletonOptions.when({ shape: "circle" })} {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      corner-shape: round;
      flex: 0 0 auto;
    }
  }
  ${skeletonPartRefs.root} {
    ${skeletonOptions.when({ shape: "block" })} {
      height: 6rem;
      border-radius: ${uiTokens.radius.lg};
    }
  }
`;
