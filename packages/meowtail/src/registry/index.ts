import * as Components from "../components";
import * as Chat from "../chat";
import { AssistantComposer } from "../chat/assistant-composer";
import { AssistantMarkdown } from "../chat/assistant-markdown";
import { AssistantQuestionView } from "../chat/assistant-question";
import { AssistantSteps } from "../chat/assistant-content";
import { OutputBlock } from "../components/output-block";
import { RegionLayoutShell } from "../components/region-layout";
import type { RegisteredComponent } from "meowjsx";
export {
  createMeowUI,
  installMeowUI,
  type MeowUIOptions,
  type MeowUIRegisteredComponent,
} from "./factory";

export const MeowUIComponent = {
  PageFrame: "page-frame",
  AppBar: "app-bar",
  RegionLayout: "region-layout",
  Pill: "pill",
  ImagePreview: "image-preview",
  SegmentedControl: "segmented-control",
  TextShimmer: "text-shimmer",
  RiskConfirmation: "risk-confirmation",
  WebBlock: "web-block",
  JsonTree: "json-tree",
  JsonBlock: "json-block",
  ImageLightbox: "image-lightbox",
  ShortcutKeys: "shortcut-keys",
  PathLabel: "path-label",
  StateDot: "state-dot",
  HoverCard: "hover-card",
  Menu: "menu",
  ContextMenu: "context-menu",
  Toast: "toast",
  TerminalBlock: "terminal-block",
  ReadBlock: "read-block",
  DiffBlock: "diff-block",
  SearchBlock: "search-block",
  CodeBlock: "code-block",
  MermaidDiagram: "mermaid-diagram",
  Item: "item",
  ChatBubble: "chat-bubble",
  ChatConversation: "chat-conversation",
  Tabs: "tabs",
  Breadcrumb: "breadcrumb",
  Pagination: "pagination",
  Alert: "alert",
  Skeleton: "skeleton",
  SkeletonBoundary: "skeleton-boundary",
  Spinner: "spinner",
  Stack: "stack",
  LayoutItem: "layout-item",
  Inline: "inline",
  Grid: "grid",
  Container: "container",
  CardHeader: "card-header",
  CardTitle: "card-title",
  CardDescription: "card-description",
  CardContent: "card-content",
  CardFooter: "card-footer",
  CardAction: "card-action",
  FieldGroup: "field-group",
  AspectRatio: "aspect-ratio",
  Tooltip: "tooltip",
  Button: "button",
  IconButton: "icon-button",
  Toolbar: "toolbar",
  ActionRail: "action-rail",
  ActionRow: "action-row",
  MetaRow: "meta-row",
  EmptyState: "empty-state",
  Card: "card",
  Badge: "badge",
  Input: "input",
  NumberInput: "number-input",
  Checkbox: "checkbox",
  Switch: "switch",
  Slider: "slider",
  Progress: "progress",
  Avatar: "avatar",
  Link: "link",
  Text: "text",
  Prose: "prose",
  TaskList: "task-list",
  ChatReasoning: "chat-reasoning",
  Select: "select",
  ChoiceSelect: "choice-select",
  ChoiceGroup: "choice-group",
  Popover: "popover",
  SearchInput: "search-input",
  PathPicker: "path-picker",
  Disclosure: "disclosure",
  Accordion: "accordion",
  Table: "table",
  Textarea: "textarea",
  Field: "field",
  Separator: "separator",
  Dialog: "dialog",
  DialogPanel: "dialog-panel",
  DialogHeader: "dialog-header",
  DialogActions: "dialog-actions",
  NavItem: "nav-item",
  ChatFrame: "chat-frame",
  AssistantView: "assistant-view",
  ChatAttachments: "chat-attachments",
  ChatProcess: "chat-process",
  ChatQuestion: "chat-question",
  ChatSources: "chat-sources",
  ChatHeader: "chat-header",
  ChatStatus: "chat-status",
  ChatMessageList: "chat-message-list",
  ChatMessage: "chat-message",
  ChatMessageActions: "chat-message-actions",
  ChatComposer: "chat-composer",
  ComposerPanel: "composer-panel",
  ChatToolCall: "chat-tool-call",
  ChatTask: "chat-task",
  StatusDot: "status-dot",
  Status: "status",
  Tag: "tag",
  ProcessGroup: "process-group",
  ProcessStep: "process-step",
  WorkCard: "work-card",
  IconRail: "icon-rail",
  RailItem: "rail-item",
  RailSection: "rail-section",
  DetailSection: "detail-section",
  DescriptionList: "description-list",
  DescriptionItem: "description-item",
  Timeline: "timeline",
  TimelineItem: "timeline-item",
  EntryList: "entry-list",
  Entry: "entry",
  ResourceLink: "resource-link",
  Page: "page",
  PageHeader: "page-header",
  Section: "section",
  NavList: "nav-list",
  Modal: "modal",
  WindowTitleBar: "window-title-bar",
  ListGroup: "list-group",
  ListRow: "list-row",
  ResourceCard: "resource-card",
  Drawer: "drawer",
} as const satisfies Record<string, string>;

