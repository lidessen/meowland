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

/**
 * Lines have three jobs and no others: `edge` outlines a raised or overlay surface
 * and splits regions at canvas level; `divider` separates rows inside one surface;
 * `control` bounds something the reader operates (fields, outline actions,
 * checkboxes), with `controlHover` under the pointer. `quiet` is a legacy alias of
 * `divider`. All are 1px.
 */
export const lineTokens = defineTokens("line", {
  width: "1px",
  edge: ["rgb(0 0 0 / 8%)", "rgb(255 255 255 / 9%)"],
  divider: ["rgb(0 0 0 / 6%)", "rgb(255 255 255 / 6%)"],
  control: ["rgb(0 0 0 / 13%)", "rgb(255 255 255 / 14%)"],
  controlHover: ["rgb(0 0 0 / 24%)", "rgb(255 255 255 / 28%)"],
  quiet: ["rgb(0 0 0 / 6%)", "rgb(255 255 255 / 6%)"],
});

/**
 * The surface ladder. Every background is one of these roles, and each role has
 * one edge rule (see packages/meowtail/AGENTS.md, "Surface ladder"):
 * - canvas: the page ground; regions on it are split by an edge, not a new fill.
 * - reading: a full-bleed reading surface (the chat transcript); no edge.
 * - raised: in-flow cards, lists and tables, on an edge. Lighter than canvas.
 * - overlay: menus, popovers, dialogs; a ring and a floating shadow.
 * - fill: recessed or neutral fills (code, chips, tracks, bubbles, the composer); no edge.
 * - field: where the reader types; a control line. In dark it is darker than
 *   raised, because a field is recessed, not elevated.
 * - knockout: the color "behind" a halo or cutout; defaults to raised.
 * Dark lightness steps up with elevation: canvas < raised < overlay.
 * `sunken` and `chip` are legacy aliases of `fill`.
 */
export const layerTokens = defineTokens("layer", {
  canvas: ["#fafafa", "#121212"],
  reading: ["#ffffff", "#121212"],
  raised: ["#ffffff", "#1a1a1a"],
  overlay: ["#ffffff", "#202020"],
  fill: ["#f2f2f2", "#242424"],
  field: ["#ffffff", "#161616"],
  knockout: ["#ffffff", "#1a1a1a"],
  sunken: ["#f2f2f2", "#242424"],
  chip: ["#f2f2f2", "#242424"],
  chipInk: ["#636363", "#d4d4d4"],
  code: ["rgb(0 0 0 / 5%)", "rgb(255 255 255 / 8%)"],
  faint: ["#6e6e6e", "#8f8f8f"],
});
