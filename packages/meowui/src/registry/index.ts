import { defaultRuntime, type ComponentContract, type Runtime, type RuntimePlugin } from "meowjsx";
import { pillContract } from "../components/pill";
import { pageFrameContract } from "../components/page-frame";
import { regionLayoutContract } from "../components/region-layout";
import { imagePreviewContract } from "../components/image-preview";
import { createStylePropsPlugin } from "meowcss/meowjsx";
import {
  segmentedControlContract,
  textShimmerContract,
  riskConfirmationContract,
  webBlockContract,
  jsonTreeContract,
  jsonBlockContract,
  imageLightboxContract,
  shortcutKeysContract,
  pathLabelContract,
  stateDotContract,
  hoverCardContract,
} from "../components";
import { menuContract, toastContract } from "../components";
import { outputBlockContract } from "../components/output-block";
import {
  terminalBlockContract,
  readBlockContract,
  diffBlockContract,
  searchBlockContract,
} from "../components";
import {
  codeBlockContract,
  itemContract,
  fieldGroupContract,
  tabsContract,
  breadcrumbContract,
  alertContract,
  skeletonContract,
  skeletonBoundaryContract,
  spinnerContract,
  stackContract,
  layoutItemContract,
  descriptionListContract,
  descriptionItemContract,
  inlineContract,
  gridContract,
  containerContract,
  cardHeaderContract,
  cardTitleContract,
  cardDescriptionContract,
  cardContentContract,
  cardFooterContract,
  cardActionContract,
  aspectRatioContract,
  tooltipContract,
  badgeContract,
  buttonContract,
  cardContract,
  dialogActionsContract,
  dialogContract,
  dialogHeaderContract,
  dialogPanelContract,
  emptyStateContract,
  fieldContract,
  iconButtonContract,
  toolbarContract,
  inputContract,
  checkboxContract,
  switchContract,
  selectContract,
  choiceSelectContract,
  choiceGroupContract,
  popoverContract,
  searchInputContract,
  pathPickerContract,
  disclosureContract,
  navItemContract,
  separatorContract,
  textareaContract,
  statusDotContract,
  tagContract,
  processGroupContract,
  processStepContract,
  workCardContract,
  iconRailContract,
  railItemContract,
  railSectionContract,
  detailSectionContract,
  timelineContract,
  timelineItemContract,
  resourceLinkContract,
  pageHeaderContract,
  windowTitleBarContract,
  listGroupContract,
  listRowContract,
  resourceCardContract,
  drawerContract,
} from "../components";
import {
  assistantViewContract,
  chatBubbleContract,
  chatConversationContract,
  chatAttachmentsContract,
  chatProcessContract,
  chatQuestionContract,
  chatSourcesContract,
  chatComposerContract,
  chatFrameContract,
  chatHeaderContract,
  chatMessageActionsContract,
  chatMessageContract,
  chatMessageListContract,
  chatStatusContract,
  chatToolCallContract,
} from "../chat";
import { assistantStepsContract } from "../chat/assistant-content";
import { assistantMarkdownContract } from "../chat/assistant-markdown";
import { assistantComposerContract } from "../chat/assistant-composer";
import { assistantQuestionContract } from "../chat/assistant-question";

