import { alertOptions } from "../components/alert";
import { defineOptions, defineTokens, tokenRef } from "meowcss";
import { layerTokens, lineTokens, radiusTokens } from "./palette";

/** Shared standard-theme parameters; scheme is built in, no fixed density axis. */
export const standardOptions = defineOptions("meowui", {});

/** Re-evaluate color aliases at a local scheme instead of inheriting resolved parent colors. */
const schemeAlias = (value: string) => standardOptions.by.scheme([value, value]);

/** Secondary ink that remains readable on input and page surfaces in both schemes. */
const mutedForeground = ["#636363", "#a3a3a3"] as const;

export const uiTokens = defineTokens("ui", {
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
  /** Serif stack for page and section titles. Hosts override `--ui-font-display`. */
  fontDisplay:
    '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", "Songti SC", "Songti TC", "Noto Serif SC", serif',
  mono: '"SF Mono", "JetBrains Mono", "Fira Code", Consolas, "Liberation Mono", Menlo, Courier, "PingFang SC", "Microsoft YaHei"',
  /* Type ramp. Every size in the theme is one of these roles. */
  /** Key caps, compact counts, group labels in menus and code banners. */
  fontMicro: "11px",
  fontCaption: "12px",
  /** Monospace text in code, output and JSON views. */
  fontCode: "12px",
  /** Compact UI text: menus, tooltips, small rows, bar notices. */
  fontLabel: "13px",
  fontBody: "14px",
  fontReading: "14px",
  fontTitle: "16px",
  fontHeading: "20px",
  fontPageTitle: "24px",
  leading: "1.5714285714",
  spaceGroup: "8px",
  spaceSection: "20px",
  spacePanel: "24px",
  /** Between blocks of reading content: paragraphs, lists, code and quotes. */
  proseGap: "12px",
  /** The longest comfortable reading line for Prose. */
  measure: "70ch",
  pageInsetBlock: "36px",
  pageInsetInline: "48px",
  pageInsetCompactBlock: "20px",
  pageInsetCompactInline: "16px",
  /* One size ladder for every single-line control, so a field, a select and a
     button placed in one row share a height and a center line. */
  controlSmall: "28px",
  controlHeight: "36px",
  controlPaddingInline: "8px",
  /** Text inset inside field surfaces (input, select, search, choice trigger). */
  fieldPaddingInline: "12px",
  controlLarge: "44px",
  buttonSmall: "28px",
  buttonHeight: "36px",
  buttonLarge: "44px",
  controlRadius: `${radiusTokens.control}`,
  radiusSmall: `${radiusTokens.inline}`,
  radiusLarge: `${radiusTokens.card}`,
  panelRadius: `${radiusTokens.card}`,
  dialogRadius: "24px",
  messageRadius: `${radiusTokens.bubble}`,
  iconSize: "16px",
  iconStroke: "1.75",
  switchThumb: ["#ffffff", "#a3a3a3"],
  // DeepSeek Harness ui-theme: design-platform aliases, resolved per scheme.
  /* Surfaces alias the ladder in palette.ts; do not add a new grey here. */
  background: schemeAlias(`${layerTokens.canvas}`),
  inputSurface: schemeAlias(`${layerTokens.field}`),
  surface: schemeAlias(`${layerTokens.overlay}`),
  /* Fills are true neutrals: a blue cast in light greys reads as default
     framework chrome; neutral greys let type and content carry the color. */
  surfaceMuted: schemeAlias(`${layerTokens.fill}`),
  sidebarSurface: schemeAlias(`${layerTokens.canvas}`),
  codeSurface: schemeAlias(`${layerTokens.fill}`),
  codeBanner: schemeAlias(`${layerTokens.fill}`),
  menuSurface: schemeAlias(`${layerTokens.overlay}`),
  menuBlur: "blur(40px) saturate(150%)",
  tooltipSurface: ["#262626", "#404040"],
  foreground: ["#0a0a0a", "#fafafa"],
  toastSurface: ["#262626", "#404040"],
  toastForeground: "#ffffff",
  /** Action text on the inverse Toast/Tooltip surface, which is dark in both schemes. */
  inverseAction: "#93c5fd",
  mutedForeground,
  // Metadata ink stays above the normal-text floor in both schemes; it is still
  // lighter than the primary muted text so hierarchy survives.
  subtleForeground: ["#6e6e6e", "#8f8f8f"],
  captionForeground: ["#6e6e6e", "#8f8f8f"],
  shimmer: ["rgb(0 0 0 / 30%)", "rgb(255 255 255 / 45%)"],
  // Placeholder is text the reader must scan before typing; reuse the readable
  // secondary ink instead of a near-white tint that only works as decoration.
  placeholder: mutedForeground,
  /* Lines alias the three line roles in palette.ts. */
  border: schemeAlias(`${lineTokens.control}`),
  borderSubtle: schemeAlias(`${lineTokens.edge}`),
  borderSoft: schemeAlias(`${lineTokens.divider}`),
  borderFaint: schemeAlias(`${lineTokens.divider}`),
  /** Native Select chevron: the Lucide chevron-down the ChoiceSelect trigger draws, in muted ink. */
  selectChevron: [
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23636363' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a3a3a3' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  ],
  /**
   * Lucide chevron-right as a mask, for a native summary that cannot hold an
   * Icon. Painted with currentColor, so it follows the text in both schemes.
   */
  chevronMask: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E")`,
  /** Marker glyphs drawn by mask, so the theme's ink colors them. */
  checkMask: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E")`,
  arrowMask: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14'/%3E%3Cpath d='m12 5 7 7-7 7'/%3E%3C/svg%3E")`,
  crossMask: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 6 6 18'/%3E%3Cpath d='m6 6 12 12'/%3E%3C/svg%3E")`,
  /** Field border under the pointer: one step above the resting border. */
  borderStrong: schemeAlias(`${lineTokens.controlHover}`),
  hover: ["rgb(0 0 0 / 4.5%)", "rgb(255 255 255 / 7%)"],
  active: ["rgb(0 0 0 / 8%)", "rgb(255 255 255 / 12%)"],
  primary: ["#0a0a0a", "#fafafa"],
  /* Hover moves the main action a step, not to a washed-out grey. */
  primaryHover: ["#262626", "#e5e5e5"],
  onPrimary: ["#ffffff", "#0a0a0a"],
  primarySoft: ["#f0f0f0", "#333333"],
  info: ["#2563eb", "#60a5fa"],
  warning: ["#a85c00", "#f0a04b"],
  success: ["#15803d", "#4ade80"],
  danger: ["#d51d1d", "#f25a5a"],
  // Filled destructive actions are a Meowland extension: state red alone does
  // not provide readable small labels, especially with white ink in dark mode.
  dangerAction: ["#b91c1c", "#f25a5a"],
  onDanger: ["#ffffff", "#0a0a0a"],
  focus: ["#2563eb", "#60a5fa"],
  /** Soft halo around a focused field; the border carries the focus color. */
  focusRing: ["rgb(37 99 235 / 20%)", "rgb(96 165 250 / 28%)"],
  shadowControl: "none",
  /** The one-pixel drop under an outline action; in dark, a top edge catches the light instead. */
  shadowAction: [
    "0 1px 2px rgb(0 0 0 / 5%)",
    "inset 0 1px 0 rgb(255 255 255 / 5%), 0 1px 2px rgb(0 0 0 / 30%)",
  ],
  /**
   * In-flow raised surfaces (cards, lists, tables) are flat: a crisp 1px edge
   * carries them in light; in dark a faint top highlight separates the layer.
   */
  shadowRaised: ["none", "inset 0 1px 0 rgb(255 255 255 / 3%)"],
  /** Fields at rest sit very slightly into the page. */
  shadowField: ["0 1px 1px rgb(0 0 0 / 2.5%)", "none"],
  /**
   * Filled actions (primary, danger): a top highlight and a short drop give
   * the fill a material edge instead of a flat block.
   */
  shadowFilled: [
    "inset 0 1px 0 rgb(255 255 255 / 12%), 0 1px 2px rgb(0 0 0 / 18%)",
    "inset 0 1px 0 rgb(255 255 255 / 70%), 0 1px 2px rgb(0 0 0 / 40%)",
  ],
  /** The raised thumb inside a Tabs or SegmentedControl track. */
  shadowThumb: [
    "0 0 0 1px rgb(0 0 0 / 6%), 0 1px 2px rgb(0 0 0 / 8%)",
    "0 0 0 1px rgb(255 255 255 / 8%), 0 1px 2px rgb(0 0 0 / 32%)",
  ],
  /** The thumb itself: lighter than its track in both schemes, so it reads as raised. */
  thumbSurface: ["#ffffff", "#4a4a4a"],
  /** Inset between a Tabs or SegmentedControl track and its thumb. */
  trackInset: "3px",
  shadowPanel: [
    "0 0 0 1px rgb(0 0 0 / 8%), 0 3px 8px rgb(0 0 0 / 4%), 0 0 20px rgb(0 0 0 / 5%)",
    "0 0 0 1px rgb(255 255 255 / 10%), 0 3px 8px rgb(0 0 0 / 4%), 0 0 20px rgb(0 0 0 / 5%)",
  ],
  /** Floating surfaces (menus, popovers, dialogs): a hairline plus a deep, soft drop. */
  shadowFloat: [
    "0 0 0 1px rgb(0 0 0 / 7%), 0 4px 10px -4px rgb(0 0 0 / 8%), 0 16px 36px -8px rgb(0 0 0 / 14%)",
    "0 0 0 1px rgb(255 255 255 / 9%), 0 4px 10px -4px rgb(0 0 0 / 40%), 0 16px 36px -8px rgb(0 0 0 / 60%)",
  ],
  backdrop: ["rgb(0 0 0 / 24%)", "rgb(0 0 0 / 50%)"],
  durationResponse: "100ms",
  durationSettle: "200ms",
  ease: "cubic-bezier(0.4, 0, 0.2, 1)",
  gridColumnCompact: "160px",
  gridColumnNormal: "240px",
  gridColumnWide: "320px",
  containerNarrow: "480px",
  containerContent: "720px",
  containerWide: "1120px",
  containerPage: "1040px",
});

