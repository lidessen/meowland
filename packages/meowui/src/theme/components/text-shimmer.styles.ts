import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { textShimmerContract as shimmer } from "../../components/text-shimmer";

export const textShimmerStyles = css`
  ${partSelector(shimmer, "root")} {
    position: relative;
    display: inline-block;
    max-width: 100%;
    min-width: 0;
    vertical-align: top;
  }
  ${partSelector(shimmer, "content")} {
    color: inherit;
  }
  ${partSelector(shimmer, "decoration")} {
    display: none;
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    user-select: none;
    color: ${uiTokens.shimmer};
    mask-image: linear-gradient(105deg, transparent 35%, black 50%, transparent 65%);
    mask-size: 300% 100%;
  }
  ${partSelector(shimmer, "decoration")} * {
    color: inherit !important;
  }
  ${partSelector(shimmer, "decoration")} [data-shimmer-decoration] {
    background: currentColor;
  }
  ${partSelector(shimmer, "root")}[data-active="true"] > ${partSelector(shimmer, "decoration")} {
    display: block;
    animation: ui-text-shimmer 1.5s linear 0.3s infinite;
  }
  @keyframes ui-text-shimmer {
    0% {
      mask-position: 100% 0;
      opacity: 0;
    }
    10% {
      opacity: 0.7;
    }
    65% {
      mask-position: 0 0;
      opacity: 0.7;
    }
    100% {
      mask-position: 0 0;
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(shimmer, "root")}[data-active="true"] > ${partSelector(shimmer, "decoration")} {
      display: none;
      animation: none;
    }
  }
`;