export const MeowUIComponent = {
  PageFrame: pageFrameContract.name,
  RegionLayout: regionLayoutContract.name,
  Pill: pillContract.name,
  ImagePreview: imagePreviewContract.name,
  SegmentedControl: segmentedControlContract.name,
  TextShimmer: textShimmerContract.name,
  RiskConfirmation: riskConfirmationContract.name,
  WebBlock: webBlockContract.name,
  JsonTree: jsonTreeContract.name,
  JsonBlock: jsonBlockContract.name,
  ImageLightbox: imageLightboxContract.name,
  ShortcutKeys: shortcutKeysContract.name,
  PathLabel: pathLabelContract.name,
  StateDot: stateDotContract.name,
  HoverCard: hoverCardContract.name,
  Menu: menuContract.name,
  Toast: toastContract.name,
  TerminalBlock: terminalBlockContract.name,
  ReadBlock: readBlockContract.name,
  DiffBlock: diffBlockContract.name,
  SearchBlock: searchBlockContract.name,
  CodeBlock: codeBlockContract.name,
  Item: itemContract.name,
  ChatBubble: chatBubbleContract.name,
  ChatConversation: chatConversationContract.name,
  Tabs: tabsContract.name,
  Breadcrumb: breadcrumbContract.name,
  Alert: alertContract.name,
  Skeleton: skeletonContract.name,
  SkeletonBoundary: skeletonBoundaryContract.name,
  Spinner: spinnerContract.name,
  Stack: stackContract.name,
  LayoutItem: layoutItemContract.name,
  Inline: inlineContract.name,
  Grid: gridContract.name,
  Container: containerContract.name,
  CardHeader: cardHeaderContract.name,
  CardTitle: cardTitleContract.name,
  CardDescription: cardDescriptionContract.name,
  CardContent: cardContentContract.name,
  CardFooter: cardFooterContract.name,
  CardAction: cardActionContract.name,
  FieldGroup: fieldGroupContract.name,
  AspectRatio: aspectRatioContract.name,
  Tooltip: tooltipContract.name,
  Button: buttonContract.name,
  IconButton: iconButtonContract.name,
  Toolbar: toolbarContract.name,
  EmptyState: emptyStateContract.name,
  Card: cardContract.name,
  Badge: badgeContract.name,
  Input: inputContract.name,
  Checkbox: checkboxContract.name,
  Switch: switchContract.name,
  Select: selectContract.name,
  ChoiceSelect: choiceSelectContract.name,
  ChoiceGroup: choiceGroupContract.name,
  Popover: popoverContract.name,
  SearchInput: searchInputContract.name,
  PathPicker: pathPickerContract.name,
  Disclosure: disclosureContract.name,
  Textarea: textareaContract.name,
  Field: fieldContract.name,
  Separator: separatorContract.name,
  Dialog: dialogContract.name,
  DialogPanel: dialogPanelContract.name,
  DialogHeader: dialogHeaderContract.name,
  DialogActions: dialogActionsContract.name,
  NavItem: navItemContract.name,
  ChatFrame: chatFrameContract.name,
  AssistantView: assistantViewContract.name,
  ChatAttachments: chatAttachmentsContract.name,
  ChatProcess: chatProcessContract.name,
  ChatQuestion: chatQuestionContract.name,
  ChatSources: chatSourcesContract.name,
  ChatHeader: chatHeaderContract.name,
  ChatStatus: chatStatusContract.name,
  ChatMessageList: chatMessageListContract.name,
  ChatMessage: chatMessageContract.name,
  ChatMessageActions: chatMessageActionsContract.name,
  ChatComposer: chatComposerContract.name,
  ChatToolCall: chatToolCallContract.name,
  StatusDot: statusDotContract.name,
  Tag: tagContract.name,
  ProcessGroup: processGroupContract.name,
  ProcessStep: processStepContract.name,
  WorkCard: workCardContract.name,
  IconRail: iconRailContract.name,
  RailItem: railItemContract.name,
  RailSection: railSectionContract.name,
  DetailSection: detailSectionContract.name,
  DescriptionList: descriptionListContract.name,
  DescriptionItem: descriptionItemContract.name,
  Timeline: timelineContract.name,
  TimelineItem: timelineItemContract.name,
  ResourceLink: resourceLinkContract.name,
  PageHeader: pageHeaderContract.name,
  WindowTitleBar: windowTitleBarContract.name,
  ListGroup: listGroupContract.name,
  ListRow: listRowContract.name,
  ResourceCard: resourceCardContract.name,
  Drawer: drawerContract.name,
} as const;