/** The full built-in catalog, separated from the selective plugin factory. */
export const meowUIComponents = [
  Components.PageFrame,
  Components.AppBar,
  RegionLayoutShell,
  Components.Pill,
  Components.ImagePreview,
  Components.SegmentedControl,
  Components.TextShimmer,
  Components.RiskConfirmation,
  Components.WebBlock,
  Components.JsonTree,
  Components.JsonBlock,
  Components.ImageLightbox,
  Components.ShortcutKeys,
  Components.PathLabel,
  Components.StateDot,
  Components.HoverCard,
  Components.Menu,
  Components.ContextMenu,
  Components.Toast,
  OutputBlock,
  Components.TerminalBlock,
  Components.ReadBlock,
  Components.DiffBlock,
  Components.SearchBlock,
  Components.Checkbox,
  Components.Switch,
  Components.Slider,
  Components.Progress,
  Components.Avatar,
  Components.Link,
  Components.Text,
  Components.Prose,
  Components.TaskList,
  Components.Accordion,
  Components.Table,
  Components.NumberInput,
  Components.CodeBlock,
  Components.MermaidDiagram,
  Components.ChoiceGroup,
  Chat.ChatQuestion,
  Components.Item,
  Chat.ChatBubble,
  Chat.ChatConversation,
  Components.Tabs,
  Components.Breadcrumb,
  Components.Pagination,
  Components.Alert,
  Components.Skeleton,
  Components.SkeletonBoundary,
  Components.Spinner,
  Components.Stack,
  Components.LayoutItem,
  Components.DescriptionList,
  Components.DescriptionItem,
  Components.Inline,
  Components.Grid,
  Components.Container,
  Components.CardHeader,
  Components.CardTitle,
  Components.CardDescription,
  Components.CardContent,
  Components.CardFooter,
  Components.CardAction,
  Components.FieldGroup,
  Components.AspectRatio,
  Components.Tooltip,
  Components.Button,
  Components.IconButton,
  Components.Toolbar,
  Components.ActionRail,
  Components.ActionRow,
  Components.MetaRow,
  Components.EmptyState,
  Components.Card,
  Components.Badge,
  Components.Input,
  Components.Select,
  Components.ChoiceSelect,
  Components.Popover,
  Components.SearchInput,
  Components.PathPicker,
  Components.Disclosure,
  Components.Textarea,
  Components.Field,
  Components.Separator,
  Components.Dialog,
  Components.DialogPanel,
  Components.DialogHeader,
  Components.DialogActions,
  Components.NavItem,
  Chat.ChatFrame,
  Chat.AssistantView,
  AssistantSteps,
  AssistantMarkdown,
  AssistantComposer,
  AssistantQuestionView,
  Chat.ChatAttachments,
  Chat.ChatProcess,
  Chat.ChatReasoning,
  Chat.ChatSources,
  Chat.ChatHeader,
  Chat.ChatStatus,
  Chat.ChatMessageList,
  Chat.ChatMessage,
  Chat.ChatMessageActions,
  Chat.ChatComposer,
  Chat.ComposerPanel,
  Chat.ChatToolCall,
  Chat.ChatTask,
  Components.StatusDot,
  Components.Status,
  Components.Tag,
  Components.ProcessGroup,
  Components.ProcessStep,
  Components.WorkCard,
  Components.IconRail,
  Components.RailItem,
  Components.RailSection,
  Components.DetailSection,
  Components.Timeline,
  Components.TimelineItem,
  Components.EntryList,
  Components.Entry,
  Components.ResourceLink,
  Components.Page,
  Components.PageHeader,
  Components.Section,
  Components.NavList,
  Components.Modal,
  Components.WindowTitleBar,
  Components.ListGroup,
  Components.ListRow,
  Components.ResourceCard,
  Components.Drawer,
] as const satisfies readonly RegisteredComponent[];

