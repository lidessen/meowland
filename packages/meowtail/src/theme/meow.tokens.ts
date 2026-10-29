import { defineTokens } from "meowcss";
import { standardUiTokenValues, type UiTokenValues } from "./tokens";

/**
 * Meow: the standard theme recolored after the Meowland mark. Black carries the page (ink, filled
 * actions, the inverse surfaces and, in the dark scheme, the ground), the mark's red is the one
 * accent (focus, selection, the current place and links), and the light ground is the mark's
 * paper. Type, spacing, radii, control heights, depth and motion keep the standard values, so every
 * component keeps its geometry and behavior.
 */
export const meowUiTokenValues = {
  surface: {
    canvas: ["#faf8f3", "#0a0a0a"],
    reading: ["#fffdf8", "#0a0a0a"],
    raised: ["#fffdf8", "#141414"],
    overlay: ["#ffffff", "#1c1c1c"],
    fill: ["#f0ece4", "#1f1f1f"],
    field: ["#fffdf8", "#101010"],
    tint: ["rgb(10 10 10 / 5%)", "rgb(255 255 255 / 8%)"],
    knockout: ["#fffdf8", "#141414"],
    scrim: ["rgb(10 10 10 / 32%)", "rgb(0 0 0 / 64%)"],
  },
  inverse: {
    surface: ["#0a0a0a", "#262626"],
    ink: "#ffffff",
    action: "#ff6b6e",
  },
  line: {
    width: "1px",
    edge: ["rgb(10 10 10 / 10%)", "rgb(255 255 255 / 10%)"],
    divider: ["rgb(10 10 10 / 7%)", "rgb(255 255 255 / 7%)"],
    control: ["rgb(10 10 10 / 16%)", "rgb(255 255 255 / 16%)"],
    controlHover: ["rgb(10 10 10 / 32%)", "rgb(255 255 255 / 30%)"],
  },
  ink: {
    primary: ["#0a0a0a", "#f5f5f5"],
    secondary: ["#5a5a5a", "#a8a8a8"],
    tertiary: ["#666666", "#8f8f8f"],
    chip: ["#5a5a5a", "#d4d4d4"],
    reading: ["#1a1a1a", "#e5e5e5"],
  },
  state: {
    hover: ["rgb(10 10 10 / 4.5%)", "rgb(255 255 255 / 7%)"],
    active: ["rgb(10 10 10 / 8%)", "rgb(255 255 255 / 12%)"],
    focus: ["#d0141b", "#ff4d4f"],
    focusRing: ["rgb(231 28 34 / 22%)", "rgb(255 77 79 / 30%)"],
  },
  action: {
    primary: ["#0a0a0a", "#f5f5f5"],
    primaryHover: ["#2a2a2a", "#d9d9d9"],
    onPrimary: ["#ffffff", "#0a0a0a"],
    soft: ["#efebe3", "#262626"],
    danger: ["#b3141a", "#ff5a5f"],
    onDanger: ["#ffffff", "#0a0a0a"],
  },
  control: {
    ...standardUiTokenValues.control,
    thumb: ["#ffffff", "#333333"],
    knob: ["#ffffff", "#a8a8a8"],
  },
  accent: {
    base: ["#e71c22", "#ff3b40"],
    soft: ["#fdecec", "rgb(255 59 64 / 12%)"],
    selected: ["#fbe3e3", "rgb(255 59 64 / 16%)"],
    ink: ["#c4141b", "#ff6b6e"],
    line: ["rgb(231 28 34 / 30%)", "rgb(255 59 64 / 35%)"],
    halo: ["rgb(231 28 34 / 24%)", "rgb(255 59 64 / 30%)"],
  },
  status: {
    info: ["#2563eb", "#60a5fa"],
    success: ["#15803d", "#4ade80"],
    warning: ["#a85c00", "#f0a04b"],
    danger: ["#c81e1e", "#ff5a5f"],
    unknown: ["#a3a3a3", "#737373"],
  },
  type: standardUiTokenValues.type,
  space: standardUiTokenValues.space,
  icon: standardUiTokenValues.icon,
  radius: standardUiTokenValues.radius,
  shadow: standardUiTokenValues.shadow,
  motion: standardUiTokenValues.motion,
  layout: standardUiTokenValues.layout,
  glyph: {
    ...standardUiTokenValues.glyph,
    selectChevron: [
      `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235a5a5a' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
      `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a8a8a8' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    ],
  },
} as const satisfies UiTokenValues;

/** The Meow values under the shared `ui` names, so every standard theme rule paints with them. */
export const meowUiTokens = /* @__PURE__ */ defineTokens("ui", meowUiTokenValues);