export const meowUIComponents = [
  pageFrameContract,
  regionLayoutContract,
  pillContract,
  imagePreviewContract,
  segmentedControlContract,
  textShimmerContract,
  riskConfirmationContract,
  webBlockContract,
  jsonTreeContract,
  jsonBlockContract,
  imageLightboxContract,
  shortcutKeysContract,
  pathLabelContract,
  stateDotContract,
  hoverCardContract,
  menuContract,
  toastContract,
  outputBlockContract,
  terminalBlockContract,
  readBlockContract,
  diffBlockContract,
  searchBlockContract,
  checkboxContract,
  switchContract,
  codeBlockContract,
  choiceGroupContract,
  chatQuestionContract,
  itemContract,
  chatBubbleContract,
  chatConversationContract,
  tabsContract,
  breadcrumbContract,
  alertContract,
  skeletonContract,
  skeletonBoundaryContract,
  spinnerContract,
  stackContract,
  layoutItemContract,
  descriptionListContract,
  descriptionItemContract,
  inlineContract,
  gridContract,
  containerContract,
  cardHeaderContract,
  cardTitleContract,
  cardDescriptionContract,
  cardContentContract,
  cardFooterContract,
  cardActionContract,
  fieldGroupContract,
  aspectRatioContract,
  tooltipContract,
  buttonContract,
  iconButtonContract,
  toolbarContract,
  emptyStateContract,
  cardContract,
  badgeContract,
  inputContract,
  selectContract,
  choiceSelectContract,
  popoverContract,
  searchInputContract,
  pathPickerContract,
  disclosureContract,
  textareaContract,
  fieldContract,
  separatorContract,
  dialogContract,
  dialogPanelContract,
  dialogHeaderContract,
  dialogActionsContract,
  navItemContract,
  chatFrameContract,
  assistantViewContract,
  assistantStepsContract,
  assistantMarkdownContract,
  assistantComposerContract,
  assistantQuestionContract,
  chatAttachmentsContract,
  chatProcessContract,
  chatSourcesContract,
  chatHeaderContract,
  chatStatusContract,
  chatMessageListContract,
  chatMessageContract,
  chatMessageActionsContract,
  chatComposerContract,
  chatToolCallContract,
  statusDotContract,
  tagContract,
  processGroupContract,
  processStepContract,
  workCardContract,
  iconRailContract,
  railItemContract,
  railSectionContract,
  detailSectionContract,
  timelineContract,
  timelineItemContract,
  resourceLinkContract,
  pageHeaderContract,
  windowTitleBarContract,
  listGroupContract,
  listRowContract,
  resourceCardContract,
  drawerContract,
] as const satisfies readonly ComponentContract[];