type ComponentParts<C> = C extends {
  readonly meta: { readonly parts: readonly (infer Part extends string)[] };
}
  ? Part
  : never;

declare module "meowjsx" {
  interface ComponentRegistryMap {
    "page-frame": { parts: ComponentParts<typeof import("../components/page-frame").PageFrame> };
    "app-bar": { parts: ComponentParts<typeof import("../components/app-bar").AppBar> };
    "region-layout": {
      parts: ComponentParts<typeof import("../components/region-layout").RegionLayoutShell>;
    };
    pill: { parts: ComponentParts<typeof import("../components/pill").Pill> };
    "image-preview": {
      parts: ComponentParts<typeof import("../components/image-preview").ImagePreview>;
    };
    "segmented-control": {
      parts: ComponentParts<typeof import("../components/segmented-control").SegmentedControl>;
    };
    "text-shimmer": {
      parts: ComponentParts<typeof import("../components/text-shimmer").TextShimmer>;
    };
    "risk-confirmation": {
      parts: ComponentParts<typeof import("../components/risk-confirmation").RiskConfirmation>;
    };
    "web-block": { parts: ComponentParts<typeof import("../components/web-block").WebBlock> };
    "json-tree": { parts: ComponentParts<typeof import("../components/json-tree").JsonTree> };
    "json-block": { parts: ComponentParts<typeof import("../components/json-block").JsonBlock> };
    "image-lightbox": {
      parts: ComponentParts<typeof import("../components/image-lightbox").ImageLightbox>;
    };
    "shortcut-keys": {
      parts: ComponentParts<typeof import("../components/shortcut-keys").ShortcutKeys>;
    };
    "path-label": { parts: ComponentParts<typeof import("../components/path-label").PathLabel> };
    "state-dot": { parts: ComponentParts<typeof import("../components/state-dot").StateDot> };
    "hover-card": { parts: ComponentParts<typeof import("../components/hover-card").HoverCard> };
    menu: { parts: ComponentParts<typeof import("../components/menu").Menu> };
    "context-menu": {
      parts: ComponentParts<typeof import("../components/context-menu").ContextMenu>;
    };
    toast: { parts: ComponentParts<typeof import("../components/toast").Toast> };
    "output-block": {
      parts: ComponentParts<typeof import("../components/output-block").OutputBlock>;
    };
    "terminal-block": {
      parts: ComponentParts<typeof import("../components/terminal-block").TerminalBlock>;
    };
    "read-block": { parts: ComponentParts<typeof import("../components/read-block").ReadBlock> };
    "diff-block": { parts: ComponentParts<typeof import("../components/diff-block").DiffBlock> };
    "search-block": {
      parts: ComponentParts<typeof import("../components/search-block").SearchBlock>;
    };
    "code-block": { parts: ComponentParts<typeof import("../components/code-block").CodeBlock> };
    "mermaid-diagram": {
      parts: ComponentParts<typeof import("../components/mermaid-diagram").MermaidDiagram>;
    };
    tabs: { parts: ComponentParts<typeof import("../components/tabs").Tabs> };
    breadcrumb: { parts: ComponentParts<typeof import("../components/breadcrumb").Breadcrumb> };
    pagination: { parts: ComponentParts<typeof import("../components/pagination").Pagination> };
    alert: { parts: ComponentParts<typeof import("../components/alert").Alert> };
    skeleton: { parts: ComponentParts<typeof import("../components/skeleton").Skeleton> };
    "skeleton-boundary": {
      parts: ComponentParts<typeof import("../components/skeleton-boundary").SkeletonBoundary>;
    };
    spinner: { parts: ComponentParts<typeof import("../components/spinner").Spinner> };
    stack: { parts: ComponentParts<typeof import("../components/stack").Stack> };
    "layout-item": { parts: ComponentParts<typeof import("../components/layout-item").LayoutItem> };
    inline: { parts: ComponentParts<typeof import("../components/inline").Inline> };
    grid: { parts: ComponentParts<typeof import("../components/grid").Grid> };
    container: { parts: ComponentParts<typeof import("../components/container").Container> };
    "card-header": { parts: ComponentParts<typeof import("../components/card-header").CardHeader> };
    "card-title": { parts: ComponentParts<typeof import("../components/card-title").CardTitle> };
    "card-description": {
      parts: ComponentParts<typeof import("../components/card-description").CardDescription>;
    };
    "card-content": {
      parts: ComponentParts<typeof import("../components/card-content").CardContent>;
    };
    "card-footer": { parts: ComponentParts<typeof import("../components/card-footer").CardFooter> };
    "card-action": { parts: ComponentParts<typeof import("../components/card-action").CardAction> };
    "field-group": { parts: ComponentParts<typeof import("../components/field-group").FieldGroup> };
    "aspect-ratio": {
      parts: ComponentParts<typeof import("../components/aspect-ratio").AspectRatio>;
    };
    tooltip: { parts: ComponentParts<typeof import("../components/tooltip").Tooltip> };
    button: { parts: ComponentParts<typeof import("../components/button").Button> };
    "icon-button": { parts: ComponentParts<typeof import("../components/icon-button").IconButton> };
    toolbar: { parts: ComponentParts<typeof import("../components/toolbar").Toolbar> };
    "action-rail": { parts: ComponentParts<typeof import("../components/action-rail").ActionRail> };
    "action-row": { parts: ComponentParts<typeof import("../components/action-row").ActionRow> };
    "meta-row": { parts: ComponentParts<typeof import("../components/meta-row").MetaRow> };
    "empty-state": { parts: ComponentParts<typeof import("../components/empty-state").EmptyState> };
    card: { parts: ComponentParts<typeof import("../components/card").Card> };
    badge: { parts: ComponentParts<typeof import("../components/badge").Badge> };
    input: { parts: ComponentParts<typeof import("../components/input").Input> };
    "number-input": {
      parts: ComponentParts<typeof import("../components/number-input").NumberInput>;
    };
    checkbox: { parts: ComponentParts<typeof import("../components/checkbox").Checkbox> };
    switch: { parts: ComponentParts<typeof import("../components/switch").Switch> };
    slider: { parts: ComponentParts<typeof import("../components/slider").Slider> };
    progress: { parts: ComponentParts<typeof import("../components/progress").Progress> };
    avatar: { parts: ComponentParts<typeof import("../components/avatar").Avatar> };
    link: { parts: ComponentParts<typeof import("../components/link").Link> };
    text: { parts: ComponentParts<typeof import("../components/text").Text> };
    prose: { parts: ComponentParts<typeof import("../components/prose").Prose> };
    "task-list": { parts: ComponentParts<typeof import("../components/task-list").TaskList> };
    "chat-reasoning": { parts: ComponentParts<typeof import("../chat/reasoning").ChatReasoning> };
    select: { parts: ComponentParts<typeof import("../components/select").Select> };
    "choice-select": {
      parts: ComponentParts<typeof import("../components/choice-select").ChoiceSelect>;
    };
    "choice-group": {
      parts: ComponentParts<typeof import("../components/choice-group").ChoiceGroup>;
    };
    popover: { parts: ComponentParts<typeof import("../components/popover").Popover> };
    "search-input": {
      parts: ComponentParts<typeof import("../components/search-input").SearchInput>;
    };
    "path-picker": { parts: ComponentParts<typeof import("../components/path-picker").PathPicker> };
    disclosure: { parts: ComponentParts<typeof import("../components/disclosure").Disclosure> };
    accordion: { parts: ComponentParts<typeof import("../components/accordion").Accordion> };
    table: { parts: ComponentParts<typeof import("../components/table").Table> };
    textarea: { parts: ComponentParts<typeof import("../components/textarea").Textarea> };
    field: { parts: ComponentParts<typeof import("../components/field").Field> };
    separator: { parts: ComponentParts<typeof import("../components/separator").Separator> };
    dialog: { parts: ComponentParts<typeof import("../components/dialog").Dialog> };
    "dialog-panel": { parts: ComponentParts<typeof import("../components/dialog").DialogPanel> };
    "dialog-header": { parts: ComponentParts<typeof import("../components/dialog").DialogHeader> };
    "dialog-actions": {
      parts: ComponentParts<typeof import("../components/dialog").DialogActions>;
    };
    "nav-item": { parts: ComponentParts<typeof import("../components/nav-item").NavItem> };
    "chat-frame": { parts: ComponentParts<typeof import("../chat/frame").ChatFrame> };
    "assistant-view": { parts: ComponentParts<typeof import("../chat/assistant").AssistantView> };
    "chat-attachments": {
      parts: ComponentParts<typeof import("../chat/attachments").ChatAttachments>;
    };
    "chat-process": { parts: ComponentParts<typeof import("../chat/process").ChatProcess> };
    "chat-question": { parts: ComponentParts<typeof import("../chat/question").ChatQuestion> };
    "chat-sources": { parts: ComponentParts<typeof import("../chat/sources").ChatSources> };
    "chat-header": { parts: ComponentParts<typeof import("../chat/header").ChatHeader> };
    "chat-status": { parts: ComponentParts<typeof import("../chat/status").ChatStatus> };
    "chat-message-list": {
      parts: ComponentParts<typeof import("../chat/message-list").ChatMessageList>;
    };
    "chat-message": { parts: ComponentParts<typeof import("../chat/message").ChatMessage> };
    "chat-message-actions": {
      parts: ComponentParts<typeof import("../chat/message-actions").ChatMessageActions>;
    };
    "chat-composer": { parts: ComponentParts<typeof import("../chat/composer").ChatComposer> };
    "composer-panel": {
      parts: ComponentParts<typeof import("../chat/composer-panel").ComposerPanel>;
    };
    "chat-tool-call": { parts: ComponentParts<typeof import("../chat/tool-call").ChatToolCall> };
    "chat-task": { parts: ComponentParts<typeof import("../chat/task").ChatTask> };
    "status-dot": { parts: ComponentParts<typeof import("../components/status-dot").StatusDot> };
    status: { parts: ComponentParts<typeof import("../components/status").Status> };
    tag: { parts: ComponentParts<typeof import("../components/tag").Tag> };
    "process-group": {
      parts: ComponentParts<typeof import("../components/process-group").ProcessGroup>;
    };
    "process-step": {
      parts: ComponentParts<typeof import("../components/process-step").ProcessStep>;
    };
    "work-card": { parts: ComponentParts<typeof import("../components/work-card").WorkCard> };
    "icon-rail": { parts: ComponentParts<typeof import("../components/icon-rail").IconRail> };
    "rail-item": { parts: ComponentParts<typeof import("../components/rail-item").RailItem> };
    "rail-section": {
      parts: ComponentParts<typeof import("../components/rail-section").RailSection>;
    };
    "detail-section": {
      parts: ComponentParts<typeof import("../components/detail-section").DetailSection>;
    };
    "description-list": {
      parts: ComponentParts<typeof import("../components/description-list").DescriptionList>;
    };
    "description-item": {
      parts: ComponentParts<typeof import("../components/description-list").DescriptionItem>;
    };
    timeline: { parts: ComponentParts<typeof import("../components/timeline").Timeline> };
    "timeline-item": {
      parts: ComponentParts<typeof import("../components/timeline").TimelineItem>;
    };
    "entry-list": { parts: ComponentParts<typeof import("../components/entry").EntryList> };
    entry: { parts: ComponentParts<typeof import("../components/entry").Entry> };
    "resource-link": {
      parts: ComponentParts<typeof import("../components/resource-link").ResourceLink>;
    };
    page: { parts: ComponentParts<typeof import("../components/page").Page> };
    "page-header": { parts: ComponentParts<typeof import("../components/page-header").PageHeader> };
    section: { parts: ComponentParts<typeof import("../components/section").Section> };
    "nav-list": { parts: ComponentParts<typeof import("../components/nav-list").NavList> };
    modal: { parts: ComponentParts<typeof import("../components/modal").Modal> };
    "window-title-bar": {
      parts: ComponentParts<typeof import("../components/window-title-bar").WindowTitleBar>;
    };
    "list-group": { parts: ComponentParts<typeof import("../components/list-group").ListGroup> };
    "list-row": { parts: ComponentParts<typeof import("../components/list-group").ListRow> };
    "resource-card": {
      parts: ComponentParts<typeof import("../components/resource-card").ResourceCard>;
    };
    drawer: { parts: ComponentParts<typeof import("../components/drawer").Drawer> };
  }
}
