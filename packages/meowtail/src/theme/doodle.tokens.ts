import { defineTokens, tokenRef } from "meowcss";
import type { ThemeFont } from "./journal.tokens";
import { standardUiTokenValues, type UiTokenValues } from "./tokens";

const sans =
  '"Geist Variable", Geist, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif';
const inkLift = ["0 2px 0 #171715", "0 2px 0 #0a0a09"] as const;
const drawnEdge = [
  "0 0 0 1px #171715, 0 3px 0 1px #171715",
  "0 0 0 1px #655d53, 0 3px 0 1px #0a0a09",
] as const;

/**
 * Doodle is an editorial paper-and-ink theme. A crisp, slightly offset ink edge marks important
 * surfaces and actions; quiet dividers, clean type, and a sparse marker palette keep dense
 * content readable. Illustrations and brand marks belong to the application, not the theme.
 */
export const doodleUiTokenValues = {
  ...standardUiTokenValues,
  canvas: {
    wash: [
      "radial-gradient(ellipse 540px 430px at 0% 0%, #f1e5ca 0%, transparent 96%), radial-gradient(ellipse 500px 420px at 100% 60%, #dceef8 0%, transparent 96%)",
      "radial-gradient(ellipse 540px 430px at 0% 0%, #29231f 0%, transparent 96%), radial-gradient(ellipse 500px 420px at 100% 60%, #222934 0%, transparent 96%)",
    ],
    selection: ["#f6db87", "#745927"],
  },
  marker: {
    blue: ["#a8d8ef", "#2d536d"],
    ochre: ["#f6db87", "#66512a"],
    coral: ["#ff9787", "#723b31"],
  },
  button: {
    filledStroke: "2px",
    outlineStroke: "2px",
    pressOffset: "2px",
    filledPressed: String(tokenRef("ui", "shadow", "pressed")),
    outlinePressed: String(tokenRef("ui", "shadow", "pressed")),
  },
  surface: {
    canvas: ["#f9f8f4", "#191817"],
    reading: ["#f9f8f4", "#191817"],
    raised: ["#ffffff", "#24221f"],
    overlay: ["#fffdf6", "#2b2824"],
    fill: ["#f3f1ea", "#302d29"],
    field: ["#fffefa", "#201e1b"],
    tint: ["rgb(23 23 21 / 5%)", "rgb(251 243 229 / 8%)"],
    knockout: ["#ffffff", "#24221f"],
    scrim: ["rgb(23 23 21 / 26%)", "rgb(0 0 0 / 58%)"],
  },
  inverse: { surface: ["#171715", "#393126"], ink: "#fbf3e5", action: "#acc7ec" },
  line: {
    ...standardUiTokenValues.line,
    width: "1px",
    raisedWidth: "2px",
    edge: ["#171715", "#746a5d"],
    divider: ["#ddd8ce", "#443e37"],
    control: ["#57534c", "#877b6c"],
    controlHover: ["#171715", "#b6a790"],
  },
  ink: {
    primary: ["#171715", "#fbf3e5"],
    secondary: ["#57534c", "#c6bbab"],
    tertiary: ["#685f52", "#b5a997"],
    chip: ["#50483c", "#e3d7c5"],
    reading: ["#292620", "#ebdfcc"],
  },
  state: {
    hover: ["rgb(0 109 204 / 7%)", "rgb(129 194 255 / 9%)"],
    active: ["rgb(0 109 204 / 13%)", "rgb(129 194 255 / 16%)"],
    focus: ["#006dcc", "#94b9e7"],
    focusRing: ["rgb(0 109 204 / 23%)", "rgb(129 194 255 / 30%)"],
  },
  action: {
    primary: ["#0065be", "#345e96"],
    primaryHover: ["#0055a2", "#3f6ea9"],
    onPrimary: ["#ffffff", "#f7fbff"],
    soft: ["#f7e9bc", "#3e3220"],
    danger: ["#b93125", "#8b4139"],
    onDanger: ["#ffffff", "#fff2ee"],
  },
  control: {
    ...standardUiTokenValues.control,
    regular: "44px",
    large: "48px",
    thumb: ["#ffffff", "#514333"],
    knob: ["#ffffff", "#fbf3e5"],
  },
  accent: {
    base: ["#0065be", "#94b9e7"],
    soft: ["#eaf4fc", "#23364a"],
    selected: ["#dceefb", "#2a4056"],
    ink: ["#00599f", "#acc7ec"],
    line: ["#a6c9e6", "#54718e"],
    halo: ["rgb(0 109 204 / 25%)", "rgb(129 194 255 / 30%)"],
  },
  status: {
    info: ["#0065be", "#94b9e7"],
    success: ["#235b43", "#a0e0bf"],
    warning: ["#8a460f", "#ffd29a"],
    danger: ["#b93125", "#f0a392"],
    unknown: ["#827a6c", "#a79b89"],
  },
  type: {
    ...standardUiTokenValues.type,
    sans,
    display: sans,
    reading: sans,
    weight: { ...standardUiTokenValues.type.weight, display: "700" },
    leading: "1.55",
    trackingTight: "-0.035em",
  },
  radius: {
    ...standardUiTokenValues.radius,
    md: "10px",
    lg: "12px",
    xl: "16px",
    xxl: "20px",
  },
  shadow: {
    ...standardUiTokenValues.shadow,
    raised: inkLift,
    field: ["none", "none"],
    action: inkLift,
    filled: inkLift,
    pressed: "none",
    float: drawnEdge,
    dock: drawnEdge,
  },
  motion: { ...standardUiTokenValues.motion, response: "150ms" },
  glyph: {
    ...standardUiTokenValues.glyph,
    selectChevron: [
      `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2357534c' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
      `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23c6bbab' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    ],
  },
} as const satisfies UiTokenValues;

export const doodleUiTokens = /* @__PURE__ */ defineTokens("ui", doodleUiTokenValues);

/** Optional Geist web font; system and CJK faces come from the host. */
export const doodleFonts = [
  { family: "Geist Variable", package: "@fontsource-variable/geist", styles: ["normal"] },
] as const satisfies readonly ThemeFont[];
