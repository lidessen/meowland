import { alertOptions } from "../components/alert";
import { defineOptions, defineTokens, tokenRef } from "meowcss";
import { accentTokens, layerTokens, lineTokens, radiusTokens } from "./palette";

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
  fontBody: "14px",
  fontCaption: "12px",
  fontReading: "14px",
  fontTitle: "16px",
  fontPageTitle: "24px",
  leading: "1.5714285714",
  spaceGroup: "8px",
  spaceSection: "20px",
  spacePanel: "24px",
  pageInsetBlock: "36px",
  pageInsetInline: "48px",
  pageInsetCompactBlock: "20px",
  pageInsetCompactInline: "16px",
  controlSmall: "28px",
  controlHeight: "32px",
  controlPaddingInline: "8px",
  controlLarge: "40px",
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
  surfaceMuted: ["#f1f3f5", "#353638"],
  sidebarSurface: ["#f9fafb", "#1b1b1c"],
  codeSurface: ["#f9fafb", "#1b1b1c"],
  codeBanner: ["#f9fafb", "#2c2c2e"],
  menuSurface: ["rgb(248 249 250 / 58%)", "rgb(67 69 74 / 45%)"],
  menuBlur: "blur(40px) saturate(150%)",
  tooltipSurface: ["#2c2c2e", "#43454a"],
  foreground: ["#0f1115", "#f9fafb"],
  toastSurface: ["#353638", "#43454a"],
  toastForeground: "#ffffff",
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
  hover: ["rgb(38 49 72 / 6%)", "rgb(255 255 255 / 8%)"],
  active: ["rgb(38 49 72 / 10%)", "rgb(255 255 255 / 14%)"],
  primary: ["#0f1115", "#f9fafb"],
  primaryHover: ["#43454a", "#ebeef2"],
  onPrimary: ["#ffffff", "#0f1115"],
  primarySoft: ["#ebeef2", "#43454a"],
  info: ["#2f5fce", "#7aaaff"],
  warning: ["#a85c00", "#f0a04b"],
  success: ["#15803d", "#4ade80"],
  danger: ["#d51d1d", "#f25a5a"],
  // Filled destructive actions are a Meowland extension: state red alone does
  // not provide readable small labels, especially with white ink in dark mode.
  dangerAction: ["#b91c1c", "#f25a5a"],
  onDanger: ["#ffffff", "#0f1115"],
  focus: ["#4176e6", "#7aaaff"],
  shadowControl: "none",
  shadowPanel: [
    "0 0 0 0.5px rgb(0 0 0 / 16%), 0 3px 8px rgb(0 0 0 / 4%), 0 0 20px rgb(0 0 0 / 5%)",
    "0 0 0 0.5px rgb(255 255 255 / 20%), 0 3px 8px rgb(0 0 0 / 4%), 0 0 20px rgb(0 0 0 / 5%)",
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
  userSurface: schemeAlias(`${accentTokens.soft}`),
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
    info: `${uiTokens.primary}`,
    success: `${uiTokens.success}`,
    warning: `${uiTokens.warning}`,
    danger: `${uiTokens.danger}`,
  }),
});
