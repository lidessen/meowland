import { defineTokens } from "meowcss";
import { standardUiTokenValues, type UiTokenValues } from "./tokens";

const serif =
  '"Newsreader Variable", Newsreader, "Iowan Old Style", Charter, Georgia, "Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", serif';
const sans =
  '"Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", sans-serif';
const mono =
  '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, "PingFang SC", monospace';

/**
 * Journal: the same roles as the standard theme, valued for blogs and long-form reading, after an
 * editorial research site. Warm paper and ink, Newsreader titles and reading copy over Inter
 * controls, an oxblood accent, quiet hairlines, small radii and soft warm depth. Titles are set at
 * a book weight, reading copy sits in a softer ink under full-ink headings, and quotations are
 * italic. Fonts are named first and fall back to system faces; `journalFonts` lists the files a
 * host loads. Control heights, icon sizes and code sizes keep the standard values, so every
 * component keeps its geometry and behavior.
 */
export const journalUiTokenValues = {
  surface: {
    canvas: ["#fbf9f4", "#121110"],
    reading: ["#fbf9f4", "#121110"],
    raised: ["#fffefb", "#181715"],
    overlay: ["#fffefb", "#24221f"],
    fill: ["#f0ebe1", "#262421"],
    field: ["#fffefb", "#181715"],
    tint: ["rgb(40 30 20 / 5%)", "rgb(255 245 230 / 7%)"],
    knockout: ["#fffefb", "#181715"],
    scrim: ["rgb(26 23 20 / 30%)", "rgb(0 0 0 / 60%)"],
  },
  inverse: {
    surface: ["#1c1a17", "#302d29"],
    ink: "#ebe6dc",
    action: "#ec9284",
  },
  line: {
    width: "1px",
    edge: ["#e4ddd1", "#2c2925"],
    divider: ["#ebe5da", "#24221f"],
    control: ["#d3cabb", "#3a3631"],
    controlHover: ["#958b7e", "#706960"],
  },
  ink: {
    primary: ["#1a1714", "#ece7df"],
    secondary: ["#5c544a", "#b3ab9f"],
    tertiary: ["#665e54", "#958c80"],
    chip: ["#5c544a", "#c9c2b7"],
    reading: ["#3d3832", "#c9c2b7"],
  },
  state: {
    hover: ["rgb(40 30 20 / 4.5%)", "rgb(255 245 230 / 6%)"],
    active: ["rgb(40 30 20 / 8%)", "rgb(255 245 230 / 11%)"],
    focus: ["#8a1c1c", "#e07a6a"],
    focusRing: ["rgb(138 28 28 / 22%)", "rgb(224 122 106 / 30%)"],
  },
  action: {
    primary: ["#1a1714", "#ece7df"],
    primaryHover: ["#3d3832", "#c9c2b7"],
    onPrimary: ["#fffefb", "#121110"],
    soft: ["#f0ebe1", "#262421"],
    danger: ["#b42318", "#f2836f"],
    onDanger: ["#ffffff", "#121110"],
  },
  control: {
    ...standardUiTokenValues.control,
    thumb: ["#fffefb", "#3a3631"],
    knob: ["#fffefb", "#c9c2b7"],
  },
  accent: {
    base: ["#8a1c1c", "#e07a6a"],
    soft: ["#f6e9e4", "#2a1a17"],
    selected: ["#f3e3dd", "#311d19"],
    ink: ["#8a1c1c", "#ec9284"],
    line: ["#e3c3ba", "#5a3029"],
    halo: ["rgb(138 28 28 / 22%)", "rgb(224 122 106 / 30%)"],
  },
  status: {
    info: ["#2f5d8a", "#7fa8d4"],
    success: ["#2d6a45", "#7cc79a"],
    warning: ["#8a5a0e", "#e2b25c"],
    danger: ["#b42318", "#f2836f"],
    unknown: ["#a39a8c", "#6f675d"],
  },
  type: {
    ...standardUiTokenValues.type,
    sans,
    display: serif,
    reading: serif,
    mono,
    readingSize: "19px",
    title: "20px",
    heading: "27px",
    pageTitle: "48px",
    hero: "64px",
    line: {
      ...standardUiTokenValues.type.line,
      reading: "33px",
      title: "28px",
      heading: "34px",
      pageTitle: "52px",
      hero: "68px",
    },
    weight: {
      ...standardUiTokenValues.type.weight,
      display: "500",
    },
    trackingTight: "-0.015em",
    trackingCaps: "0.08em",
    quoteStyle: "italic",
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
    xs: "3px",
    sm: "4px",
    md: "4px",
    lg: "6px",
    xl: "8px",
    xxl: "10px",
    full: "999px",
  },
  shadow: {
    raised: ["none", "inset 0 1px 0 rgb(255 255 255 / 3%)"],
    field: ["0 1px 1px rgb(40 30 20 / 4%)", "none"],
    action: ["0 1px 1px rgb(40 30 20 / 4%)", "0 1px 1px rgb(0 0 0 / 30%)"],
    filled: ["inset 0 1px 0 rgb(255 255 255 / 10%)", "inset 0 1px 0 rgb(255 255 255 / 40%)"],
    thumb: [
      "0 0 0 1px rgb(40 30 20 / 8%), 0 1px 1px rgb(40 30 20 / 6%)",
      "0 0 0 1px rgb(255 245 230 / 8%)",
    ],
    pressed: "inset 0 1px 2px rgb(40 30 20 / 12%)",
    sheet: ["12px 0 40px -12px rgb(40 30 20 / 22%)", "12px 0 40px rgb(0 0 0 / 55%)"],
    knob: ["0 1px 2px rgb(40 30 20 / 16%)", "0 1px 2px rgb(0 0 0 / 40%)"],
    dock: ["0 6px 18px -10px rgb(40 30 20 / 22%)", "0 6px 18px -10px rgb(0 0 0 / 70%)"],
    float: [
      "0 0 0 1px rgb(40 30 20 / 4%), 0 24px 60px -24px rgb(40 30 20 / 32%)",
      "0 0 0 1px rgb(255 255 255 / 3%), 0 24px 60px -24px rgb(0 0 0 / 80%)",
    ],
  },
  motion: {
    ...standardUiTokenValues.motion,
    ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    enter: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  layout: {
    ...standardUiTokenValues.layout,
    containerContent: "680px",
    containerPage: "1180px",
    measure: "680px",
  },
  glyph: {
    ...standardUiTokenValues.glyph,
    selectChevron: [
      `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235c544a' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
      `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23b3ab9f' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    ],
  },
} as const satisfies UiTokenValues;

/** The Journal values under the shared `ui` names, so every standard theme rule paints with them. */
export const journalUiTokens = /* @__PURE__ */ defineTokens("ui", journalUiTokenValues);

/**
 * A web font a theme names in its type stacks, as a Fontsource variable package: `family` is the
 * name the stack uses, `package` the npm package that carries its weight-axis files, and `styles`
 * the files to load (`italic` loads `wght-italic.css`). Meowtail ships no font files; a host that
 * wants the faces installs the packages and loads them (Meowpress takes the list as `fonts`).
 */
export interface ThemeFont {
  readonly family: string;
  readonly package: string;
  readonly styles: readonly ("normal" | "italic")[];
}

/** The web fonts Journal names. Newsreader loads its italic for Journal's italic quotations. */
export const journalFonts = [
  {
    family: "Newsreader Variable",
    package: "@fontsource-variable/newsreader",
    styles: ["normal", "italic"],
  },
  { family: "Inter Variable", package: "@fontsource-variable/inter", styles: ["normal"] },
  {
    family: "JetBrains Mono Variable",
    package: "@fontsource-variable/jetbrains-mono",
    styles: ["normal"],
  },
] as const satisfies readonly ThemeFont[];