declare module "meowjsx" {
  interface ComponentRegistryMap {
    "page-frame": { parts: (typeof pageFrameContract.parts)[number] };
    "region-layout": { parts: (typeof regionLayoutContract.parts)[number] };
    pill: { parts: "root" };
    "image-preview": { parts: (typeof imagePreviewContract.parts)[number] };
    "segmented-control": { parts: (typeof segmentedControlContract.parts)[number] };
    "text-shimmer": { parts: (typeof textShimmerContract.parts)[number] };
    "risk-confirmation": { parts: (typeof riskConfirmationContract.parts)[number] };
    "web-block": { parts: (typeof webBlockContract.parts)[number] };
    "json-tree": { parts: (typeof jsonTreeContract.parts)[number] };
    "json-block": { parts: (typeof jsonBlockContract.parts)[number] };
    "image-lightbox": { parts: (typeof imageLightboxContract.parts)[number] };
    "shortcut-keys": { parts: (typeof shortcutKeysContract.parts)[number] };
    "path-label": { parts: (typeof pathLabelContract.parts)[number] };
    "state-dot": { parts: (typeof stateDotContract.parts)[number] };
    "hover-card": { parts: (typeof hoverCardContract.parts)[number] };
    menu: { parts: (typeof menuContract.parts)[number] };
    toast: { parts: (typeof toastContract.parts)[number] };
    "output-block": { parts: (typeof outputBlockContract.parts)[number] };
    "terminal-block": { parts: (typeof terminalBlockContract.parts)[number] };
    "read-block": { parts: (typeof readBlockContract.parts)[number] };
    "diff-block": { parts: (typeof diffBlockContract.parts)[number] };
    "search-block": { parts: (typeof searchBlockContract.parts)[number] };
    "code-block": { parts: (typeof codeBlockContract.parts)[number] };
    tabs: { parts: (typeof tabsContract.parts)[number] };
    breadcrumb: { parts: (typeof breadcrumbContract.parts)[number] };
    alert: { parts: (typeof alertContract.parts)[number] };
    skeleton: { parts: "root" };
    "skeleton-boundary": { parts: (typeof skeletonBoundaryContract.parts)[number] };
    spinner: { parts: (typeof spinnerContract.parts)[number] };
    stack: { parts: "root" };
    "layout-item": { parts: "root" };
    inline: { parts: "root" };
    grid: { parts: "root" };
    container: { parts: "root" };
    "card-header": { parts: "root" };
    "card-title": { parts: "root" };
    "card-description": { parts: "root" };
    "card-content": { parts: "root" };
    "card-footer": { parts: "root" };
    "card-action": { parts: "root" };
    "field-group": { parts: (typeof fieldGroupContract.parts)[number] };
    "aspect-ratio": { parts: "root" };
    tooltip: { parts: (typeof tooltipContract.parts)[number] };
    "chat-sources": { parts: (typeof chatSourcesContract.parts)[number] };
    "chat-process": { parts: (typeof chatProcessContract.parts)[number] };
    "chat-question": { parts: (typeof chatQuestionContract.parts)[number] };
    button: { parts: (typeof buttonContract.parts)[number] };
    "icon-button": { parts: (typeof iconButtonContract.parts)[number] };
    toolbar: { parts: (typeof toolbarContract.parts)[number] };
    "empty-state": { parts: (typeof emptyStateContract.parts)[number] };
    card: { parts: "root" };
    badge: { parts: "root" };
    input: { parts: "root" };
    checkbox: { parts: (typeof checkboxContract.parts)[number] };
    switch: { parts: (typeof switchContract.parts)[number] };
    select: { parts: "root" };
    "choice-select": { parts: (typeof choiceSelectContract.parts)[number] };
    "choice-group": { parts: (typeof choiceGroupContract.parts)[number] };
    popover: { parts: (typeof popoverContract.parts)[number] };
    "search-input": { parts: (typeof searchInputContract.parts)[number] };
    "path-picker": { parts: (typeof pathPickerContract.parts)[number] };
    disclosure: { parts: (typeof disclosureContract.parts)[number] };
    textarea: { parts: "root" };
    field: { parts: (typeof fieldContract.parts)[number] };
    separator: { parts: "root" };
    dialog: { parts: "root" };
    "dialog-panel": { parts: (typeof dialogPanelContract.parts)[number] };
    "dialog-header": { parts: (typeof dialogHeaderContract.parts)[number] };
    "dialog-actions": { parts: "root" };
    item: { parts: (typeof itemContract.parts)[number] };
    "nav-item": { parts: (typeof navItemContract.parts)[number] };
    "chat-frame": { parts: "root" };
    "assistant-view": { parts: (typeof assistantViewContract.parts)[number] };
    "assistant-steps": { parts: (typeof assistantStepsContract.parts)[number] };
    "assistant-markdown": { parts: (typeof assistantMarkdownContract.parts)[number] };
    "assistant-composer": { parts: (typeof assistantComposerContract.parts)[number] };
    "assistant-question": { parts: (typeof assistantQuestionContract.parts)[number] };
    "chat-attachments": {
      parts: (typeof chatAttachmentsContract.parts)[number];
    };
    "chat-header": {
      parts: (typeof chatHeaderContract.parts)[number];
    };
    "chat-status": { parts: (typeof chatStatusContract.parts)[number] };
    "chat-message-list": {
      parts: (typeof chatMessageListContract.parts)[number];
    };
    "chat-bubble": { parts: (typeof chatBubbleContract.parts)[number] };
    "chat-conversation": { parts: (typeof chatConversationContract.parts)[number] };
    "chat-message": { parts: (typeof chatMessageContract.parts)[number] };
    "chat-message-actions": { parts: "root" };
    "chat-composer": {
      parts: (typeof chatComposerContract.parts)[number];
    };
    "chat-tool-call": { parts: (typeof chatToolCallContract.parts)[number] };
    "status-dot": { parts: (typeof statusDotContract.parts)[number] };
    tag: { parts: (typeof tagContract.parts)[number] };
    "process-group": { parts: (typeof processGroupContract.parts)[number] };
    "process-step": { parts: (typeof processStepContract.parts)[number] };
    "work-card": { parts: (typeof workCardContract.parts)[number] };
    "icon-rail": { parts: (typeof iconRailContract.parts)[number] };
    "rail-item": { parts: (typeof railItemContract.parts)[number] };
    "rail-section": { parts: (typeof railSectionContract.parts)[number] };
    "detail-section": { parts: (typeof detailSectionContract.parts)[number] };
    "description-list": { parts: (typeof descriptionListContract.parts)[number] };
    "description-item": { parts: (typeof descriptionItemContract.parts)[number] };
    timeline: { parts: (typeof timelineContract.parts)[number] };
    "timeline-item": { parts: (typeof timelineItemContract.parts)[number] };
    "resource-link": { parts: (typeof resourceLinkContract.parts)[number] };
    "page-header": { parts: (typeof pageHeaderContract.parts)[number] };
    "window-title-bar": { parts: (typeof windowTitleBarContract.parts)[number] };
    "list-group": { parts: (typeof listGroupContract.parts)[number] };
    "list-row": { parts: (typeof listRowContract.parts)[number] };
    "resource-card": { parts: (typeof resourceCardContract.parts)[number] };
    drawer: { parts: (typeof drawerContract.parts)[number] };
  }
}

export function createMeowUI(): RuntimePlugin {
  return { ...createStylePropsPlugin(), name: "meow-ui", components: meowUIComponents };
}

export function installMeowUI(runtime: Runtime = defaultRuntime): () => void {
  return runtime.use(createMeowUI());
}
