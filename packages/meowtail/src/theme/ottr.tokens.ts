import { defineTokens } from "meowcss";
import { standardUiTokenValues, type UiTokenValues } from "./tokens";

const sans =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "PingFang SC", "Segoe UI", system-ui, sans-serif';
const mono = '"SF Mono", ui-monospace, Menlo, Consolas, monospace';
const softDepth = [
  "0 1px 2px rgb(20 20 19 / 4%), 0 8px 24px rgb(20 20 19 / 6%)",
  "0 1px 2px rgb(0 0 0 / 25%), 0 10px 30px rgb(0 0 0 / 35%)",
] as const;

function selectChevron(ink: string): string {
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${ink}' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;
}

/**
 * Ottr translates the Tasks prototype into shared roles: warm paper and charcoal, mint for
 * primary actions and selection, compact system type, soft corners, and hairline-separated planes.
 * Text uses stronger variants of the prototype colors where small labels need more contrast.
 */
export const ottrUiTokenValues = {
  ...standardUiTokenValues,
  surface: {
    canvas: ["#faf9f5", "#1f1e1d"],
    reading: ["#faf9f5", "#1f1e1d"],
    raised: ["#ffffff", "#262523"],
    overlay: ["#ffffff", "#2d2b29"],
    fill: ["#f0eee6", "#34322f"],
    field: ["#ffffff", "#191918"],
    tint: ["rgb(20 20 19 / 4.5%)", "rgb(255 245 230 / 4.5%)"],
    knockout: ["#ffffff", "#262523"],
    scrim: ["rgb(20 20 19 / 24%)", "rgb(0 0 0 / 56%)"],
  },
  inverse: {
    surface: ["#141413", "#34322f"],
    ink: "#faf9f5",
    action: "#8ad3bd",
  },
  line: {
    width: "1px",
    edge: ["#e3dfd3", "#3b3834"],
    divider: ["#ece9df", "#34322f"],
    control: ["#d4cfbf", "#514d47"],
    controlHover: ["#928b7b", "#8e887d"],
  },
  ink: {
    primary: ["#141413", "#e8e6dc"],
    secondary: ["#6b675f", "#b4aea2"],
    tertiary: ["#6b675f", "#a39e93"],
    chip: ["#5f5b52", "#c0baaf"],
    reading: ["#34322c", "#d1cdc1"],
  },
  state: {
    hover: ["rgb(20 20 19 / 4.5%)", "rgb(255 245 230 / 4.5%)"],
    active: ["rgb(20 20 19 / 8%)", "rgb(255 245 230 / 9%)"],
    focus: ["#2c7765", "#5bb99f"],
    focusRing: ["rgb(63 143 122 / 25%)", "rgb(91 185 159 / 30%)"],
  },
  action: {
    primary: ["#2c7765", "#3f9c82"],
    primaryHover: ["#246654", "#5bb99f"],
    onPrimary: ["#ffffff", "#101b16"],
    soft: ["#f0eee6", "#34322f"],
    danger: ["#ad3b2b", "#e8705f"],
    onDanger: ["#fff8ee", "#211613"],
  },
  control: {
    ...standardUiTokenValues.control,
    regular: "32px",
    inset: "8px",
    fieldInset: "10px",
    thumb: ["#ffffff", "#4a4741"],
    knob: ["#ffffff", "#e8e6dc"],
  },
  accent: {
    base: ["#2b705e", "#5bb99f"],
    soft: ["rgb(63 143 122 / 6%)", "rgb(91 185 159 / 7%)"],
    selected: ["rgb(63 143 122 / 13%)", "rgb(91 185 159 / 16%)"],
    ink: ["#246654", "#87d1bb"],
    line: ["rgb(63 143 122 / 25%)", "rgb(91 185 159 / 28%)"],
    halo: ["rgb(63 143 122 / 25%)", "rgb(91 185 159 / 28%)"],
  },
  status: {
    info: ["#336592", "#81afd9"],
    success: ["#426b29", "#9abc7b"],
    warning: ["#84560f", "#e3b25f"],
    danger: ["#a8392a", "#f08d7e"],
    unknown: ["#938d82", "#928c81"],
  },
  type: {
    ...standardUiTokenValues.type,
    sans,
    display: sans,
    reading: sans,
    mono,
    label: "12px",
    body: "13px",
    readingSize: "14px",
    heading: "19px",
    pageTitle: "23px",
    line: {
      ...standardUiTokenValues.type.line,
      label: "18px",
      body: "20px",
      reading: "22px",
      heading: "26px",
      pageTitle: "30px",
    },
    weight: {
      ...standardUiTokenValues.type.weight,
      display: "650",
    },
    leading: "1.5",
    trackingTight: "-0.02em",
  },
  space: {
    ...standardUiTokenValues.space,
    group: "6px",
    section: "18px",
    panel: "22px",
    insetBlock: "10px",
    insetInline: "12px",
    pageBlock: "24px",
    pageInline: "26px",
  },
  radius: {
    xs: "5px",
    sm: "7px",
    md: "8px",
    lg: "9px",
    xl: "11px",
    xxl: "14px",
    full: "999px",
  },
  shadow: {
    ...standardUiTokenValues.shadow,
    action: ["0 1px 2px rgb(20 20 19 / 4%)", "0 1px 2px rgb(0 0 0 / 24%)"],
    filled: ["0 1px 2px rgb(20 20 19 / 10%)", "0 1px 2px rgb(0 0 0 / 30%)"],
    float: softDepth,
    dock: softDepth,
  },
  motion: { ...standardUiTokenValues.motion, response: "120ms" },
  glyph: {
    ...standardUiTokenValues.glyph,
    selectChevron: [selectChevron("6b675f"), selectChevron("b4aea2")],
  },
} as const satisfies UiTokenValues;

/** The Ottr values under the shared `ui` token names. */
export const ottrUiTokens = /* @__PURE__ */ defineTokens("ui", ottrUiTokenValues);
