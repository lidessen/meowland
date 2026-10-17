import { defineTheme } from "meowcss/meowjsx";
import { assistantStyles } from "./chat/assistant.styles";
import { baseStyles, cornerShapeStyles } from "./base.styles";
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
import { choiceSelectStyles } from "./components/choice-select.styles";
import { tooltipStyles } from "./components/tooltip.styles";
import { alertStyles } from "./components/alert.styles";
import { toolbarStyles } from "./components/toolbar.styles";
import { chatAttachmentsStyles } from "./chat/attachments.styles";
import { fieldGroupStyles } from "./components/field-group.styles";
import { cardStyles } from "./components/card.styles";
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
import { chatRecordsStyles } from "./chat/records.styles";
import { codeBlockStyles } from "./components/code-block.styles";
import { layoutStyles } from "./components/layout.styles";
import { descriptionListStyles } from "./components/description-list.styles";
import { pageFrameStyles } from "./components/page-frame.styles";
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
import { itemStyles } from "./components/item.styles";
import { toggleStyles } from "./components/toggle.styles";
import { segmentedControlStyles } from "./components/segmented-control.styles";
import { textShimmerStyles } from "./components/text-shimmer.styles";
import { riskConfirmationStyles } from "./components/risk-confirmation.styles";
import { codeHighlightStyles } from "./shared/code-highlight.styles";
import { codeHighlightTokens } from "./shared/code-highlight.tokens";
import { accentTokens, statusTokens, radiusTokens, lineTokens, layerTokens } from "./palette";
import { statusDotStyles } from "./components/status-dot.styles";
import { statusStyles } from "./components/status.styles";
import { tagStyles } from "./components/tag.styles";
import { processGroupStyles } from "./components/process-group.styles";
import { workCardStyles } from "./components/work-card.styles";
import { iconRailStyles } from "./components/icon-rail.styles";
import { detailSectionStyles } from "./components/detail-section.styles";
import { timelineStyles } from "./components/timeline.styles";
import { resourceLinkStyles } from "./components/resource-link.styles";
import { pageHeaderStyles } from "./components/page-header.styles";
import { listGroupStyles } from "./components/list-group.styles";
import { resourceCardStyles } from "./components/resource-card.styles";
import { resourceCardTokens } from "./components/resource-card.tokens";
import { drawerStyles } from "./components/drawer.styles";
import { windowTitleBarStyles } from "./components/window-title-bar.styles";

export { standardOptions, uiTokens, chatTokens, logoTokens } from "./tokens";
export { accentTokens, statusTokens, radiusTokens, lineTokens, layerTokens } from "./palette";

export const standardTheme = defineTheme({
  options: standardOptions,
  defaults: { scheme: "auto" },
  tokens: [
    uiTokens,
    chatTokens,
    alertTokens,
    codeHighlightTokens,
    accentTokens,
    statusTokens,
    radiusTokens,
    lineTokens,
    layerTokens,
    resourceCardTokens,
  ],
  styles: [
    assistantStyles,
    statusDotStyles,
    statusStyles,
    tagStyles,
    processGroupStyles,
    workCardStyles,
    iconRailStyles,
    detailSectionStyles,
    timelineStyles,
    resourceLinkStyles,
    pageHeaderStyles,
    listGroupStyles,
    resourceCardStyles,
    drawerStyles,
    windowTitleBarStyles,
    pillStyles,
    cornerShapeStyles,
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
    dialogStyles,
    nativeInputStyles,
    fieldStyles,
    badgeStyles,
    separatorStyles,
    emptyStateStyles,
    navItemStyles,
    toggleStyles,
    codeBlockStyles,
    itemStyles,
    toolbarStyles,
    tabsStyles,
    breadcrumbStyles,
    alertStyles,
    skeletonStyles,
    spinnerStyles,
    layoutStyles,
    descriptionListStyles,
    pageFrameStyles,
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
    chatComposerStyles,
    chatRecordsStyles,
    chatQuestionStyles,
    chatConversationStyles,
    chatAttachmentsStyles,
    imagePreviewStyles,
    iconsStyles,
    searchInputStyles,
    pathPickerStyles,
    disclosureStyles,
    baseStyles,
  ],
});
