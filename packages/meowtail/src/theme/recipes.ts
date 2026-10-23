import { css, type CSSFragment } from "meowcss/meowjsx";
import { uiTokens } from "./tokens";

/*
 * Recipes carry the system's rules into any selector, the way a utility class
 * carries a scale. Each returns declarations (and, for interactive, nested
 * state rules) to interpolate inside a rule body:
 *
 *   ${partSelector(planContract, "root")} {
 *     ${surface("raised")}
 *     ${text("body")}
 *   }
 *
 * They hold role-level properties only. Geometry (padding, height, gap) stays
 * beside the part, where its optical exceptions are visible.
 */

/** A rung of the surface ladder with the one edge and depth that rung carries. */
export type SurfaceRung = "canvas" | "raised" | "overlay" | "fill";

const surfaces: Record<SurfaceRung, CSSFragment> = {
  // Regions on the canvas are split by an edge their parent draws; the canvas adds no fill step.
  canvas: css`
    background: ${uiTokens.surface.canvas};
    color: ${uiTokens.ink.primary};
  `,
  raised: css`
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.raised};
    box-shadow: ${uiTokens.shadow.raised};
    color: ${uiTokens.ink.primary};
    --meowui-focus-halo: ${uiTokens.surface.raised};
  `,
  overlay: css`
    border: 0;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.overlay};
    box-shadow: ${uiTokens.shadow.float};
    color: ${uiTokens.ink.primary};
    --meowui-focus-halo: ${uiTokens.surface.overlay};
  `,
  // A fill takes no edge: the tone step alone separates it.
  fill: css`
    border: 0;
    border-radius: ${uiTokens.radius.lg};
    background: ${uiTokens.surface.fill};
    box-shadow: none;
    color: ${uiTokens.ink.primary};
  `,
};

export function surface(rung: SurfaceRung): CSSFragment {
  return surfaces[rung];
}

/** The text roles `Text` exposes, plus the two title steps for a host's own headings. */
export type TextRole = "body" | "secondary" | "caption" | "eyebrow" | "title" | "pageTitle";

const texts: Record<TextRole, CSSFragment> = {
  body: css`
    color: ${uiTokens.ink.primary};
    font: 400 ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  `,
  secondary: css`
    color: ${uiTokens.ink.secondary};
    font: 400 ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  `,
  caption: css`
    color: ${uiTokens.ink.secondary};
    font: 400 ${uiTokens.type.caption} / 1.5 ${uiTokens.type.sans};
  `,
  // The one small-caps group label: menu headings, navigation groups, specimen labels.
  eyebrow: css`
    color: ${uiTokens.ink.tertiary};
    font: 500 ${uiTokens.type.micro} / 16px ${uiTokens.type.sans};
    letter-spacing: ${uiTokens.type.trackingCaps};
    text-transform: uppercase;
  `,
  // A container's name: card, dialog, panel.
  title: css`
    color: ${uiTokens.ink.primary};
    font: 600 ${uiTokens.type.title} / 1.4 ${uiTokens.type.sans};
    letter-spacing: ${uiTokens.type.trackingTight};
  `,
  pageTitle: css`
    color: ${uiTokens.ink.primary};
    font: 600 ${uiTokens.type.pageTitle} / 1.3 ${uiTokens.type.display};
    letter-spacing: ${uiTokens.type.trackingTight};
  `,
};

export function text(role: TextRole): CSSFragment {
  return texts[role];
}

/** The keyboard focus outline. Inset it inside a clipped scroller. */
export function focusRing(options: { inset?: boolean } = {}): CSSFragment {
  return options.inset
    ? css`
        outline: 2px solid ${uiTokens.state.focus};
        outline-offset: -2px;
      `
    : css`
        outline: 2px solid ${uiTokens.state.focus};
        outline-offset: 2px;
      `;
}

export interface InteractiveOptions {
  /**
   * What the element rests on. `raised` paints the hover overlay over its own
   * background so the rung stays; `flat` (a transparent control) takes the
   * overlay as its background.
   */
  on: "raised" | "flat";
  /** How a press reads: the active overlay (default) or a settled shadow for filled actions. */
  pressed?: "active" | "shadow";
}

/**
 * Hover, press, keyboard focus and disabled for something the reader operates.
 * Hover stays behind `(hover: hover)` so touch never sticks in a hover state.
 */
export function interactive({ on, pressed = "active" }: InteractiveOptions): CSSFragment {
  const overlay = (tone: string) =>
    on === "raised"
      ? `background-image: linear-gradient(${tone}, ${tone});`
      : `background-color: ${tone};`;
  return css`
    cursor: pointer;
    transition:
      background-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      box-shadow ${uiTokens.motion.response} ${uiTokens.motion.ease},
      color ${uiTokens.motion.response} ${uiTokens.motion.ease};
    @media (hover: hover) {
      &:hover:not(:disabled, [aria-disabled="true"]) {
        ${overlay(String(uiTokens.state.hover))}
      }
    }
    &:active:not(:disabled, [aria-disabled="true"]) {
      ${pressed === "shadow" ? `box-shadow: ${uiTokens.shadow.pressed};` : overlay(String(uiTokens.state.active))}
      transition-duration: ${uiTokens.motion.instant};
    }
    &:focus-visible {
      ${focusRing()}
    }
    &:is(:disabled, [aria-disabled="true"]) {
      color: ${uiTokens.ink.tertiary};
      box-shadow: none;
      cursor: not-allowed;
    }
    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `;
}
