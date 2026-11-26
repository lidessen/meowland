import { defineTokens } from "meowcss";
import type { ThemeFont } from "./journal.tokens";
import { standardUiTokenValues, type UiTokenValues } from "./tokens";

const sans =
  '"Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif';
const mono = '"IBM Plex Mono", ui-monospace, "SF Mono", Consolas, Menlo, monospace';
const accent = ["#206347", "#b7e9c5"] as const;
const muted = ["#4c5a51", "#adb8c2"] as const;
const depth = ["0 14px 36px rgb(20 33 26 / 5%)", "0 16px 36px rgb(6 9 13 / 25%)"] as const;

function selectChevron(ink: string): string {
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${ink.slice(1)}' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;
}

/**
 * Pine borrows Keyref's off-white and blue-black planes, evergreen/light mint actions, and
 * lavender-blue secondary cues. Thin dividers and soft elevation keep attention on the work.
 */
export const pineUiTokenValues = {
  ...standardUiTokenValues,
  surface: {
    ...standardUiTokenValues.surface,
    canvas: ["#f7f8f5", "#11151a"],
    reading: ["#f7f8f5", "#11151a"],
    raised: ["#ffffff", "#1a2027"],
    overlay: ["#ffffff", "#202832"],
    fill: ["#edf0eb", "#202832"],
    field: ["#ffffff", "#151b21"],
    tint: ["rgb(23 31 27 / 5%)", "rgb(241 243 238 / 7%)"],
    knockout: ["#ffffff", "#1a2027"],
    scrim: ["rgb(17 23 28 / 24%)", "rgb(6 9 13 / 55%)"],
  },
  inverse: {
    surface: ["#11171c", "#252f39"],
    ink: "#edf3ef",
    action: "#a6e4bd",
  },
  line: {
    ...standardUiTokenValues.line,
    edge: ["#d8ddd6", "#343e4a"],
    divider: ["#e1e5df", "#303b42"],
    control: ["#bbc5bc", "#495766"],
    controlHover: ["#83988a", "#8293a3"],
  },
  ink: {
    primary: ["#171f1b", "#f1f3ee"],
    secondary: muted,
    tertiary: ["#626f66", "#9ba9b4"],
    chip: ["#435349", "#c8d2da"],
    reading: ["#303d34", "#dce4e1"],
  },
  state: {
    hover: ["rgb(32 99 71 / 6%)", "rgb(183 233 197 / 8%)"],
    active: ["rgb(32 99 71 / 12%)", "rgb(183 233 197 / 14%)"],
    focus: accent,
    focusRing: ["rgb(32 99 71 / 22%)", "rgb(183 233 197 / 28%)"],
  },
  action: {
    primary: ["#205e44", "#b7e9c5"],
    primaryHover: ["#184d37", "#d2f4dc"],
    onPrimary: ["#f2fff6", "#14291d"],
    soft: ["#edf0eb", "#253d31"],
    danger: ["#9e342b", "#f6a69d"],
    onDanger: ["#ffffff", "#28120f"],
  },
  control: {
    ...standardUiTokenValues.control,
    thumb: ["#ffffff", "#343e4a"],
    knob: ["#ffffff", "#e1efe6"],
  },
  accent: {
    base: accent,
    soft: ["#e1efe6", "#253d31"],
    selected: ["#dbece1", "#294236"],
    ink: ["#205e44", "#b7e9c5"],
    line: ["rgb(32 99 71 / 30%)", "rgb(183 233 197 / 34%)"],
    halo: ["rgb(32 99 71 / 22%)", "rgb(183 233 197 / 28%)"],
  },
  status: {
    info: ["#43559c", "#becbff"],
    success: ["#206347", "#a6e4bd"],
    warning: ["#815409", "#e6c479"],
    danger: ["#9e342b", "#f6a69d"],
    unknown: ["#8b978e", "#7f8c98"],
  },
  terminal: {
    surface: "#11171c",
    ink: "#edf3ef",
    command: "#a6e4bd",
    muted: "#afb9c4",
    prompt: "#a6e4bd",
    divider: "#303b42",
    focus: "#b7e9c5",
    danger: "#f6a69d",
    success: "#a6e4bd",
    warning: "#e6c479",
    info: "#afc6eb",
    reference: "#becbff",
  },
  type: {
    ...standardUiTokenValues.type,
    sans,
    display: sans,
    reading: sans,
    mono,
    trackingTight: "-0.025em",
  },
  radius: {
    ...standardUiTokenValues.radius,
    lg: "8px",
    xl: "14px",
    xxl: "18px",
  },
  shadow: {
    ...standardUiTokenValues.shadow,
    action: ["none", "none"],
    filled: ["none", "none"],
    dock: depth,
    float: depth,
  },
  glyph: {
    ...standardUiTokenValues.glyph,
    selectChevron: [selectChevron(muted[0]), selectChevron(muted[1])],
  },
} as const satisfies UiTokenValues;

export const pineUiTokens = /* @__PURE__ */ defineTokens("ui", pineUiTokenValues);

/** Optional web face. The mono stack prefers IBM Plex Mono when the host supplies it. */
export const pineFonts = [
  { family: "Inter Variable", package: "@fontsource-variable/inter", styles: ["normal"] },
] as const satisfies readonly ThemeFont[];
