import { alertOptions } from "../components/alert";
import { defineOptions, defineTokens, tokenRef } from "meowcss";

/** Shared standard-theme parameters; scheme is built in, no fixed density axis. */
export const standardOptions = defineOptions("meowui", {});

/**
 * The design system in one tree. Every value a theme file paints with is one of
 * these roles; a theme file never writes a literal color, size or duration.
 * Colors are literal [light, dark] pairs and never reference another token, so a
 * nested scheme region resolves its own value. CSS names are `--ui-<group>-<key>`.
 * The rules for each group live in packages/meowtail/AGENTS.md ("Design system").
 */
export const uiTokens = defineTokens("ui", {
  /**
   * The surface ladder. Every background is one rung; each rung has one edge rule.
   * Dark lightness steps up with elevation; a field is recessed, so it is darker
   * than raised. `tint` is a translucent fill for marks on any rung; `knockout` is
   * the color behind a halo or cutout (a host overrides it per surface); `scrim`
   * dims the page under a modal. The last three are not rungs.
   */
  surface: {
    canvas: ["#fafafa", "#121212"],
    reading: ["#ffffff", "#121212"],
    raised: ["#ffffff", "#1a1a1a"],
    overlay: ["#ffffff", "#202020"],
    fill: ["#f2f2f2", "#242424"],
    field: ["#ffffff", "#161616"],
    tint: ["rgb(0 0 0 / 5%)", "rgb(255 255 255 / 8%)"],
    knockout: ["#ffffff", "#1a1a1a"],
    scrim: ["rgb(0 0 0 / 24%)", "rgb(0 0 0 / 50%)"],
  },
  /** Tooltip and toast: a dark surface in both schemes. */
  inverse: {
    surface: ["#262626", "#404040"],
    ink: "#ffffff",
    action: "#93c5fd",
  },
  /**
   * Lines have three jobs: `edge` outlines a raised or overlay surface and splits
   * regions on the canvas; `divider` separates rows inside one surface; `control`
   * bounds what the reader operates, `controlHover` under the pointer.
   */
  line: {
    width: "1px",
    edge: ["rgb(0 0 0 / 8%)", "rgb(255 255 255 / 9%)"],
    divider: ["rgb(0 0 0 / 6%)", "rgb(255 255 255 / 6%)"],
    control: ["rgb(0 0 0 / 13%)", "rgb(255 255 255 / 14%)"],
    controlHover: ["rgb(0 0 0 / 24%)", "rgb(255 255 255 / 28%)"],
  },
  /**
   * Text: primary for content, secondary for supporting copy and placeholders,
   * tertiary for captions and metadata (still 4.5:1 on fill), chip for text on a
   * neutral chip. A quieter state of the same thing fades its ink with color-mix
   * instead of switching role.
   */
  ink: {
    primary: ["#0a0a0a", "#fafafa"],
    secondary: ["#636363", "#a3a3a3"],
    tertiary: ["#6e6e6e", "#8f8f8f"],
    chip: ["#636363", "#d4d4d4"],
  },
  /** Translucent overlays that work on any rung, plus focus. */
  state: {
    hover: ["rgb(0 0 0 / 4.5%)", "rgb(255 255 255 / 7%)"],
    active: ["rgb(0 0 0 / 8%)", "rgb(255 255 255 / 12%)"],
    focus: ["#2563eb", "#60a5fa"],
    focusRing: ["rgb(37 99 235 / 20%)", "rgb(96 165 250 / 28%)"],
  },
  /** Filled actions: the main action is black or white; danger carries a white label. */
  action: {
    primary: ["#0a0a0a", "#fafafa"],
    primaryHover: ["#262626", "#e5e5e5"],
    onPrimary: ["#ffffff", "#0a0a0a"],
    soft: ["#f0f0f0", "#333333"],
    danger: ["#b91c1c", "#f25a5a"],
    onDanger: ["#ffffff", "#0a0a0a"],
  },
  /**
   * One size ladder for every single-line control, so a field, a select and a
   * button in one row share a height and a center line. `inset` pads ordinary
   * controls, `fieldInset` the text inside field surfaces; `thumb` is the raised
   * segment in a Tabs or SegmentedControl track and `knob` a switch handle.
   */
  control: {
    small: "28px",
    regular: "36px",
    large: "44px",
    inset: "8px",
    fieldInset: "12px",
    trackInset: "3px",
    thumb: ["#ffffff", "#4a4a4a"],
    knob: ["#ffffff", "#a3a3a3"],
  },
  /** Accent marks what is happening now and where the reader is. */
  accent: {
    base: ["#2563eb", "#60a5fa"],
    soft: ["#eff4ff", "rgb(96 165 250 / 14%)"],
    selected: ["#ebf1fe", "rgb(96 165 250 / 15%)"],
    ink: ["#1d4ed8", "#93c5fd"],
    line: ["rgb(37 99 235 / 28%)", "rgb(96 165 250 / 30%)"],
    halo: ["rgb(37 99 235 / 28%)", "rgb(96 165 250 / 30%)"],
  },
  /**
   * One color per status, readable as text and used for markers too; halos and
   * tints derive from it with color-mix. `unknown` is the hollow marker for states
   * nobody verified.
   */
  status: {
    info: ["#2563eb", "#60a5fa"],
    success: ["#15803d", "#4ade80"],
    warning: ["#a85c00", "#f0a04b"],
    danger: ["#c81e1e", "#f25a5a"],
    unknown: ["#a3a3a3", "#737373"],
  },
  /** The type ramp. Every size in the theme is one of these roles. */
  type: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
    /** Serif stack for page and section titles; hosts override `--ui-type-display`. */
    display:
      '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", "Songti SC", "Songti TC", "Noto Serif SC", serif',
    mono: '"SF Mono", "JetBrains Mono", "Fira Code", Consolas, "Liberation Mono", Menlo, Courier, "PingFang SC", "Microsoft YaHei"',
    /** Key caps, compact counts and small-caps group labels. */
    micro: "11px",
    caption: "12px",
    /** Monospace text in code, output and JSON views. */
    code: "12px",
    /** Compact UI text: menus, tooltips, small rows, bar notices. */
    label: "13px",
    body: "14px",
    title: "16px",
    heading: "20px",
    pageTitle: "24px",
    leading: "1.5714285714",
    /** Titles at `title` and above close up slightly. */
    /** The smallest size iOS edits without zooming; a touch field never goes below it. */
    touchField: "16px",
    trackingTight: "-0.01em",
    /** The small-caps group label. */
    trackingCaps: "0.04em",
  },
  /** Spacing by relationship: within a group, between related areas, at a container edge. */
  space: {
    group: "8px",
    section: "20px",
    panel: "24px",
    /** Between blocks of reading content. */
    prose: "12px",
    /** Inset of a compact object (task list, work card, resource row): block, then inline. */
    insetBlock: "12px",
    insetInline: "16px",
    pageBlock: "36px",
    pageInline: "48px",
    pageBlockCompact: "20px",
    pageInlineCompact: "16px",
  },
  /** Glyph sizes: small for chevrons and markers inside rows, size for ordinary icons, large for prominent actions and tiles. */
  icon: {
    small: "14px",
    size: "16px",
    large: "18px",
    stroke: "1.75",
  },
  /**
   * Radii by element size: xs marks and key caps, sm tags, md 24-32px elements and
   * items in floating panels, lg 36-44px controls, xl surfaces, xxl dialogs and
   * large floating sheets.
   */
  radius: {
    xs: "4px",
    sm: "6px",
    md: "8px",
    lg: "10px",
    xl: "14px",
    xxl: "22px",
    /** Capsules: badges, tags, pills, tracks and round floating buttons. */
    full: "999px",
  },
  /** Depth by role; each role takes one shadow and nothing else. */
  shadow: {
    /** In-flow surfaces are flat in light; a faint top highlight separates them in dark. */
    raised: ["none", "inset 0 1px 0 rgb(255 255 255 / 3%)"],
    field: ["0 1px 1px rgb(0 0 0 / 2.5%)", "none"],
    action: [
      "0 1px 2px rgb(0 0 0 / 5%)",
      "inset 0 1px 0 rgb(255 255 255 / 5%), 0 1px 2px rgb(0 0 0 / 30%)",
    ],
    filled: [
      "inset 0 1px 0 rgb(255 255 255 / 12%), 0 1px 2px rgb(0 0 0 / 18%)",
      "inset 0 1px 0 rgb(255 255 255 / 70%), 0 1px 2px rgb(0 0 0 / 40%)",
    ],
    thumb: [
      "0 0 0 1px rgb(0 0 0 / 6%), 0 1px 2px rgb(0 0 0 / 8%)",
      "0 0 0 1px rgb(255 255 255 / 8%), 0 1px 2px rgb(0 0 0 / 32%)",
    ],
    /** An operated surface held down: the press sinks into it. */
    pressed: "inset 0 1px 2px rgb(0 0 0 / 12%)",
    /** A sheet attached to a screen edge (Drawer, expanded rail) throws its shadow sideways. */
    sheet: ["12px 0 40px rgb(0 0 0 / 12%)", "12px 0 40px rgb(0 0 0 / 50%)"],
    /** A slider knob resting on its track. */
    knob: ["0 1px 2px rgb(0 0 0 / 16%)", "0 1px 2px rgb(0 0 0 / 40%)"],
    /** A bar docked over scrolling content (the Assistant composer): a wide, faint drop. */
    dock: [
      "0 10px 15px -3px rgb(0 0 0 / 5%), 0 4px 6px -4px rgb(0 0 0 / 5%)",
      "0 10px 24px -6px rgb(0 0 0 / 45%)",
    ],
    /** Floating surfaces: a ring plus a deep, soft drop. */
    float: [
      "0 0 0 1px rgb(0 0 0 / 7%), 0 4px 10px -4px rgb(0 0 0 / 8%), 0 16px 36px -8px rgb(0 0 0 / 14%)",
      "0 0 0 1px rgb(255 255 255 / 9%), 0 4px 10px -4px rgb(0 0 0 / 40%), 0 16px 36px -8px rgb(0 0 0 / 60%)",
    ],
  },
  /**
   * instant answers a press, response a hover, settle a state change, draw a line
   * drawn across text; loop paces spinners and pulses, sweep a shimmer or wave.
   */
  motion: {
    instant: "40ms",
    response: "100ms",
    settle: "200ms",
    draw: "360ms",
    loop: "1.2s",
    sweep: "1.6s",
    ease: "cubic-bezier(0.4, 0, 0.2, 1)",
    /** Arrivals: a fast start that settles softly, for surfaces entering the screen. */
    enter: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  layout: {
    gridCompact: "160px",
    gridNormal: "240px",
    gridWide: "320px",
    containerNarrow: "480px",
    containerContent: "720px",
    containerWide: "1120px",
    containerPage: "1040px",
    /** The longest comfortable reading line for Prose. */
    measure: "70ch",
  },
  /** Glyphs drawn by mask, so the theme's ink colors them; selectChevron is a background image. */
  glyph: {
    chevron: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E")`,
    check: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E")`,
    arrow: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14'/%3E%3Cpath d='m12 5 7 7-7 7'/%3E%3C/svg%3E")`,
    cross: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 6 6 18'/%3E%3Cpath d='m6 6 12 12'/%3E%3C/svg%3E")`,
    selectChevron: [
      `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23636363' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
      `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a3a3a3' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    ],
  },
});

/** Chat-only measures; colors and surfaces come from uiTokens. */
export const chatTokens = defineTokens("chat", {
  /* Deliberately chat-local so enlarging the conversation does not resize other reading surfaces. */
  fontBody: "14px",
  leading: "1.7142857143",
  listGap: "24px",
  listMaxWidth: "720px",
  readingInset: "24px",
  /** Between a row's leading glyph and its label; expanded bodies indent by the same pair. */
  leadingGap: "6px",
  /** The line box of a process row; the list measures its own rows by it. */
  rowLine: "24px",
  userMaxWidth: "70.2%",
  bubbleRadius: "18px",
  /** The composer bar's rounded ends. */
  composerRadius: "24px",
});

/** Optional brand ink; absence uses the surrounding currentColor. */
export const logoTokens = { ink: tokenRef("meowland", "logo", "ink") } as const;

export const alertTokens = defineTokens("alert", {
  accent: alertOptions.by.tone({
    neutral: `${uiTokens.ink.secondary}`,
    info: `${uiTokens.status.info}`,
    success: `${uiTokens.status.success}`,
    warning: `${uiTokens.status.warning}`,
    danger: `${uiTokens.status.danger}`,
  }),
});