/** Chat-specific parameters; shared colors reference uiTokens directly. */
export const chatTokens = defineTokens("chat", {
  paper: schemeAlias(`${layerTokens.reading}`),
  /* Reading size for chat prose. Deliberately chat-local rather than
     uiTokens.fontReading so enlarging the conversation does not resize the
     settings and other shared reading surfaces. */
  fontBody: "14px",
  messageLeading: "1.7142857143",
  /* The composer is a filled bar on a 1px edge, not a floating card: it belongs to the page. */
  composerSurface: schemeAlias(`${uiTokens.surfaceMuted}`),
  composerShadow: schemeAlias(`0 0 0 1px ${lineTokens.edge}`),
  /* Neutral, as in Grok: the reader's words are set apart by shape, not by a tint. */
  userSurface: schemeAlias(`${uiTokens.surfaceMuted}`),
  userInk: schemeAlias(`${uiTokens.foreground}`),
  submitSurface: schemeAlias(`${uiTokens.primary}`),
  messageListGap: "24px",
  messageListMaxWidth: "720px",
  readingInset: "24px",
  /** Between a row's leading glyph and its label; expanded bodies indent by the same pair. */
  leadingGap: "6px",
  /** The line box of a process row; the list measures its own rows by it. */
  rowLine: "24px",
  messageRadius: `${radiusTokens.bubble}`,
  messageCornerRadius: `${radiusTokens.bubble}`,
  messageUserMaxWidth: "70.2%",
});

/** Optional brand ink; absence uses the surrounding currentColor. */
export const logoTokens = { ink: tokenRef("meowland", "logo", "ink") } as const;

export const alertTokens = defineTokens("alert", {
  accent: alertOptions.by.tone({
    neutral: `${uiTokens.mutedForeground}`,
    info: `${uiTokens.info}`,
    success: `${uiTokens.success}`,
    warning: `${uiTokens.warning}`,
    danger: `${uiTokens.danger}`,
  }),
});
