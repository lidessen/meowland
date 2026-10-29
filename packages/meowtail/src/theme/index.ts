import { defineTheme, type CSSFragment, type ScopedTokens } from "meowcss/meowjsx";
import type { TokenSet } from "meowcss";
import { assistantStyles } from "./chat/assistant.styles";
import { stateBadgeStyles } from "./shared/state-badge.styles";
import { chatTaskStyles } from "./chat/task.styles";
import { baseStyles, foundationStyles, cornerShapeStyles } from "./base.styles";
import { pillStyles } from "./components/pill.styles";
import { imagePreviewStyles } from "./components/image-preview.styles";
import { outputBlockStyles } from "./components/output-block.styles";
import { webBlockStyles } from "./components/web-block.styles";
import { jsonStyles } from "./components/json.styles";
import { imageLightboxStyles } from "./components/image-lightbox.styles";
import { shortcutKeysStyles } from "./components/shortcut-keys.styles";
import { pathLabelStyles } from "./components/path-label.styles";
import { stateDotStyles } from "./components/state-dot.styles";
import { hoverCardStyles } from "./components/hover-card.styles";
import { menuStyles } from "./components/menu.styles";
import { toastStyles } from "./components/toast.styles";
import { standardOptions, uiTokens, chatTokens, alertTokens } from "./tokens";
import { journalUiTokens } from "./journal.tokens";
import { meowUiTokens } from "./meow.tokens";
import { utilityStyles } from "./utilities";
import { choiceSelectStyles } from "./components/choice-select.styles";
import { tooltipStyles } from "./components/tooltip.styles";
import { alertStyles } from "./components/alert.styles";
import { toolbarStyles } from "./components/toolbar.styles";
import { chatAttachmentsStyles } from "./chat/attachments.styles";
import { fieldGroupStyles } from "./components/field-group.styles";
import { cardStyles } from "./components/card.styles";
import { actionRailStyles } from "./components/action-rail.styles";
import { metaRowStyles } from "./components/meta-row.styles";
import { popoverStyles } from "./components/popover.styles";
import { tabsStyles } from "./components/tabs.styles";
import { choiceGroupStyles } from "./components/choice-group.styles";
import { chatConversationStyles } from "./chat/conversation.styles";
import { disclosureStyles } from "./components/disclosure.styles";
import { searchInputStyles } from "./components/search-input.styles";
import { pathPickerStyles } from "./components/path-picker.styles";
import { chatQuestionStyles } from "./chat/question.styles";
import { spinnerStyles } from "./components/spinner.styles";
import { skeletonStyles } from "./components/skeleton.styles";
import { chatHeaderStyles } from "./chat/header.styles";
import { chatStatusStyles } from "./chat/status.styles";
import { chatFrameStyles } from "./chat/frame.styles";
import { chatMessageStyles } from "./chat/message.styles";
import { chatComposerStyles } from "./chat/composer.styles";
import { composerPanelStyles } from "./chat/composer-panel.styles";
import { chatRecordsStyles } from "./chat/records.styles";
import { codeBlockStyles } from "./components/code-block.styles";
import { mermaidDiagramStyles } from "./components/mermaid-diagram.styles";
import { layoutStyles } from "./components/layout.styles";
import { descriptionListStyles } from "./components/description-list.styles";
import { pageFrameStyles } from "./components/page-frame.styles";
import { appBarStyles } from "./components/app-bar.styles";
import { regionLayoutStyles } from "./components/region-layout.styles";
import { buttonStyles } from "./components/button.styles";
import { dialogStyles } from "./components/dialog.styles";
import { nativeInputStyles } from "./components/native-input.styles";
import { fieldStyles } from "./components/field.styles";
import { badgeStyles } from "./components/badge.styles";
import { separatorStyles } from "./components/separator.styles";
import { emptyStateStyles } from "./components/empty-state.styles";
import { navItemStyles } from "./components/nav-item.styles";
import { iconsStyles } from "./icons/icons.styles";
import { breadcrumbStyles } from "./components/breadcrumb.styles";
import { paginationStyles } from "./components/pagination.styles";
import { chartStyles } from "./components/chart.styles";
import { formStyles } from "./components/form.styles";
import { commandPaletteStyles } from "./components/command-palette.styles";
import { treeViewStyles } from "./components/tree-view.styles";
import { tokenFieldStyles } from "./components/token-field.styles";
import { autocompleteStyles } from "./components/autocomplete.styles";
import { itemStyles } from "./components/item.styles";
import { toggleStyles } from "./components/toggle.styles";
import { segmentedControlStyles } from "./components/segmented-control.styles";
import { textShimmerStyles } from "./components/text-shimmer.styles";
import { riskConfirmationStyles } from "./components/risk-confirmation.styles";
import { codeHighlightStyles } from "./shared/code-highlight.styles";
import { fieldSurfaceStyles } from "./shared/field-surface.styles";
import { actionRowStyles } from "./shared/action-row.styles";
import { codeHighlightTokens } from "./shared/code-highlight.tokens";
import { chartTokens } from "./shared/chart.tokens";
import { statusDotStyles } from "./components/status-dot.styles";
import { statusStyles } from "./components/status.styles";
import { tagStyles } from "./components/tag.styles";
import { processGroupStyles } from "./components/process-group.styles";
import { workCardStyles } from "./components/work-card.styles";
import { iconRailStyles } from "./components/icon-rail.styles";
import { detailSectionStyles } from "./components/detail-section.styles";
import { timelineStyles } from "./components/timeline.styles";
import { entryStyles } from "./components/entry.styles";
import { resourceLinkStyles } from "./components/resource-link.styles";
import { pageHeaderStyles } from "./components/page-header.styles";
import { pageStyles } from "./components/page.styles";
import { sectionStyles } from "./components/section.styles";
import { navListStyles } from "./components/nav-list.styles";
import { modalStyles } from "./components/modal.styles";
import { listGroupStyles } from "./components/list-group.styles";
import { resourceCardStyles } from "./components/resource-card.styles";
import { drawerStyles } from "./components/drawer.styles";
import { windowTitleBarStyles } from "./components/window-title-bar.styles";
import { progressStyles } from "./components/progress.styles";
import { avatarStyles } from "./components/avatar.styles";
import { linkStyles } from "./components/link.styles";
import { textStyles } from "./components/text.styles";
import { taskListStyles } from "./components/task-list.styles";
import { chatReasoningStyles } from "./chat/reasoning.styles";
import { proseStyles } from "./shared/prose.styles";
import { tableStyles } from "./components/table.styles";
import { sliderStyles } from "./components/slider.styles";
import { numberInputStyles } from "./components/number-input.styles";
import { accordionStyles } from "./components/accordion.styles";
import { contextMenuStyles } from "./components/context-menu.styles";

