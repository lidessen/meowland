import { defineTokens } from "meowcss";
import { standardUiTokenValues, type UiTokenValues } from "./tokens";

const serif =
  '"Iowan Old Style", Charter, "Palatino Linotype", Palatino, "Book Antiqua", Georgia, "Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", serif';

/**
 * Journal: the same roles as the standard theme, valued for blogs and long-form reading. Warm
 * paper surfaces and ink, serif titles and reading copy over sans controls, one terracotta accent,
 * flat surfaces with small radii, a larger reading size and more generous spacing. Control heights,
 * icon sizes, motion and the code face keep the standard values, so every component keeps its
 * geometry and behavior.
 */
export const journalUiTokenValues = {
  surface: {
    canvas: ["#f6f3ec", "#171512"],
    reading: ["#fbf9f4", "#171512"],
    raised: ["#fffdf8", "#1f1c18"],
    overlay: ["#fffdf9", "#26231f"],
    fill: ["#efeae0", "#2b2722"],
    field: ["#fffdf8", "#1b1915"],
    tint: ["rgb(70 50 20 / 6%)", "rgb(255 240 220 / 8%)"],
    knockout: ["#fffdf8", "#1f1c18"],
    scrim: ["rgb(30 20 10 / 28%)", "rgb(0 0 0 / 55%)"],
  },
  inverse: {
    surface: ["#2a2520", "#3d3731"],
    ink: "#fbf7ef",
    action: "#f0b08f",
  },
  line: {
    width: "1px",
    edge: ["rgb(60 40 20 / 12%)", "rgb(255 240 220 / 10%)"],
    divider: ["rgb(60 40 20 / 9%)", "rgb(255 240 220 / 7%)"],
    control: ["rgb(60 40 20 / 20%)", "rgb(255 240 220 / 16%)"],
    controlHover: ["rgb(60 40 20 / 34%)", "rgb(255 240 220 / 30%)"],
  },
  ink: {
    primary: ["#1f1a14", "#efe8dc"],
    secondary: ["#5a5045", "#b8ad9e"],
    tertiary: ["#665c50", "#a0958a"],
    chip: ["#5a5045", "#d6ccbd"],
  },
  state: {
    hover: ["rgb(60 40 20 / 5%)", "rgb(255 240 220 / 7%)"],
    active: ["rgb(60 40 20 / 9%)", "rgb(255 240 220 / 12%)"],
    focus: ["#a4461f", "#e6936a"],
    focusRing: ["rgb(164 70 31 / 22%)", "rgb(230 147 106 / 30%)"],
  },
  action: {
    primary: ["#1f1a14", "#efe8dc"],
    primaryHover: ["#3a3229", "#d9d0c2"],
    onPrimary: ["#fbf7ef", "#1f1a14"],
    soft: ["#ece6da", "#332e28"],
    danger: ["#a3261c", "#f07a6a"],
    onDanger: ["#ffffff", "#1f1a14"],
  },
  control: {
    ...standardUiTokenValues.control,
    thumb: ["#fffdf8", "#4a443c"],
    knob: ["#fffdf8", "#b8ad9e"],
  },
  accent: {
    base: ["#a4461f", "#e6936a"],
    soft: ["#f7ebe2", "rgb(230 147 106 / 14%)"],
    selected: ["#f4e6db", "rgb(230 147 106 / 16%)"],
    ink: ["#8a3815", "#f0b08f"],
    line: ["rgb(164 70 31 / 30%)", "rgb(230 147 106 / 32%)"],
    halo: ["rgb(164 70 31 / 30%)", "rgb(230 147 106 / 32%)"],
  },
  status: {
    info: ["#2c5d8a", "#7fb0dc"],
    success: ["#3d6b2f", "#8cc47a"],
    warning: ["#8a5300", "#e0a656"],
    danger: ["#a3261c", "#f07a6a"],
    unknown: ["#a39a8c", "#6f675d"],
  },
  type: {
    ...standardUiTokenValues.type,
    display: serif,
    reading: serif,
    code: "13px",
    readingSize: "18px",
    title: "20px",
    heading: "28px",
    pageTitle: "38px",
    hero: "56px",
    line: {
      ...standardUiTokenValues.type.line,
      code: "20px",
      reading: "30px",
      title: "28px",
      heading: "36px",
      pageTitle: "46px",
      hero: "64px",
    },
    trackingTight: "-0.012em",
    trackingCaps: "0.08em",
  },
  space: {
    group: "8px",
    section: "28px",
    panel: "32px",
    prose: "20px",
    insetBlock: "16px",
    insetInline: "20px",
    pageBlock: "64px",
    pageInline: "48px",
    pageBlockCompact: "28px",
    pageInlineCompact: "20px",
  },
  icon: standardUiTokenValues.icon,
  radius: {
    xs: "2px",
    sm: "3px",
    md: "4px",
    lg: "6px",
    xl: "8px",
    xxl: "12px",
    full: "999px",
  },
  shadow: {
    raised: ["none", "none"],
    field: ["none", "none"],
    action: ["0 1px 0 rgb(60 40 20 / 6%)", "none"],
    filled: ["none", "none"],
    thumb: ["0 0 0 1px rgb(60 40 20 / 10%)", "0 0 0 1px rgb(255 240 220 / 10%)"],
    pressed: "inset 0 1px 2px rgb(60 40 20 / 14%)",
    sheet: ["12px 0 40px rgb(60 40 20 / 12%)", "12px 0 40px rgb(0 0 0 / 50%)"],
    knob: ["0 1px 2px rgb(60 40 20 / 18%)", "0 1px 2px rgb(0 0 0 / 40%)"],
    dock: ["0 8px 24px -8px rgb(60 40 20 / 14%)", "0 10px 24px -6px rgb(0 0 0 / 45%)"],
    float: [
      "0 0 0 1px rgb(60 40 20 / 10%), 0 12px 32px -12px rgb(60 40 20 / 22%)",
      "0 0 0 1px rgb(255 240 220 / 10%), 0 12px 32px -12px rgb(0 0 0 / 60%)",
    ],
  },
  motion: standardUiTokenValues.motion,
  layout: {
    ...standardUiTokenValues.layout,
    containerContent: "680px",
    containerPage: "960px",
    measure: "66ch",
  },
  glyph: {
    ...standardUiTokenValues.glyph,
    selectChevron: [
      `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235a5045' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
      `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23b8ad9e' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    ],
  },
} as const satisfies UiTokenValues;

/** The Journal values under the shared `ui` names, so every standard theme rule paints with them. */
export const journalUiTokens = /* @__PURE__ */ defineTokens("ui", journalUiTokenValues);
