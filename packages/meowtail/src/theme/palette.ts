import { defineTokens } from "meowcss";

/**
 * UI redesign increments over `uiTokens` (docs/records/2026-10-09-ui-systematic-design, 1f).
 * Primary stays black/white; accent only marks what is happening now and where the reader is.
 * Existing `--ui-*` / `--chat-*` values the redesign changes live in `tokens.ts`, which references these.
 */
export const accentTokens = defineTokens("accent", {
  base: ["#4b6ea6", "#9db4dc"],
  /** User bubble, selected soft surfaces, accent-soft controls. */
  soft: ["#eef2f8", "rgb(157 180 220 / 14%)"],
  /** Current location (navigation selection, default tag). */
  selected: ["#e9eef6", "rgb(157 180 220 / 14%)"],
  /** Text on soft surfaces. */
  ink: ["#2f4d7a", "#9db4dc"],
  /** Hairline around accent surfaces. */
  line: ["rgb(75 110 166 / 30%)", "rgb(157 180 220 / 30%)"],
  /** Halo behind the processing indicator. */
  halo: ["rgb(75 110 166 / 30%)", "rgb(157 180 220 / 30%)"],
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
  unknown: ["#adb2b8", "#81858c"],
});

/** Radii scale: inline 8, control 10, card 14, floating 22. */
export const radiusTokens = defineTokens("radius", {
  tag: "6px",
  inline: "8px",
  control: "10px",
  card: "14px",
  float: "22px",
  bubble: "18px",
});

/** Hairlines: 0.5px borders; dividers at 8%. */
export const lineTokens = defineTokens("line", {
  width: "0.5px",
  divider: ["rgb(0 0 0 / 8%)", "rgb(255 255 255 / 8%)"],
  edge: ["rgb(0 0 0 / 12%)", "rgb(255 255 255 / 12%)"],
  quiet: ["rgb(0 0 0 / 6%)", "rgb(255 255 255 / 6%)"],
});

/** Layers used by redesign components: raised cards, sunken groups, neutral chips. */
export const layerTokens = defineTokens("layer", {
  raised: ["#ffffff", "#232324"],
  sunken: ["#fafbfc", "#1b1b1c"],
  chip: ["#f1f3f5", "rgb(255 255 255 / 8%)"],
  chipInk: ["#61666b", "#cfd3d6"],
  code: ["rgb(0 0 0 / 5%)", "rgb(255 255 255 / 8%)"],
  faint: ["#656a71", "#9aa0a7"],
});