export {
  standardOptions,
  standardUiTokenValues,
  uiTokens,
  chatTokens,
  logoTokens,
  type TokenValues,
  type UiTokenValues,
} from "./tokens";
export {
  journalFonts,
  journalUiTokenValues,
  journalUiTokens,
  type ThemeFont,
} from "./journal.tokens";
export { meowUiTokenValues, meowUiTokens } from "./meow.tokens";
export { ui, utilityStyles } from "./utilities";
export { chartTokens } from "./shared/chart.tokens";

export const standardThemeTokens = [
  uiTokens,
  chatTokens,
  alertTokens,
  codeHighlightTokens,
  chartTokens,
] as const;

export const standardThemeStyles = [
  // Shared foundations first: each family below overrides them.
  foundationStyles,
  // A global default: every family that rounds a circle overrides it.
  cornerShapeStyles,
  fieldSurfaceStyles,
  chatTaskStyles,
  statusDotStyles,
  statusStyles,
  tagStyles,
  processGroupStyles,
  workCardStyles,
  iconRailStyles,
  detailSectionStyles,
  timelineStyles,
  entryStyles,
  resourceLinkStyles,
  pageHeaderStyles,
  pageStyles,
  sectionStyles,
  navListStyles,
  modalStyles,
  listGroupStyles,
  resourceCardStyles,
  drawerStyles,
  windowTitleBarStyles,
  progressStyles,
  avatarStyles,
  linkStyles,
  textStyles,
  taskListStyles,
  tableStyles,
  numberInputStyles,
  contextMenuStyles,
  pillStyles,
  segmentedControlStyles,
  textShimmerStyles,
  riskConfirmationStyles,
  codeHighlightStyles,
  webBlockStyles,
  jsonStyles,
  imageLightboxStyles,
  popoverStyles,
  shortcutKeysStyles,
  pathLabelStyles,
  stateDotStyles,
  hoverCardStyles,
  menuStyles,
  toastStyles,
  outputBlockStyles,
  buttonStyles,
  actionRailStyles,
  metaRowStyles,
  dialogStyles,
  nativeInputStyles,
  fieldStyles,
  badgeStyles,
  separatorStyles,
  emptyStateStyles,
  navItemStyles,
  toggleStyles,
  sliderStyles,
  codeBlockStyles,
  mermaidDiagramStyles,
  itemStyles,
  toolbarStyles,
  tabsStyles,
  breadcrumbStyles,
  paginationStyles,
  chartStyles,
  formStyles,
  commandPaletteStyles,
  treeViewStyles,
  tokenFieldStyles,
  autocompleteStyles,
  alertStyles,
  skeletonStyles,
  spinnerStyles,
  layoutStyles,
  descriptionListStyles,
  pageFrameStyles,
  appBarStyles,
  regionLayoutStyles,
  cardStyles,
  fieldGroupStyles,
  choiceGroupStyles,
  tooltipStyles,
  choiceSelectStyles,
  chatHeaderStyles,
  chatStatusStyles,
  chatFrameStyles,
  chatMessageStyles,
  proseStyles,
  chatReasoningStyles,
  chatComposerStyles,
  composerPanelStyles,
  chatRecordsStyles,
  chatQuestionStyles,
  chatConversationStyles,
  chatAttachmentsStyles,
  imagePreviewStyles,
  iconsStyles,
  searchInputStyles,
  pathPickerStyles,
  disclosureStyles,
  accordionStyles,
  // One state badge across Status, tool rows and task headers, after the families that place it.
  stateBadgeStyles,
  // One fit rule for action rows, after the cards, dialogs and questions that hold them.
  actionRowStyles,
  // The complete Assistant composes the chat families above, so it follows them.
  assistantStyles,
  baseStyles,
  // The utility catalog follows every component rule so explicit className values remain overridable.
  utilityStyles,
] as const;

