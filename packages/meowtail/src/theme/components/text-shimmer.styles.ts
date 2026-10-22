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
    color: ${uiTokens.foreground};
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
  ${partSelector(shimmer, "decoration")} * {
    color: inherit !important;
  }
  ${partSelector(shimmer, "decoration")} [data-shimmer-decoration] {
    background: currentColor;
  }
  ${partSelector(shimmer, "root")}[data-active="true"] > ${partSelector(shimmer, "content")} {
    color: color-mix(in srgb, currentColor 55%, transparent);
  }
  ${partSelector(shimmer, "root")}[data-active="true"] > ${partSelector(shimmer, "decoration")} {
    display: block;
    animation: ui-text-shimmer 1.6s linear infinite;
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
    ${partSelector(shimmer, "root")}[data-active="true"] > ${partSelector(shimmer, "decoration")} {
      display: none;
      animation: none;
    }
    ${partSelector(shimmer, "root")}[data-active="true"] > ${partSelector(shimmer, "content")} {
      color: inherit;
    }
  }
`;
