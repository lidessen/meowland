import { defineTokens } from "meowcss";

/**
 * UI redesign increments over `uiTokens` (docs/records/2026-10-09-ui-systematic-design, 1f).
 * Primary stays black/white; accent only marks what is happening now and where the reader is.
 * Existing `--ui-*` / `--chat-*` values the redesign changes live in `tokens.ts`, which references these.
 */
export const accentTokens = defineTokens("accent", {
  base: ["#2563eb", "#60a5fa"],
  /** Selected soft surfaces and accent-soft controls. */
  soft: ["#eff4ff", "rgb(96 165 250 / 14%)"],
  /** Current location (navigation selection, default tag). */
  selected: ["#ebf1fe", "rgb(96 165 250 / 15%)"],
  /** Text on soft surfaces. */
  ink: ["#1d4ed8", "#93c5fd"],
  /** Hairline around accent surfaces. */
  line: ["rgb(37 99 235 / 28%)", "rgb(96 165 250 / 30%)"],
  /** Halo behind the processing indicator. */
  halo: ["rgb(37 99 235 / 28%)", "rgb(96 165 250 / 30%)"],
});

/** Status semantics: accent pulse = now, success = returned/connected, warning = needs you. */
export const statusTokens = defineTokens("status", {
  processing: ["var(--accent-base)", "var(--accent-base)"],
  success: ["#22c55e", "#22c55e"],
  /** Success as text: the bright marker green is too light to read on white. */
  successInk: ["#22863a", "#22c55e"],
  successHalo: ["rgb(34 197 94 / 18%)", "rgb(34 197 94 / 18%)"],
  warning: ["#dd8629", "#dd8629"],
  danger: ["#b91c1c", "#f25a5a"],
  /** Hollow marker for states not verified: it does not pretend to know. */
  unknown: ["#a3a3a3", "#737373"],
});

/**
 * Radii scale, chosen by the element's size: mark 4 (key caps, skeleton lines,
 * glyph tiles up to 20px), tag 6, inline 8 (24-32px elements), control 10
 * (36-44px controls and tiles), card 14 (bordered surfaces), floating 22.
 */
export const radiusTokens = defineTokens("radius", {
  mark: "4px",
  tag: "6px",
  inline: "8px",
  control: "10px",
  card: "14px",
  float: "22px",
  bubble: "18px",
});

/** Edges are crisp 1px neutral lines; dividers sit a step lighter. */
export const lineTokens = defineTokens("line", {
  width: "1px",
  divider: ["rgb(0 0 0 / 7%)", "rgb(255 255 255 / 7%)"],
  edge: ["rgb(0 0 0 / 10%)", "rgb(255 255 255 / 10%)"],
  quiet: ["rgb(0 0 0 / 5%)", "rgb(255 255 255 / 5%)"],
});

/** Layers used by redesign components: raised cards, sunken groups, neutral chips. */
export const layerTokens = defineTokens("layer", {
  raised: ["#ffffff", "#1f1f1f"],
  /** Recessed regions: code, table headers, nested panels. Same tone as uiTokens.codeSurface. */
  sunken: ["#fafafa", "#1c1c1c"],
  chip: ["#f5f5f5", "rgb(255 255 255 / 8%)"],
  chipInk: ["#6b6b6b", "#d4d4d4"],
  code: ["rgb(0 0 0 / 5%)", "rgb(255 255 255 / 8%)"],
  faint: ["#767676", "#8f8f8f"],
});
