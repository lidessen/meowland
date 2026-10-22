import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { skeletonContract, skeletonOptions } from "../../components/skeleton";
import { skeletonBoundaryContract } from "../../components/skeleton-boundary";

export const skeletonStyles = css`
  ${partSelector(skeletonBoundaryContract, "root")},
  ${partSelector(skeletonBoundaryContract, "content")} {
    min-width: 0;
  }
  ${partSelector(skeletonBoundaryContract, "status")} {
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
  ${partSelector(skeletonContract, "root")} {
    display: block;
    width: 100%;
    height: 1em;
    border-radius: ${uiTokens.radius.xs};
    background: color-mix(in srgb, ${uiTokens.ink.secondary} 16%, ${uiTokens.surface.knockout});
  }
  ${partSelector(skeletonContract, "root")} {
    ${skeletonOptions.when({ shape: "circle" })} {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      corner-shape: round;
      flex: 0 0 auto;
    }
  }
  ${partSelector(skeletonContract, "root")} {
    ${skeletonOptions.when({ shape: "block" })} {
      height: 6rem;
      border-radius: ${uiTokens.radius.lg};
    }
  }
`;