export const standardTheme = /* @__PURE__ */ defineTheme({
  options: standardOptions,
  defaults: { scheme: "auto" },
  tokens: standardThemeTokens,
  styles: standardThemeStyles,
});

/**
 * Journal, for blogs and long-form reading: every standard rule, painted with the Journal values of
 * the same `ui` roles. Mount it instead of `standardTheme`; components and markup do not change.
 */
export const journalThemeTokens = [
  journalUiTokens,
  chatTokens,
  alertTokens,
  codeHighlightTokens,
  chartTokens,
] as const;

export const journalTheme = /* @__PURE__ */ defineTheme({
  options: standardOptions,
  defaults: { scheme: "auto" },
  tokens: journalThemeTokens,
  styles: standardThemeStyles,
});

/**
 * Meow, after the Meowland mark: every standard rule, painted black with one red accent. Only the
 * colors differ from the standard theme. Mount it instead of `standardTheme`; components and
 * markup do not change.
 */
export const meowThemeTokens = [
  meowUiTokens,
  chatTokens,
  alertTokens,
  codeHighlightTokens,
  chartTokens,
] as const;

export const meowTheme = /* @__PURE__ */ defineTheme({
  options: standardOptions,
  defaults: { scheme: "auto" },
  tokens: meowThemeTokens,
  styles: standardThemeStyles,
});

/** The floor every Meowland region starts from; an extended theme places it first. */
export { foundationStyles as standardFoundationStyles } from "./base.styles";
export { standardAuditRules } from "./audit";

/**
 * The standard theme plus an application's own tokens and fragments, in the
 * order the cascade needs: the standard families first, then the host's, so a
 * host part never loses a tie to a library rule. One assembly keeps one token
 * identity; do not build a second theme from copied token objects.
 */
export function extendStandardTheme(extension: {
  tokens?: readonly (TokenSet | ScopedTokens)[];
  styles?: readonly CSSFragment[];
}) {
  return defineTheme({
    options: standardOptions,
    defaults: { scheme: "auto" },
    tokens: [...standardThemeTokens, ...(extension.tokens ?? [])],
    styles: [
      ...standardThemeStyles.filter((style) => style !== utilityStyles),
      ...(extension.styles ?? []),
      utilityStyles,
    ],
  });
}
