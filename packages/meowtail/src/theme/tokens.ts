import { alertOptions } from "../components/alert";
import { defineOptions, defineTokens, tokenRef } from "meowcss";
import { layerTokens, lineTokens, radiusTokens } from "./palette";

/** Shared standard-theme parameters; scheme is built in, no fixed density axis. */
export const standardOptions = defineOptions("meowui", {});

/** Re-evaluate color aliases at a local scheme instead of inheriting resolved parent colors. */
const schemeAlias = (value: string) => standardOptions.by.scheme([value, value]);

/** Secondary ink that remains readable on input and page surfaces in both schemes. */
const mutedForeground = ["#61666b", "#adb2b8"] as const;

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
  switchThumb: ["#ffffff", "#adb2b8"],
  // DeepSeek Harness ui-theme: design-platform aliases, resolved per scheme.
  background: ["#ffffff", "#151517"],
  inputSurface: ["#ffffff", "#232324"],
  surface: ["#ffffff", "#2c2c2e"],
  /* Fills are true neutrals: a blue cast in light greys reads as default
     framework chrome; neutral greys let type and content carry the color. */
  surfaceMuted: ["#f2f2f3", "#353638"],
  sidebarSurface: ["#fafafa", "#1b1b1c"],
  codeSurface: ["#fafafa", "#1b1b1c"],
  codeBanner: ["#fafafa", "#2c2c2e"],
  /* Opaque enough to read on its own: the blur is a refinement, and text under
     a menu must not compete with the menu's items where it is unavailable. */
  menuSurface: ["rgb(250 250 251 / 90%)", "rgb(44 45 48 / 90%)"],
  menuBlur: "blur(40px) saturate(150%)",
  tooltipSurface: ["#2c2c2e", "#43454a"],
  foreground: ["#0f1115", "#f9fafb"],
  toastSurface: ["#353638", "#43454a"],
  toastForeground: "#ffffff",
  /** Action text on the inverse Toast/Tooltip surface, which is dark in both schemes. */
  inverseAction: "#7aaaff",
  mutedForeground,
  // Metadata ink stays above the normal-text floor in both schemes; it is still
  // lighter than the primary muted text so hierarchy survives.
  subtleForeground: ["#656a71", "#9aa0a7"],
  captionForeground: ["#656a71", "#9aa0a7"],
  shimmer: ["rgb(0 0 0 / 30%)", "rgb(255 255 255 / 45%)"],
  // Placeholder is text the reader must scan before typing; reuse the readable
  // secondary ink instead of a near-white tint that only works as decoration.
  placeholder: mutedForeground,
  border: ["rgb(0 0 0 / 16%)", "rgb(255 255 255 / 20%)"],
  borderSubtle: ["rgb(0 0 0 / 12%)", "rgb(255 255 255 / 16%)"],
  borderSoft: schemeAlias(`${lineTokens.divider}`),
  borderFaint: ["rgb(0 0 0 / 4%)", "rgb(255 255 255 / 6%)"],
  /** Native Select chevron: the Lucide chevron-down the ChoiceSelect trigger draws, in muted ink. */
  selectChevron: [
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2361666b' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23adb2b8' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  ],
  /**
   * Lucide chevron-right as a mask, for a native summary that cannot hold an
   * Icon. Painted with currentColor, so it follows the text in both schemes.
   */
  chevronMask: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E")`,
  /** Field border under the pointer: one step above the resting border. */
  borderStrong: ["rgb(0 0 0 / 28%)", "rgb(255 255 255 / 32%)"],
  hover: ["rgb(0 0 0 / 4.5%)", "rgb(255 255 255 / 7%)"],
  active: ["rgb(0 0 0 / 8%)", "rgb(255 255 255 / 12%)"],
  primary: ["#0f1115", "#f9fafb"],
  /* Hover moves the main action a step, not to a washed-out grey. */
  primaryHover: ["#2a2b2f", "#e4e5e7"],
  onPrimary: ["#ffffff", "#0f1115"],
  primarySoft: ["#ececed", "#43454a"],
  info: ["#2f5fce", "#7aaaff"],
  warning: ["#a85c00", "#f0a04b"],
  success: ["#15803d", "#4ade80"],
  danger: ["#d51d1d", "#f25a5a"],
  // Filled destructive actions are a Meowland extension: state red alone does
  // not provide readable small labels, especially with white ink in dark mode.
  dangerAction: ["#b91c1c", "#f25a5a"],
  onDanger: ["#ffffff", "#0f1115"],
  focus: ["#4176e6", "#7aaaff"],
  /** Soft halo around a focused field; the border carries the focus color. */
  focusRing: ["rgb(65 118 230 / 22%)", "rgb(122 170 255 / 28%)"],
  shadowControl: "none",
  /** The one-pixel drop under an outline action; in dark, a top edge catches the light instead. */
  shadowAction: [
    "0 1px 2px rgb(0 0 0 / 5%)",
    "inset 0 1px 0 rgb(255 255 255 / 5%), 0 1px 2px rgb(0 0 0 / 30%)",
  ],
  /**
   * In-flow raised surfaces (cards, lists, tables): ambient depth under the
   * hairline in light, a faint top highlight in dark, where shadows vanish.
   */
  shadowRaised: [
    "0 1px 2px rgb(0 0 0 / 3%), 0 2px 8px -2px rgb(0 0 0 / 4%)",
    "inset 0 1px 0 rgb(255 255 255 / 4%)",
  ],
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
    "0 0 0 0.5px rgb(0 0 0 / 12%), 0 1px 2px rgb(0 0 0 / 8%)",
    "0 0 0 0.5px rgb(255 255 255 / 14%), 0 1px 2px rgb(0 0 0 / 32%)",
  ],
  /** The thumb itself: lighter than its track in both schemes, so it reads as raised. */
  thumbSurface: ["#ffffff", "#505156"],
  /** Inset between a Tabs or SegmentedControl track and its thumb. */
  trackInset: "3px",
  shadowPanel: [
    "0 0 0 0.5px rgb(0 0 0 / 16%), 0 3px 8px rgb(0 0 0 / 4%), 0 0 20px rgb(0 0 0 / 5%)",
    "0 0 0 0.5px rgb(255 255 255 / 20%), 0 3px 8px rgb(0 0 0 / 4%), 0 0 20px rgb(0 0 0 / 5%)",
  ],
  /** Floating surfaces (menus, popovers, dialogs): a hairline plus a deep, soft drop. */
  shadowFloat: [
    "0 0 0 0.5px rgb(0 0 0 / 8%), 0 4px 10px -4px rgb(0 0 0 / 8%), 0 16px 36px -8px rgb(0 0 0 / 16%)",
    "0 0 0 0.5px rgb(255 255 255 / 12%), 0 4px 10px -4px rgb(0 0 0 / 40%), 0 16px 36px -8px rgb(0 0 0 / 60%)",
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
  paper: schemeAlias(`${uiTokens.background}`),
  /* Reading size for chat prose. Deliberately chat-local rather than
     uiTokens.fontReading so enlarging the conversation does not resize the
     settings and other shared reading surfaces. */
  fontBody: "15px",
  messageLeading: "1.7",
  composerSurface: schemeAlias(`${layerTokens.raised}`),
  composerShadow: schemeAlias(
    `0 0 0 0.5px ${uiTokens.borderSoft}, 0 4px 16px rgb(0 0 0 / 3%), 0 0 24px rgb(0 0 0 / 3%)`,
  ),
  /* Neutral, as in Grok: the reader's words are set apart by shape, not by a tint. */
  userSurface: schemeAlias(`${uiTokens.surfaceMuted}`),
  userInk: schemeAlias(`${uiTokens.foreground}`),
  submitSurface: schemeAlias(`${uiTokens.primary}`),
  messageListGap: "28px",
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
